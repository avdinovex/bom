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
  const { page, limit, sortBy, sortOrder, department } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { isActive: true };
  if (department) filter.department = department;

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
// @desc    Get all departments
// @access  Public
router.get('/departments/list', asyncHandler(async (req, res) => {
  const departments = await TeamMember.distinct('department', { isActive: true });
  
  res.json(new ApiResponse(200, { departments }, 'Departments retrieved successfully'));
}));

// @route   GET /api/team/founders/list
// @desc    Get founders/leadership team
// @access  Public
router.get('/founders/list', asyncHandler(async (req, res) => {
  const founders = await TeamMember.find({ 
    isActive: true,
    isFounder: true
  })
    .sort({ displayOrder: 1 });

  res.json(new ApiResponse(200, { founders }, 'Founders retrieved successfully'));
}));

// @route   GET /api/team/leadership/list
// @desc    Get leadership team
// @access  Public
router.get('/leadership/list', asyncHandler(async (req, res) => {
  const leadership = await TeamMember.find({ 
    isActive: true,
    department: 'leadership'
  })
    .sort({ displayOrder: 1 });

  res.json(new ApiResponse(200, { leadership }, 'Leadership team retrieved successfully'));
}));

export default router;