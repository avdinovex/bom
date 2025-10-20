import express from 'express';
import UpcomingRide from '../models/UpcomingRide.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';

const router = express.Router();

// @route   GET /api/rides
// @desc    Get all upcoming rides (public)
// @access  Public
router.get('/', optionalAuth, validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, difficulty, minPrice, maxPrice, venue, search, featured } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { 
    isActive: true,
    startTime: { $gte: new Date() }
  };
  
  if (difficulty) filter.difficulty = difficulty;
  if (venue) filter.venue = { $regex: venue, $options: 'i' };
  if (featured === 'true') filter.isFeatured = true;
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice);
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'startTime', sortOrder || 'asc');

  // Execute queries
  const [rides, totalCount] = await Promise.all([
    UpcomingRide.find(filter)
      .populate('organizer', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    UpcomingRide.countDocuments(filter)
  ]);

  const result = getPaginationResult(rides, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Upcoming rides retrieved successfully'));
}));

// @route   GET /api/rides/:id
// @desc    Get single ride
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const ride = await UpcomingRide.findOne({ 
    _id: req.params.id, 
    isActive: true,
    startTime: { $gte: new Date() }
  })
    .populate('organizer', 'fullName email')
    .populate('riders', 'fullName experienceLevel');

  if (!ride) {
    return res.status(404).json({
      status: 'error',
      message: 'Ride not found or has already started'
    });
  }

  res.json(new ApiResponse(200, { ride }, 'Ride retrieved successfully'));
}));

// @route   GET /api/rides/featured/list
// @desc    Get featured rides
// @access  Public
router.get('/featured/list', asyncHandler(async (req, res) => {
  const rides = await UpcomingRide.find({ 
    isActive: true,
    isFeatured: true,
    startTime: { $gte: new Date() }
  })
    .populate('organizer', 'fullName')
    .sort({ startTime: 1 })
    .limit(6);

  res.json(new ApiResponse(200, { rides }, 'Featured rides retrieved successfully'));
}));

// @route   GET /api/rides/next
// @desc    Get the next upcoming ride for countdown
// @access  Public
router.get('/next/upcoming', asyncHandler(async (req, res) => {
  const nextRide = await UpcomingRide.findOne({ 
    isActive: true,
    startTime: { $gte: new Date() }
  })
    .populate('organizer', 'fullName')
    .sort({ startTime: 1 }); // Get the earliest upcoming ride

  if (!nextRide) {
    return res.json(new ApiResponse(200, { ride: null }, 'No upcoming rides found'));
  }

  res.json(new ApiResponse(200, { ride: nextRide }, 'Next ride retrieved successfully'));
}));

// @route   GET /api/rides/search/filters
// @desc    Get available filters for rides
// @access  Public
router.get('/search/filters', asyncHandler(async (req, res) => {
  const [difficulties, venues, priceRange] = await Promise.all([
    UpcomingRide.distinct('difficulty', { isActive: true, startTime: { $gte: new Date() } }),
    UpcomingRide.distinct('venue', { isActive: true, startTime: { $gte: new Date() } }),
    UpcomingRide.aggregate([
      { 
        $match: { 
          isActive: true, 
          startTime: { $gte: new Date() } 
        } 
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])
  ]);

  const filters = {
    difficulties,
    venues: venues.filter(v => v), // Remove null/empty venues
    priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
  };

  res.json(new ApiResponse(200, { filters }, 'Filters retrieved successfully'));
}));

export default router;