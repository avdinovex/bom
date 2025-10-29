import express from 'express';
import TeamMember from '../models/TeamMember.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';

const router = express.Router();

// @route   GET /api/team
// @desc    Get all team members (public)
// @access  Public
router.get('/', optionalAuth, validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, memberType } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { isActive: true };
  if (memberType) filter.memberType = memberType;

  // Get sort options (default sort by display order, then by name)
  const sort = getSortOptions(sortBy || 'displayOrder', sortOrder || 'asc');

  // Execute queries
  const [teamMembers, totalCount] = await Promise.all([
    TeamMember.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    TeamMember.countDocuments(filter)
  ]);

  const result = getPaginationResult(teamMembers, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Team members retrieved successfully'));
}));

// @route   GET /api/team/:id
// @desc    Get single team member
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findOne({ 
    _id: req.params.id, 
    isActive: true 
  });

  if (!teamMember) {
    return res.status(404).json({
      status: 'error',
      message: 'Team member not found'
    });
  }

  res.json(new ApiResponse(200, { teamMember }, 'Team member retrieved successfully'));
}));

// @route   GET /api/team/departments/list
// @desc    Get all member types
// @access  Public
router.get('/types/list', asyncHandler(async (req, res) => {
  const types = await TeamMember.distinct('memberType', { isActive: true });
  
  res.json(new ApiResponse(200, { types }, 'Member types retrieved successfully'));
}));

// @route   GET /api/team/core/list
// @desc    Get core team members
// @access  Public
router.get('/core/list', asyncHandler(async (req, res) => {
  const coreMembers = await TeamMember.find({ 
    isActive: true,
    memberType: 'core'
  })
    .sort({ displayOrder: 1 });

  res.json(new ApiResponse(200, { coreMembers }, 'Core team members retrieved successfully'));
}));

// @route   GET /api/team/riders/list
// @desc    Get riders
// @access  Public
router.get('/riders/list', asyncHandler(async (req, res) => {
  const riders = await TeamMember.find({ 
    isActive: true,
    memberType: 'rider'
  })
    .sort({ displayOrder: 1 });

  res.json(new ApiResponse(200, { riders }, 'Riders retrieved successfully'));
}));

// @route   GET /api/team/leadership/list
// @desc    Get leadership team
// @access  Public
router.get('/leadership/list', asyncHandler(async (req, res) => {
  const leadership = await TeamMember.find({ 
    isActive: true,
    isLeadership: true
  })
    .sort({ displayOrder: 1 });

  res.json(new ApiResponse(200, { leadership }, 'Leadership team retrieved successfully'));
}));

export default router;