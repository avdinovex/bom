import express from 'express';
import mongoose from 'mongoose';
import UpcomingRide from '../../models/UpcomingRide.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';
import { manualMigrateRides, getMigrationStats } from '../../services/rideMigrationService.js';

const router = express.Router();

// @route   GET /api/admin/rides
// @desc    Get all rides (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, difficulty, isActive, search, includeMigrated } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (difficulty) filter.difficulty = difficulty;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  // By default, exclude migrated rides unless specifically requested
  if (includeMigrated !== 'true') {
    filter.isActive = { $ne: false }; // Only show active rides
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'startTime', sortOrder);
  const [rides, totalCount] = await Promise.all([
    UpcomingRide.find(filter)
      .populate('organizer', 'fullName')
      .populate('riders', 'fullName email')
      .sort(sort).skip(skip).limit(limitNumber),
    UpcomingRide.countDocuments(filter)
  ]);

  const result = getPaginationResult(rides, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Rides retrieved successfully'));
}));

// @route   POST /api/admin/rides
// @desc    Create ride (admin)
// @access  Admin
router.post('/', uploadSingle('rideImage'), asyncHandler(async (req, res) => {
  const rideData = {
    title: req.body.title,
    slogan: req.body.slogan,
    venue: req.body.venue,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    price: parseFloat(req.body.price) || 0,
    currency: req.body.currency || 'INR',
    maxCapacity: parseInt(req.body.maxCapacity) || 50,
    description: req.body.description,
    difficulty: req.body.difficulty,
    distance: parseFloat(req.body.distance) || 0,
    isActive: req.body.isActive === 'true',
    isFeatured: req.body.isFeatured === 'true',
    organizer: req.user._id
  };
  
  // Parse route data if provided
  if (req.body.route) {
    try {
      rideData.route = JSON.parse(req.body.route);
    } catch (error) {
      rideData.route = { waypoints: [] };
    }
  }
  
  // Parse requirements if provided
  if (req.body.requirements) {
    try {
      rideData.requirements = JSON.parse(req.body.requirements);
    } catch (error) {
      rideData.requirements = [];
    }
  }
  
  // Add image URL if file was uploaded
  if (req.file && req.file.cloudinaryUrl) {
    rideData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const ride = await UpcomingRide.create(rideData);
  await ride.populate('organizer', 'fullName');
  res.status(201).json(new ApiResponse(201, { ride }, 'Ride created successfully'));
}));

// @route   GET /api/admin/rides/:id
// @desc    Get single ride (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const ride = await UpcomingRide.findById(req.params.id)
    .populate('organizer', 'fullName email')
    .populate('riders', 'fullName email experienceLevel');
  
  if (!ride) throw new ApiError(404, 'Ride not found');
  res.json(new ApiResponse(200, { ride }, 'Ride retrieved successfully'));
}));

// @route   PUT /api/admin/rides/:id
// @desc    Update ride (admin)
// @access  Admin
router.put('/:id', uploadSingle('rideImage'), asyncHandler(async (req, res) => {
  const existingRide = await UpcomingRide.findById(req.params.id);
  if (!existingRide) throw new ApiError(404, 'Ride not found');
  
  const updateData = {
    title: req.body.title,
    slogan: req.body.slogan,
    venue: req.body.venue,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    price: parseFloat(req.body.price) || 0,
    currency: req.body.currency || 'INR',
    maxCapacity: parseInt(req.body.maxCapacity) || 50,
    description: req.body.description,
    difficulty: req.body.difficulty,
    distance: parseFloat(req.body.distance) || 0,
    isActive: req.body.isActive === 'true',
    isFeatured: req.body.isFeatured === 'true'
  };
  
  // Parse route data if provided
  if (req.body.route) {
    try {
      updateData.route = JSON.parse(req.body.route);
    } catch (error) {
      updateData.route = { waypoints: [] };
    }
  }
  
  // Parse requirements if provided
  if (req.body.requirements) {
    try {
      updateData.requirements = JSON.parse(req.body.requirements);
    } catch (error) {
      updateData.requirements = [];
    }
  }
  
  // Handle image update
  if (req.file && req.file.cloudinaryUrl) {
    // Delete old image if it exists and is from cloudinary
    if (existingRide.imgUrl && existingRide.imgUrl.includes('cloudinary')) {
      try {
        await deleteFromCloudinary(existingRide.imgUrl);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    updateData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const ride = await UpcomingRide.findByIdAndUpdate(req.params.id, updateData, { 
    new: true, 
    runValidators: true 
  }).populate('organizer', 'fullName');
  
  res.json(new ApiResponse(200, { ride }, 'Ride updated successfully'));
}));

// @route   DELETE /api/admin/rides/:id
// @desc    Delete ride (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const ride = await UpcomingRide.findById(req.params.id);
  if (!ride) throw new ApiError(404, 'Ride not found');
  
  // Check if there are any bookings
  const bookingCount = await mongoose.model('Booking').countDocuments({ 
    ride: ride._id, 
    status: { $in: ['created', 'paid'] } 
  });
  
  if (bookingCount > 0) {
    throw new ApiError(400, 'Cannot delete ride with active bookings');
  }
  
  // Delete image from cloudinary if it exists
  if (ride.imgUrl && ride.imgUrl.includes('cloudinary')) {
    try {
      await deleteFromCloudinary(ride.imgUrl);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  
  await ride.deleteOne();
  res.json(new ApiResponse(200, null, 'Ride deleted successfully'));
}));

// @route   POST /api/admin/rides/migrate
// @desc    Manually trigger ride migration from upcoming to completed
// @access  Admin
router.post('/migrate', asyncHandler(async (req, res) => {
  const result = await manualMigrateRides();
  
  const message = result.migratedCount > 0 
    ? `Successfully migrated ${result.migratedCount} ride(s) to completed`
    : 'No expired rides found to migrate';
    
  res.json(new ApiResponse(200, result, message));
}));

// @route   GET /api/admin/rides/migration-stats
// @desc    Get ride migration statistics
// @access  Admin
router.get('/migration-stats', asyncHandler(async (req, res) => {
  const stats = await getMigrationStats();
  res.json(new ApiResponse(200, stats, 'Migration stats retrieved successfully'));
}));

// @route   POST /api/admin/rides/create-test-expired
// @desc    Create a test ride with past date (for testing migration)
// @access  Admin
router.post('/create-test-expired', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    throw new ApiError(403, 'Test endpoints not available in production');
  }

  const testRideData = {
    title: `Test Expired Ride - ${new Date().getTime()}`,
    slogan: 'Test ride for migration',
    venue: 'Test Venue',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    endTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    price: 100,
    maxCapacity: 20,
    description: 'Test ride created for migration testing',
    difficulty: 'Easy',
    distance: 50,
    isActive: true,
    organizer: req.user._id
  };

  const ride = await UpcomingRide.create(testRideData);
  res.status(201).json(new ApiResponse(201, { ride }, 'Test expired ride created successfully'));
}));

export default router;