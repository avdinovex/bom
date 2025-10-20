import express from 'express';
import CompletedRide from '../../models/CompletedRide.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';

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
router.post('/', asyncHandler(async (req, res) => {
  const rideData = { ...req.body, organizer: req.user._id };
  const ride = await CompletedRide.create(rideData);
  await ride.populate('organizer', 'fullName');
  res.status(201).json(new ApiResponse(201, { ride }, 'Completed ride created successfully'));
}));

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
router.put('/:id', asyncHandler(async (req, res) => {
  const ride = await CompletedRide.findByIdAndUpdate(req.params.id, req.body, { 
    new: true, 
    runValidators: true 
  }).populate('organizer', 'fullName');
  
  if (!ride) throw new ApiError(404, 'Completed ride not found');
  res.json(new ApiResponse(200, { ride }, 'Completed ride updated successfully'));
}));

// @route   DELETE /api/admin/completed-rides/:id
// @desc    Delete completed ride (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const ride = await CompletedRide.findByIdAndDelete(req.params.id);
  if (!ride) throw new ApiError(404, 'Completed ride not found');
  res.json(new ApiResponse(200, null, 'Completed ride deleted successfully'));
}));

export default router;