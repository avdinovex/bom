import express from 'express';
import Booking from '../../models/Booking.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';

const router = express.Router();

// @route   GET /api/admin/bookings
// @desc    Get all bookings (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, status, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    // Search by booking number or user email
    filter.$or = [
      { bookingNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'createdAt', sortOrder);
  const [bookings, totalCount] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'fullName email')
      .populate('ride', 'title venue startTime')
      .sort(sort).skip(skip).limit(limitNumber),
    Booking.countDocuments(filter)
  ]);

  const result = getPaginationResult(bookings, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Bookings retrieved successfully'));
}));

// @route   GET /api/admin/bookings/:id
// @desc    Get single booking (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'fullName email phone experienceLevel')
    .populate('ride', 'title venue startTime endTime difficulty maxCapacity');
  
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json(new ApiResponse(200, { booking }, 'Booking retrieved successfully'));
}));

// @route   GET /api/admin/bookings/stats/overview
// @desc    Get booking statistics (admin)
// @access  Admin
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const monthlyStats = await Booking.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const recentBookings = await Booking.find()
    .populate('user', 'fullName email')
    .populate('ride', 'title venue')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(new ApiResponse(200, {
    statusStats: stats,
    monthlyStats,
    recentBookings
  }, 'Booking statistics retrieved successfully'));
}));

// @route   PUT /api/admin/bookings/:id
// @desc    Update booking information (admin)
// @access  Admin
router.put('/:id', asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Extract update fields
  const allowedUpdates = ['status', 'amount'];
  const updates = {};
  
  // Handle direct field updates
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Handle nested personalInfo updates
  if (req.body['personalInfo.fullName']) {
    booking.personalInfo.fullName = req.body['personalInfo.fullName'];
  }
  if (req.body['personalInfo.email']) {
    booking.personalInfo.email = req.body['personalInfo.email'];
  }
  if (req.body['personalInfo.contactNumber']) {
    booking.personalInfo.contactNumber = req.body['personalInfo.contactNumber'];
  }

  // Apply direct updates
  Object.assign(booking, updates);

  // Add timestamps based on status changes
  if (updates.status === 'cancelled') {
    booking.cancelledAt = new Date();
  }
  
  await booking.save();

  // Populate for response
  await booking.populate('user', 'fullName email phone experienceLevel');
  await booking.populate('ride', 'title venue startTime endTime difficulty maxCapacity');

  res.json(new ApiResponse(200, { booking }, 'Booking updated successfully'));
}));

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete booking (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  await Booking.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, null, 'Booking deleted successfully'));
}));

// @route   POST /api/admin/bookings/:id/refund
// @desc    Process refund for booking (admin)
// @access  Admin
router.post('/:id/refund', asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.status !== 'paid' && booking.status !== 'confirmed') {
    throw new ApiError(400, 'Can only refund paid or confirmed bookings');
  }

  if (booking.refundAmount > 0) {
    throw new ApiError(400, 'Booking has already been refunded');
  }

  // Update booking with refund information
  booking.status = 'refunded';
  booking.refundAmount = booking.amount;
  booking.refundedAt = new Date();
  
  await booking.save();

  // Here you would integrate with Razorpay refund API
  // For now, we'll just update the status

  await booking.populate('user', 'fullName email phone experienceLevel');
  await booking.populate('ride', 'title venue startTime endTime difficulty maxCapacity');

  res.json(new ApiResponse(200, { booking }, 'Refund processed successfully'));
}));

export default router;