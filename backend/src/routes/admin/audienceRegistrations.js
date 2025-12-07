import express from 'express';
import AudienceRegistration from '../../models/AudienceRegistration.js';
import Event from '../../models/Event.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import mongoose from 'mongoose';
import logger from '../../config/logger.js';

const router = express.Router();

// @route   GET /api/admin/audience-registrations
// @desc    Get all audience registrations for admin
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    eventId,
    paymentStatus,
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
  if (paymentStatus) {
    filter['paymentInfo.paymentStatus'] = paymentStatus;
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
      $unwind: {
        path: '$eventDetails',
        preserveNullAndEmptyArrays: true
      }
    }
  ];

  // Add search filter if provided
  if (search && search.trim()) {
    pipeline.push({
      $match: {
        $or: [
          { 'personalInfo.name': { $regex: search, $options: 'i' } },
          { 'personalInfo.email': { $regex: search, $options: 'i' } },
          { 'personalInfo.phoneNumber': { $regex: search, $options: 'i' } },
          { ticketNumber: { $regex: search, $options: 'i' } },
          { 'eventDetails.title': { $regex: search, $options: 'i' } }
        ]
      }
    });
  }

  // Add status filter
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Get total count
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await AudienceRegistration.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  // Add sorting, skip and limit
  pipeline.push(
    { $sort: sort },
    { $skip: skip },
    { $limit: limitNumber }
  );

  // Add finalAmount calculation
  pipeline.push({
    $addFields: {
      'paymentInfo.finalAmount': {
        $cond: {
          if: { $and: [{ $ifNull: ['$coupon.discount', false] }, { $gt: ['$coupon.discount', 0] }] },
          then: {
            $cond: {
              if: { $eq: ['$coupon.discountType', 'percentage'] },
              then: {
                $subtract: [
                  '$paymentInfo.amount',
                  { $multiply: ['$paymentInfo.amount', { $divide: ['$coupon.discount', 100] }] }
                ]
              },
              else: {
                $subtract: ['$paymentInfo.amount', '$coupon.discount']
              }
            }
          },
          else: '$paymentInfo.amount'
        }
      },
      'paymentInfo.discount': { $ifNull: ['$coupon.discount', 0] },
      'paymentInfo.couponCode': { $ifNull: ['$coupon.code', null] }
    }
  });

  // Execute pipeline
  const registrations = await AudienceRegistration.aggregate(pipeline);

  const pagination = getPaginationResult(total, page, limitNumber);

  res.json(new ApiResponse(200, {
    registrations,
    pagination
  }, 'Audience registrations fetched successfully'));
}));

// @route   GET /api/admin/audience-registrations/stats
// @desc    Get audience registration statistics
// @access  Private/Admin
router.get('/stats', asyncHandler(async (req, res) => {
  const { eventId } = req.query;

  const matchStage = eventId ? { event: new mongoose.Types.ObjectId(eventId) } : {};

  const stats = await AudienceRegistration.aggregate([
    { $match: matchStage },
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        paymentCounts: [
          {
            $group: {
              _id: '$paymentInfo.paymentStatus',
              count: { $sum: 1 },
              totalAmount: { 
                $sum: {
                  $cond: {
                    if: { $and: [{ $ifNull: ['$coupon.discount', false] }, { $gt: ['$coupon.discount', 0] }] },
                    then: {
                      $cond: {
                        if: { $eq: ['$coupon.discountType', 'percentage'] },
                        then: {
                          $subtract: [
                            '$paymentInfo.amount',
                            { $multiply: ['$paymentInfo.amount', { $divide: ['$coupon.discount', 100] }] }
                          ]
                        },
                        else: {
                          $subtract: ['$paymentInfo.amount', '$coupon.discount']
                        }
                      }
                    },
                    else: '$paymentInfo.amount'
                  }
                }
              }
            }
          }
        ],
        totalStats: [
          {
            $group: {
              _id: null,
              totalRegistrations: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$paymentInfo.paymentStatus', 'completed'] },
                    {
                      $cond: {
                        if: { $and: [{ $ifNull: ['$coupon.discount', false] }, { $gt: ['$coupon.discount', 0] }] },
                        then: {
                          $cond: {
                            if: { $eq: ['$coupon.discountType', 'percentage'] },
                            then: {
                              $subtract: [
                                '$paymentInfo.amount',
                                { $multiply: ['$paymentInfo.amount', { $divide: ['$coupon.discount', 100] }] }
                              ]
                            },
                            else: {
                              $subtract: ['$paymentInfo.amount', '$coupon.discount']
                            }
                          }
                        },
                        else: '$paymentInfo.amount'
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        ],
        recentRegistrations: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'events',
              localField: 'event',
              foreignField: '_id',
              as: 'eventDetails'
            }
          },
          {
            $unwind: {
              path: '$eventDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              'personalInfo.name': 1,
              'personalInfo.email': 1,
              'eventDetails.title': 1,
              status: 1,
              'paymentInfo.amount': 1,
              'paymentInfo.paymentStatus': 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ]);

  const result = stats[0];

  // Format status counts
  const statusCounts = {};
  result.statusCounts.forEach(item => {
    statusCounts[item._id] = item.count;
  });

  // Format payment counts
  const paymentCounts = {};
  let totalRevenue = 0;
  result.paymentCounts.forEach(item => {
    paymentCounts[item._id] = {
      count: item.count,
      totalAmount: item.totalAmount
    };
    if (item._id === 'completed') {
      totalRevenue = item.totalAmount;
    }
  });

  const totalRegistrations = result.totalStats.length > 0 ? result.totalStats[0].totalRegistrations : 0;

  res.json(new ApiResponse(200, {
    totalRegistrations,
    totalRevenue,
    statusCounts,
    paymentCounts,
    recentRegistrations: result.recentRegistrations
  }, 'Statistics fetched successfully'));
}));

// @route   GET /api/admin/audience-registrations/:id
// @desc    Get single audience registration details
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const registration = await AudienceRegistration.findById(req.params.id)
    .populate('event')
    .populate('user', 'name email phoneNumber');

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  // Calculate finalAmount
  let finalAmount = registration.paymentInfo.amount;
  if (registration.coupon && registration.coupon.discount) {
    if (registration.coupon.discountType === 'percentage') {
      finalAmount = registration.paymentInfo.amount - (registration.paymentInfo.amount * registration.coupon.discount / 100);
    } else {
      finalAmount = registration.paymentInfo.amount - registration.coupon.discount;
    }
  }

  // Add calculated fields to response
  const registrationData = registration.toObject();
  registrationData.paymentInfo.finalAmount = finalAmount;
  registrationData.paymentInfo.discount = registration.coupon?.discount || 0;
  registrationData.paymentInfo.couponCode = registration.coupon?.code || null;

  res.json(new ApiResponse(200, { registration: registrationData }, 'Registration fetched successfully'));
}));

// @route   PATCH /api/admin/audience-registrations/:id/status
// @desc    Update registration status
// @access  Private/Admin
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    throw new ApiError(400, 'Status is required');
  }

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const registration = await AudienceRegistration.findById(req.params.id).populate('event');

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  const oldStatus = registration.status;
  registration.status = status;

  if (notes) {
    registration.notes = notes;
  }

  if (status === 'cancelled' && oldStatus !== 'cancelled') {
    registration.cancelledAt = new Date();
    
    // Decrement event audience booked count
    if (registration.event) {
      const event = await Event.findById(registration.event._id);
      if (event && event.audienceBookedCount > 0) {
        event.audienceBookedCount -= 1;
        await event.save();
      }
    }
  } else if (status === 'confirmed' && oldStatus === 'cancelled') {
    registration.cancelledAt = null;
    
    // Increment event audience booked count
    if (registration.event) {
      const event = await Event.findById(registration.event._id);
      if (event) {
        event.audienceBookedCount = (event.audienceBookedCount || 0) + 1;
        await event.save();
      }
    }
  }

  await registration.save();

  res.json(new ApiResponse(200, { registration }, 'Status updated successfully'));
}));

