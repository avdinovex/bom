import express from 'express';
import CompletedRide from '../models/CompletedRide.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';

const router = express.Router();

// @route   GET /api/completed-rides
// @desc    Get all completed rides (public)
// @access  Public
router.get('/', optionalAuth, validate(schemas.completedRideQuery, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, difficulty, search, featured } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { isPublished: true };
  if (difficulty) filter.difficulty = difficulty;
  if (featured === 'true') filter.isFeatured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'date', sortOrder);

  // Execute queries
  const [rides, totalCount] = await Promise.all([
    CompletedRide.find(filter)
      .populate('organizer', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    CompletedRide.countDocuments(filter)
  ]);

  const result = getPaginationResult(rides, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Completed rides retrieved successfully'));
}));

// @route   GET /api/completed-rides/:id
// @desc    Get single completed ride
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const ride = await CompletedRide.findOne({ 
    _id: req.params.id, 
    isPublished: true 
  }).populate('organizer', 'fullName email');

  if (!ride) {
    return res.status(404).json({
      status: 'error',
      message: 'Completed ride not found'
    });
  }

  res.json(new ApiResponse(200, { ride }, 'Completed ride retrieved successfully'));
}));

// @route   GET /api/completed-rides/featured/list
// @desc    Get featured completed rides
// @access  Public
router.get('/featured/list', asyncHandler(async (req, res) => {
  const rides = await CompletedRide.find({ 
    isPublished: true,
    isFeatured: true
  })
    .populate('organizer', 'fullName')
    .sort({ date: -1 })
    .limit(6);

  res.json(new ApiResponse(200, { rides }, 'Featured completed rides retrieved successfully'));
}));

// @route   GET /api/completed-rides/recent/list
// @desc    Get recent completed rides
// @access  Public
router.get('/recent/list', asyncHandler(async (req, res) => {
  const rides = await CompletedRide.find({ isPublished: true })
    .populate('organizer', 'fullName')
    .sort({ date: -1 })
    .limit(6);

  res.json(new ApiResponse(200, { rides }, 'Recent completed rides retrieved successfully'));
}));

export default router;