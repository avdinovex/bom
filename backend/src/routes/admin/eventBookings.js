import express from 'express';
import EventBooking from '../../models/EventBooking.js';
import Event from '../../models/Event.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/admin/event-bookings
// @desc    Get all event bookings for admin
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    eventId,
    bookingType,
    search,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;
  
  const { skip, limit: limitNumber } = getPagination(page, limit);
  const sort = getSortOptions(sortBy, sortOrder);

  // Build filter
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (eventId) {
    filter.event = eventId;
  }
  if (bookingType) {
    filter.bookingType = bookingType;
  }

  // Build aggregation pipeline for search
  let pipeline = [
    {
      $lookup: {
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'eventDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$eventDetails'
    },
    {
      $unwind: '$userDetails'
    }
  ];

  // Add search filter if provided
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
          { 'personalInfo.email': { $regex: search, $options: 'i' } },
          { bookingNumber: { $regex: search, $options: 'i' } },
          { 'eventDetails.title': { $regex: search, $options: 'i' } },
          { 'userDetails.fullName': { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  // Add status and eventId filters
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Add sorting
  const sortStage = {};
  sortStage[sortBy === 'eventTitle' ? 'eventDetails.title' : sortBy] = sortOrder === 'desc' ? -1 : 1;
  pipeline.push({ $sort: sortStage });

  // Add pagination
  pipeline.push({ $skip: skip }, { $limit: limitNumber });

  // Add projection to shape the output
  pipeline.push({
    $project: {
      _id: 1,
      bookingNumber: 1,
      amount: 1,
      originalAmount: 1,
      discountAmount: 1,
      currency: 1,
      status: 1,
      paymentMethod: 1,
      razorpayOrderId: 1,
      razorpayPaymentId: 1,
      razorpaySignature: 1,
      couponCode: 1,
      coupon: 1,
      bookingType: 1,
      groupInfo: 1,
      createdAt: 1,
      updatedAt: 1,
      paidAt: 1,
      cancelledAt: 1,
      refundedAt: 1,
      personalInfo: 1,
      motorcycleInfo: 1,
      emergencyContact: 1,
      medicalHistory: 1,
      agreements: 1,
      notes: 1,
      refundAmount: 1,
      refundReason: 1,
      cancellationReason: 1,
      event: {
        _id: '$eventDetails._id',
        title: '$eventDetails.title',
        startDate: '$eventDetails.startDate',
        endDate: '$eventDetails.endDate',
        location: '$eventDetails.location',
        eventType: '$eventDetails.eventType',
        price: '$eventDetails.price'
      },
      user: {
        _id: '$userDetails._id',
        fullName: '$userDetails.fullName',
        email: '$userDetails.email'
      }
    }
  });

  // If no event bookings exist, return empty results
  const totalCount = await EventBooking.countDocuments(filter);
  
  if (totalCount === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          itemsPerPage: limitNumber,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      }, 'No event bookings found')
    );
  }

  const bookings = await EventBooking.aggregate(pipeline);
  const result = getPaginationResult(bookings, totalCount, parseInt(page), limitNumber);

  res.status(200).json(
    new ApiResponse(200, result, 'Event bookings retrieved successfully')
  );
}));

// @route   GET /api/admin/event-bookings/stats
// @desc    Get event booking statistics
// @access  Private/Admin
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await EventBooking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const totalBookings = await EventBooking.countDocuments();
  const totalRevenue = await EventBooking.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Get recent bookings
  const recentBookings = await EventBooking.find()
    .populate('event', 'title startDate location')
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('bookingNumber amount status createdAt');

  // Get bookings by event
  const eventStats = await EventBooking.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'eventDetails'
      }
    },
    { $unwind: '$eventDetails' },
    {
      $group: {
        _id: '$event',
        eventTitle: { $first: '$eventDetails.title' },
        totalBookings: { $sum: 1 },
        paidBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      overview: {
        totalBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        statusBreakdown: stats
      },
      recentBookings,
      eventStats
    }, 'Event booking statistics retrieved successfully')
  );
}));

