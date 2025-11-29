import express from 'express';
import User from '../../models/User.js';
import Booking from '../../models/Booking.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, role, isActive, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { primaryBike: { $regex: search, $options: 'i' } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'createdAt', sortOrder);

  // Execute queries
  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    User.countDocuments(filter)
  ]);

  const result = getPaginationResult(users, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Users retrieved successfully'));
}));


// @route   GET /api/admin/users/export
// @desc    Export all users (admin, no pagination)
// @access  Admin
router.get('/export', asyncHandler(async (req, res) => {
  // Build filter (optional: allow role, isActive, search as query params)
  const { role, isActive, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { primaryBike: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  res.json(new ApiResponse(200, users, 'All users exported successfully'));
}));

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin)
// @access  Admin
router.put('/:id', asyncHandler(async (req, res) => {
  const { fullName, email, role, isActive, primaryBike, experienceLevel, phone } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      throw new ApiError(400, 'Email is already taken');
    }
  }

  // Update fields
  if (fullName) user.fullName = fullName;
  if (email) user.email = email;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (primaryBike) user.primaryBike = primaryBike;
  if (experienceLevel) user.experienceLevel = experienceLevel;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json(new ApiResponse(200, { user }, 'User updated successfully'));
}));

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user has active bookings
  const activeBookings = await Booking.countDocuments({
    user: user._id,
    status: { $in: ['created', 'paid'] }
  });

  if (activeBookings > 0) {
    throw new ApiError(400, 'Cannot delete user with active bookings');
  }

  await user.deleteOne();

  res.json(new ApiResponse(200, null, 'User deleted successfully'));
}));

// @route   POST /api/admin/users/:id/deactivate
// @desc    Deactivate user (admin)
// @access  Admin
router.post('/:id/deactivate', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = false;
  await user.save();

  res.json(new ApiResponse(200, { user }, 'User deactivated successfully'));
}));

// @route   POST /api/admin/users/:id/activate
// @desc    Activate user (admin)
// @access  Admin
router.post('/:id/activate', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = true;
  await user.save();

  res.json(new ApiResponse(200, { user }, 'User activated successfully'));
}));

// @route   GET /api/admin/users/stats/overview
// @desc    Get user statistics (admin)
// @access  Admin
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
      }
    }
  ]);

  const experienceLevelStats = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$experienceLevel',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentUsers = await User.find()
    .select('fullName email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(new ApiResponse(200, {
    overview: stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      regularUsers: 0
    },
    experienceLevelStats,
    recentUsers
  }, 'User statistics retrieved successfully'));
}));

export default router;