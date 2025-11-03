import express from 'express';
import Coupon from '../../models/Coupon.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';

const router = express.Router();

// @route   GET /api/admin/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, isActive, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'createdAt', sortOrder || 'desc');

  // Execute queries
  const [coupons, totalCount] = await Promise.all([
    Coupon.find(filter)
      .populate('createdBy', 'fullName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Coupon.countDocuments(filter)
  ]);

  // Add virtual fields to response
  const couponsWithStatus = coupons.map(coupon => ({
    ...coupon.toObject({ virtuals: true }),
    _id: coupon._id,
    id: coupon._id
  }));

  const result = getPaginationResult(couponsWithStatus, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Coupons retrieved successfully'));
}));

// @route   GET /api/admin/coupons/stats
// @desc    Get coupon statistics
// @access  Private/Admin
router.get('/stats', asyncHandler(async (req, res) => {
  const now = new Date();
  
  const [totalCoupons, activeCoupons, expiredCoupons, usedCoupons] = await Promise.all([
    Coupon.countDocuments(),
    Coupon.countDocuments({ isActive: true, expiryDate: { $gte: now } }),
    Coupon.countDocuments({ expiryDate: { $lt: now } }),
    Coupon.countDocuments({ usedCount: { $gt: 0 } })
  ]);

  const stats = {
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    usedCoupons,
    availableCoupons: activeCoupons
  };

  res.json(new ApiResponse(200, { stats }, 'Coupon statistics retrieved successfully'));
}));

// @route   GET /api/admin/coupons/:id
// @desc    Get single coupon
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('usedBy.user', 'fullName email')
    .populate('usedBy.booking', 'bookingNumber amount');

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.json(new ApiResponse(200, { 
    coupon: {
      ...coupon.toObject({ virtuals: true }),
      _id: coupon._id,
      id: coupon._id
    }
  }, 'Coupon retrieved successfully'));
}));

// @route   POST /api/admin/coupons
// @desc    Create new coupon
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    applicableFor,
    minGroupSize,
    maxGroupSize,
    isActive
  } = req.body;

  // Validate required fields
  if (!code || !discountType || !discountValue || !expiryDate || !usageLimit) {
    throw new ApiError(400, 'Please provide all required fields: code, discountType, discountValue, expiryDate, usageLimit');
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists');
  }

  // Validate discount value
  if (discountType === 'percentage' && discountValue > 100) {
    throw new ApiError(400, 'Percentage discount cannot exceed 100%');
  }

  if (discountValue <= 0) {
    throw new ApiError(400, 'Discount value must be greater than 0');
  }

  // Validate expiry date
  if (new Date(expiryDate) <= new Date()) {
    throw new ApiError(400, 'Expiry date must be in the future');
  }

  // Validate group size constraints
  if (minGroupSize !== undefined && minGroupSize !== null && minGroupSize < 2) {
    throw new ApiError(400, 'Minimum group size must be at least 2');
  }

  if (maxGroupSize !== undefined && maxGroupSize !== null && minGroupSize !== undefined && minGroupSize !== null) {
    if (maxGroupSize < minGroupSize) {
      throw new ApiError(400, 'Maximum group size must be greater than or equal to minimum group size');
    }
  }

  // Create coupon
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscount,
    expiryDate,
    usageLimit,
    applicableFor: applicableFor || 'all',
    minGroupSize: minGroupSize !== undefined ? minGroupSize : null,
    maxGroupSize: maxGroupSize !== undefined ? maxGroupSize : null,
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user._id
  });

  const populatedCoupon = await Coupon.findById(coupon._id).populate('createdBy', 'fullName email');

  res.status(201).json(new ApiResponse(201, { 
    coupon: {
      ...populatedCoupon.toObject({ virtuals: true }),
      _id: populatedCoupon._id,
      id: populatedCoupon._id
    }
  }, 'Coupon created successfully'));
}));

// @route   PUT /api/admin/coupons/:id
// @desc    Update coupon
// @access  Private/Admin
router.put('/:id', asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    applicableFor,
    minGroupSize,
    maxGroupSize,
    isActive
  } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  // If code is being changed, check if new code already exists
  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      throw new ApiError(400, 'Coupon code already exists');
    }
    coupon.code = code.toUpperCase();
  }

  // Validate discount value if being changed
  if (discountValue !== undefined) {
    if (discountValue <= 0) {
      throw new ApiError(400, 'Discount value must be greater than 0');
    }
    if (discountType === 'percentage' && discountValue > 100) {
      throw new ApiError(400, 'Percentage discount cannot exceed 100%');
    }
    coupon.discountValue = discountValue;
  }

  // Validate expiry date if being changed
  if (expiryDate && new Date(expiryDate) <= new Date()) {
    throw new ApiError(400, 'Expiry date must be in the future');
  }

  // Validate group size constraints
  if (minGroupSize !== undefined && minGroupSize !== null && minGroupSize < 2) {
    throw new ApiError(400, 'Minimum group size must be at least 2');
  }

  if (maxGroupSize !== undefined && maxGroupSize !== null && minGroupSize !== undefined && minGroupSize !== null) {
    if (maxGroupSize < minGroupSize) {
      throw new ApiError(400, 'Maximum group size must be greater than or equal to minimum group size');
    }
  }

  // Update fields
  if (description !== undefined) coupon.description = description;
  if (discountType) coupon.discountType = discountType;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (expiryDate) coupon.expiryDate = expiryDate;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (applicableFor) coupon.applicableFor = applicableFor;
  if (minGroupSize !== undefined) coupon.minGroupSize = minGroupSize;
  if (maxGroupSize !== undefined) coupon.maxGroupSize = maxGroupSize;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();

  const updatedCoupon = await Coupon.findById(coupon._id).populate('createdBy', 'fullName email');

  res.json(new ApiResponse(200, { 
    coupon: {
      ...updatedCoupon.toObject({ virtuals: true }),
      _id: updatedCoupon._id,
      id: updatedCoupon._id
    }
  }, 'Coupon updated successfully'));
}));

// @route   DELETE /api/admin/coupons/:id
// @desc    Delete coupon
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  // Check if coupon has been used
  if (coupon.usedCount > 0) {
    throw new ApiError(400, 'Cannot delete coupon that has been used. You can deactivate it instead.');
  }

  await coupon.deleteOne();

  res.json(new ApiResponse(200, null, 'Coupon deleted successfully'));
}));

// @route   PATCH /api/admin/coupons/:id/toggle
// @desc    Toggle coupon active status
// @access  Private/Admin
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  const updatedCoupon = await Coupon.findById(coupon._id).populate('createdBy', 'fullName email');

  res.json(new ApiResponse(200, { 
    coupon: {
      ...updatedCoupon.toObject({ virtuals: true }),
      _id: updatedCoupon._id,
      id: updatedCoupon._id
    }
  }, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`));
}));

export default router;