// @route   GET /api/admin/event-bookings/:id
// @desc    Get specific event booking details for admin
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await EventBooking.findById(id)
    .populate('event', 'title startDate endDate location imgUrl details eventType price maxParticipants currentParticipants')
    .populate('user', 'fullName email primaryBike experienceLevel createdAt');

  if (!booking) {
    throw new ApiError(404, 'Event booking not found');
  }

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Event booking retrieved successfully')
  );
}));

// @route   PUT /api/admin/event-bookings/:id/status
// @desc    Update event booking status
// @access  Private/Admin
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes, refundAmount, refundReason } = req.body;

  if (!['created', 'paid', 'failed', 'refunded', 'cancelled'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await EventBooking.findById(id).populate('event').session(session);
    
    if (!booking) {
      throw new ApiError(404, 'Event booking not found');
    }

    const oldStatus = booking.status;
    booking.status = status;
    
    if (notes) booking.notes = notes;

    // Handle status-specific updates
    switch (status) {
      case 'paid':
        if (oldStatus !== 'paid' && !booking.paidAt) {
          booking.paidAt = new Date();
        }
        break;
      case 'cancelled':
        if (oldStatus !== 'cancelled' && !booking.cancelledAt) {
          booking.cancelledAt = new Date();
        }
        // Decrement participant count ONLY if booking was paid (participants were counted)
        if (oldStatus === 'paid') {
          const decrement = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
          await Event.findByIdAndUpdate(
            booking.event._id,
            { $inc: { currentParticipants: -decrement } },
            { session }
          );
        }
        break;
      case 'refunded':
        if (oldStatus !== 'refunded' && !booking.refundedAt) {
          booking.refundedAt = new Date();
        }
        if (refundAmount !== undefined) {
          booking.refundAmount = refundAmount;
        }
        if (refundReason) {
          booking.refundReason = refundReason;
        }
        // Decrement participant count ONLY if booking was paid (participants were counted)
        if (oldStatus === 'paid') {
          const decrement = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
          await Event.findByIdAndUpdate(
            booking.event._id,
            { $inc: { currentParticipants: -decrement } },
            { session }
          );
        }
        break;
      case 'created':
        // Created status means payment pending - don't count participants yet
        // If moving from paid to created, decrement participants
        if (oldStatus === 'paid') {
          const decrement = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
          await Event.findByIdAndUpdate(
            booking.event._id,
            { $inc: { currentParticipants: -decrement } },
            { session }
          );
        }
        break;
      case 'paid':
        // Increment participant count if moving TO paid from other status
        if (oldStatus !== 'paid') {
          const increment = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
          // Check if event is not full
          if (booking.event.currentParticipants + increment > booking.event.maxParticipants) {
            throw new ApiError(400, 'Cannot reactivate booking: Event is full');
          }
          await Event.findByIdAndUpdate(
            booking.event._id,
            { $inc: { currentParticipants: increment } },
            { session }
          );
        }
        break;
    }

    await booking.save({ session });
    await session.commitTransaction();

    const updatedBooking = await EventBooking.findById(id)
      .populate('event', 'title startDate location')
      .populate('user', 'fullName email');

    res.status(200).json(
      new ApiResponse(200, { booking: updatedBooking }, 'Event booking status updated successfully')
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   DELETE /api/admin/event-bookings/:id
// @desc    Delete event booking (admin only)
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await EventBooking.findById(id).populate('event').session(session);
    
    if (!booking) {
      throw new ApiError(404, 'Event booking not found');
    }

    // Decrement participant count ONLY if booking was paid (participants were actually counted)
    if (booking.status === 'paid') {
      const decrement = booking.bookingType === 'group' ? booking.groupInfo.groupSize : 1;
      await Event.findByIdAndUpdate(
        booking.event._id,
        { $inc: { currentParticipants: -decrement } },
        { session }
      );
    }

    await EventBooking.findByIdAndDelete(id).session(session);
    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(200, null, 'Event booking deleted successfully')
    );

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}));

