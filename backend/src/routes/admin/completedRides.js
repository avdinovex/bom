import express from 'express';
import CompletedRide from '../../models/CompletedRide.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import { uploadFields, uploadRemoteToCloudinary } from '../../services/uploadService.js';

const router = express.Router();

// @route   GET /api/admin/completed-rides
// @desc    Get all completed rides (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, isPublished, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'date', sortOrder);
  const [rides, totalCount] = await Promise.all([
    CompletedRide.find(filter).populate('organizer', 'fullName').sort(sort).skip(skip).limit(limitNumber),
    CompletedRide.countDocuments(filter)
  ]);

  const result = getPaginationResult(rides, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Completed rides retrieved successfully'));
}));

// @route   POST /api/admin/completed-rides
// @desc    Create completed ride (admin)
// @access  Admin
router.post('/',
  uploadFields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  asyncHandler(async (req, res) => {
    // Build data from multipart/form-data with proper types
    const rideData = {
      title: req.body.title,
      details: req.body.details,
      date: req.body.date ? new Date(req.body.date) : undefined,
      venue: req.body.venue,
      distance: req.body.distance ? parseFloat(req.body.distance) : undefined,
      duration: req.body.duration,
      participants: req.body.participants ? parseInt(req.body.participants) : 0,
      difficulty: req.body.difficulty,
      weather: req.body.weather,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      organizer: req.user._id
    };

    // Parse arrays/objects if sent as JSON strings
    if (req.body.highlights) {
      try { rideData.highlights = JSON.parse(req.body.highlights); } catch { /* ignore */ }
    }
    if (req.body.tags) {
      try { rideData.tags = JSON.parse(req.body.tags); } catch { /* ignore */ }
    }
    if (req.body.route) {
      try { rideData.route = JSON.parse(req.body.route); } catch { /* ignore */ }
    }
    if (req.body.stats) {
      try { rideData.stats = JSON.parse(req.body.stats); } catch { /* ignore */ }
    }

    // Images: cover image and gallery
    if (req.uploadedFile?.url) {
      rideData.imgUrl = req.uploadedFile.url;
    } else if (req.body.imgUrl && /^https?:\/\//i.test(req.body.imgUrl)) {
      // If absolute URL provided, mirror to Cloudinary
      const uploaded = await uploadRemoteToCloudinary(req.body.imgUrl, { folder: 'ride-booking/coverImage' });
      rideData.imgUrl = uploaded.secure_url;
    }
    if (Array.isArray(req.uploadedFiles) && req.uploadedFiles.length > 0) {
      rideData.gallery = req.uploadedFiles.map(f => f.url);
    }

    const ride = await CompletedRide.create(rideData);
    await ride.populate('organizer', 'fullName');
    res.status(201).json(new ApiResponse(201, { ride }, 'Completed ride created successfully'));
  })
);

// @route   GET /api/admin/completed-rides/:id
// @desc    Get single completed ride (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const ride = await CompletedRide.findById(req.params.id).populate('organizer', 'fullName email');
  if (!ride) throw new ApiError(404, 'Completed ride not found');
  res.json(new ApiResponse(200, { ride }, 'Completed ride retrieved successfully'));
}));

// @route   PUT /api/admin/completed-rides/:id
// @desc    Update completed ride (admin)
// @access  Admin
router.put('/:id',
  uploadFields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  asyncHandler(async (req, res) => {
    const existing = await CompletedRide.findById(req.params.id);
    if (!existing) throw new ApiError(404, 'Completed ride not found');

    const updateData = {
      title: req.body.title ?? existing.title,
      details: req.body.details ?? existing.details,
      date: req.body.date ? new Date(req.body.date) : existing.date,
      venue: req.body.venue ?? existing.venue,
      distance: req.body.distance !== undefined ? parseFloat(req.body.distance) : existing.distance,
      duration: req.body.duration ?? existing.duration,
      participants: req.body.participants !== undefined ? parseInt(req.body.participants) : existing.participants,
      difficulty: req.body.difficulty ?? existing.difficulty,
      weather: req.body.weather ?? existing.weather,
      isPublished: req.body.isPublished !== undefined ? (req.body.isPublished === 'true' || req.body.isPublished === true) : existing.isPublished,
      isFeatured: req.body.isFeatured !== undefined ? (req.body.isFeatured === 'true' || req.body.isFeatured === true) : existing.isFeatured
    };

    if (req.body.highlights) {
      try { updateData.highlights = JSON.parse(req.body.highlights); } catch { /* ignore */ }
    }
    if (req.body.tags) {
      try { updateData.tags = JSON.parse(req.body.tags); } catch { /* ignore */ }
    }
    if (req.body.route) {
      try { updateData.route = JSON.parse(req.body.route); } catch { /* ignore */ }
    }
    if (req.body.stats) {
      try { updateData.stats = JSON.parse(req.body.stats); } catch { /* ignore */ }
    }

    // Handle images
    if (req.uploadedFile?.url) {
      updateData.imgUrl = req.uploadedFile.url;
    } else if (req.body.imgUrl && /^https?:\/\//i.test(req.body.imgUrl)) {
      const uploaded = await uploadRemoteToCloudinary(req.body.imgUrl, { folder: 'ride-booking/coverImage' });
      updateData.imgUrl = uploaded.secure_url;
    }
    if (Array.isArray(req.uploadedFiles) && req.uploadedFiles.length > 0) {
      // Merge new gallery images with existing ones
      updateData.gallery = [...(existing.gallery || []), ...req.uploadedFiles.map(f => f.url)];
    }

    const ride = await CompletedRide.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('organizer', 'fullName');

    res.json(new ApiResponse(200, { ride }, 'Completed ride updated successfully'));
  })
);

// @route   DELETE /api/admin/completed-rides/:id
// @desc    Delete completed ride (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const ride = await CompletedRide.findByIdAndDelete(req.params.id);
  if (!ride) throw new ApiError(404, 'Completed ride not found');
  res.json(new ApiResponse(200, null, 'Completed ride deleted successfully'));
}));

export default router;