// @route   DELETE /api/admin/audience-registrations/:id
// @desc    Delete audience registration
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const registration = await AudienceRegistration.findById(req.params.id);

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  // If registration was confirmed, update event count
  if (registration.status === 'confirmed') {
    const event = await Event.findById(registration.event);
    if (event && event.audienceBookedCount > 0) {
      event.audienceBookedCount -= 1;
      await event.save();
    }
  }

  await registration.deleteOne();

  res.json(new ApiResponse(200, null, 'Registration deleted successfully'));
}));

// @route   POST /api/admin/audience-registrations/:id/resend-confirmation
// @desc    Resend confirmation email/WhatsApp
// @access  Private/Admin
router.post('/:id/resend-confirmation', asyncHandler(async (req, res) => {
  const registration = await AudienceRegistration.findById(req.params.id).populate('event');

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  if (registration.status !== 'confirmed') {
    throw new ApiError(400, 'Can only resend confirmation for confirmed registrations');
  }

  const { type } = req.body; // 'email' or 'whatsapp' or 'both'

  try {
    if (type === 'email' || type === 'both') {
      const emailService = (await import('../../services/emailService.js')).default;
      await emailService.sendAudienceConfirmation(registration, registration.event);
      registration.emailSent = true;
    }

    if (type === 'whatsapp' || type === 'both') {
      const whatsappService = (await import('../../services/whatsappService.js')).default;
      await whatsappService.sendAudienceConfirmation(registration, registration.event);
      registration.whatsappSent = true;
    }

    await registration.save();

    res.json(new ApiResponse(200, null, 'Confirmation resent successfully'));
  } catch (error) {
    logger.error('Error resending confirmation:', error);
    throw new ApiError(500, 'Failed to resend confirmation');
  }
}));

// @route   GET /api/admin/audience-registrations/export/csv
// @desc    Export audience registrations as CSV
// @access  Private/Admin
router.get('/export/csv', asyncHandler(async (req, res) => {
  const { eventId, status, paymentStatus } = req.query;

  const filter = {};
  if (eventId) filter.event = eventId;
  if (status) filter.status = status;
  if (paymentStatus) filter['paymentInfo.paymentStatus'] = paymentStatus;

  const registrations = await AudienceRegistration.find(filter)
    .populate('event', 'title eventDate')
    .sort({ createdAt: -1 });

  // Generate CSV
  const csvHeaders = [
    'Ticket Number',
    'Name',
    'Email',
    'Phone Number',
    'Address',
    'Event',
    'Event Date',
    'Amount',
    'Payment Status',
    'Status',
    'Registration Date'
  ];

  const csvRows = registrations.map(reg => [
    reg.ticketNumber || '',
    reg.personalInfo.name,
    reg.personalInfo.email,
    reg.personalInfo.phoneNumber,
    reg.personalInfo.address,
    reg.event?.title || '',
    reg.event?.eventDate ? new Date(reg.event.eventDate).toLocaleDateString() : '',
    reg.paymentInfo.amount,
    reg.paymentInfo.paymentStatus,
    reg.status,
    new Date(reg.createdAt).toLocaleDateString()
  ]);

  const csv = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=audience-registrations.csv');
  res.send(csv);
}));

export default router;