// @route   GET /api/admin/event-bookings/export/csv
// @desc    Export event bookings as CSV
// @access  Private/Admin
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { eventId, status, startDate, endDate } = req.query;

  const filter = {};
  if (eventId) filter.event = eventId;
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const bookings = await EventBooking.find(filter)
    .populate('event', 'title startDate location')
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });

  // Convert to CSV format
  const csvHeader = 'Booking Number,Booking Type,Group Name,Member Type,Event Title,User Name,User Email,Full Name,Contact Number,Emergency Contact,Address,Gender,Blood Group,Food Preference,Motorcycle Model,Motorcycle Number,Amount,Discount,Final Amount,Status,Booking Date,Payment Date\n';
  
  const csvRows = [];
  
  bookings.forEach(booking => {
    if (booking.bookingType === 'group' && booking.groupInfo && booking.groupInfo.members && booking.groupInfo.members.length > 0) {
      // For group bookings, create a row for the leader
      csvRows.push([
        booking.bookingNumber,
        'Group',
        booking.groupInfo.groupName || '',
        'Leader',
        booking.event.title,
        booking.user.fullName,
        booking.user.email,
        booking.personalInfo.fullName,
        booking.personalInfo.contactNumber,
        booking.emergencyContact?.number || '',
        `"${(booking.personalInfo.address || '').replace(/"/g, '""')}"`,
        booking.personalInfo.gender || '',
        booking.personalInfo.bloodGroup || '',
        booking.personalInfo.foodPreference || '',
        booking.motorcycleInfo.modelName || '',
        booking.motorcycleInfo.motorcycleNumber || '',
        booking.originalAmount || booking.amount,
        booking.discountAmount || 0,
        booking.amount,
        booking.status,
        booking.createdAt.toISOString().split('T')[0],
        booking.paidAt ? booking.paidAt.toISOString().split('T')[0] : ''
      ].join(','));
      
      // Add a row for each group member
      booking.groupInfo.members.forEach((member, index) => {
        csvRows.push([
          booking.bookingNumber,
          'Group',
          booking.groupInfo.groupName || '',
          `Member ${index + 1}`,
          booking.event.title,
          booking.user.fullName,
          booking.user.email,
          member.name || '',
          member.contactNumber || '',
          member.emergencyContact || '',
          `"${(member.address || '').replace(/"/g, '""')}"`,
          '', // Gender not in member info
          '', // Blood group not in member info
          member.foodPreference || '',
          '', // Motorcycle model not in member info
          '', // Motorcycle number not in member info
          '', // Individual member doesn't have separate amount
          '', // No discount for individual member
          '', // No amount for individual member
          booking.status,
          booking.createdAt.toISOString().split('T')[0],
          booking.paidAt ? booking.paidAt.toISOString().split('T')[0] : ''
        ].join(','));
      });
    } else {
      // For individual bookings
      csvRows.push([
        booking.bookingNumber,
        'Individual',
        '', // No group name
        'Individual',
        booking.event.title,
        booking.user.fullName,
        booking.user.email,
        booking.personalInfo.fullName,
        booking.personalInfo.contactNumber,
        booking.emergencyContact?.number || '',
        `"${(booking.personalInfo.address || '').replace(/"/g, '""')}"`,
        booking.personalInfo.gender || '',
        booking.personalInfo.bloodGroup || '',
        booking.personalInfo.foodPreference || '',
        booking.motorcycleInfo.modelName || '',
        booking.motorcycleInfo.motorcycleNumber || '',
        booking.originalAmount || booking.amount,
        booking.discountAmount || 0,
        booking.amount,
        booking.status,
        booking.createdAt.toISOString().split('T')[0],
        booking.paidAt ? booking.paidAt.toISOString().split('T')[0] : ''
      ].join(','));
    }
  });

  const csvContent = csvHeader + csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=event-bookings.csv');
  res.status(200).send(csvContent);
}));

export default router;