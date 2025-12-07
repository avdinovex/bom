import express from 'express';
import User from '../../models/User.js';
import UpcomingRide from '../../models/UpcomingRide.js';
import CompletedRide from '../../models/CompletedRide.js';
import Booking from '../../models/Booking.js';
import EventBooking from '../../models/EventBooking.js';
import AudienceRegistration from '../../models/AudienceRegistration.js';
import Blog from '../../models/Blog.js';
import Event from '../../models/Event.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getMigrationStats } from '../../services/rideMigrationService.js';

const router = express.Router();

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics (admin)
// @access  Admin
router.get('/stats', asyncHandler(async (req, res) => {
  // Get overall statistics
  const [
    totalUsers,
    totalRides,
    totalCompletedRides,
    totalBookings,
    totalEventBookings,
    totalAudienceRegistrations,
    totalBlogs,
    totalEvents,
    activeUsers,
    upcomingRides,
    paidBookings,
    paidEventBookings,
    paidAudienceRegistrations,
    publishedBlogs,
    activeEvents,
    migrationStats
  ] = await Promise.all([
    User.countDocuments(),
    UpcomingRide.countDocuments(),
    CompletedRide.countDocuments(),
    Booking.countDocuments(),
    EventBooking.countDocuments(),
    AudienceRegistration.countDocuments(),
    Blog.countDocuments(),
    Event.countDocuments(),
    User.countDocuments({ isActive: true }),
    UpcomingRide.countDocuments({ isActive: true, startTime: { $gte: new Date() } }),
    Booking.countDocuments({ status: 'paid' }),
    EventBooking.countDocuments({ status: 'paid' }),
    AudienceRegistration.countDocuments({ 'paymentInfo.paymentStatus': 'completed' }),
    Blog.countDocuments({ isPublished: true }),
    Event.countDocuments({ isActive: true }),
    getMigrationStats()
  ]);

  // Get revenue statistics from ride bookings, event bookings, and audience registrations
  const [rideRevenueStats, eventRevenueStats, audienceRevenueStats] = await Promise.all([
    Booking.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    EventBooking.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    AudienceRegistration.aggregate([
      { $match: { 'paymentInfo.paymentStatus': 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: {
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
          },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const rideRevenue = rideRevenueStats[0] || { totalRevenue: 0, count: 0 };
  const eventRevenue = eventRevenueStats[0] || { totalRevenue: 0, count: 0 };
  const audienceRevenue = audienceRevenueStats[0] || { totalRevenue: 0, count: 0 };
  
  const totalRevenue = rideRevenue.totalRevenue + eventRevenue.totalRevenue + audienceRevenue.totalRevenue;
  const totalPaidBookings = rideRevenue.count + eventRevenue.count + audienceRevenue.count;
  const averageBookingValue = totalPaidBookings > 0 ? totalRevenue / totalPaidBookings : 0;

  // Get monthly growth statistics
  const monthlyGrowth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        newUsers: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 }
  ]);

  // Get ride booking statistics
  const rideStats = await UpcomingRide.aggregate([
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
        totalRegistered: { $sum: '$registeredCount' }
      }
    }
  ]);

  const stats = {
    overview: {
      totalUsers,
      activeUsers,
      totalRides,
      totalCompletedRides,
      upcomingRides,
      totalBookings: totalBookings + totalEventBookings + totalAudienceRegistrations,
      paidBookings: paidBookings + paidEventBookings + paidAudienceRegistrations,
      totalBlogs,
      publishedBlogs,
      totalEvents,
      activeEvents
    },
    revenue: {
      totalRevenue,
      averageBookingValue,
      rideRevenue: rideRevenue.totalRevenue,
      eventRevenue: eventRevenue.totalRevenue,
      audienceRevenue: audienceRevenue.totalRevenue,
      rideBookings: rideRevenue.count,
      eventBookings: eventRevenue.count,
      audienceRegistrations: audienceRevenue.count
    },
    monthlyGrowth,
    rideStats,
    migration: migrationStats
  };

  res.json(new ApiResponse(200, stats, 'Dashboard statistics retrieved successfully'));
}));

// @route   GET /api/admin/dashboard/recent-activity
// @desc    Get recent activity (admin)
// @access  Admin
router.get('/recent-activity', asyncHandler(async (req, res) => {
  const [recentUsers, recentRideBookings, recentEventBookings, recentAudienceRegistrations, recentBlogs] = await Promise.all([
    User.find()
      .select('fullName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Booking.find()
      .populate('user', 'fullName')
      .populate('ride', 'title')
      .select('user ride amount status createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    EventBooking.find()
      .populate('user', 'fullName')
      .populate('event', 'title')
      .select('user event amount status createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    AudienceRegistration.find()
      .populate('event', 'title')
      .select('name email phoneNumber event paymentInfo.amount paymentInfo.paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    Blog.find({ isPublished: true })
      .populate('author', 'fullName')
      .select('title author publishedAt views')
      .sort({ publishedAt: -1 })
      .limit(5)
  ]);

  // Combine and sort ride bookings, event bookings, and audience registrations by date
  const allBookings = [
    ...recentRideBookings.map(b => ({ ...b.toObject(), type: 'ride' })),
    ...recentEventBookings.map(b => ({ ...b.toObject(), type: 'event' })),
    ...recentAudienceRegistrations.map(r => ({ 
      ...r.toObject(), 
      type: 'audience',
      user: { fullName: r.name },
      amount: r.paymentInfo?.amount || 0,
      status: r.paymentInfo?.paymentStatus === 'completed' ? 'paid' : 'pending'
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  res.json(new ApiResponse(200, {
    recentUsers,
    recentBookings: allBookings,
    recentBlogs
  }, 'Recent activity retrieved successfully'));
}));

// @route   GET /api/admin/dashboard/popular-rides
// @desc    Get popular rides (admin)
// @access  Admin
router.get('/popular-rides', asyncHandler(async (req, res) => {
  const popularRides = await UpcomingRide.find({ 
    isActive: true, 
    startTime: { $gte: new Date() } 
  })
    .sort({ registeredCount: -1 })
    .limit(10)
    .select('title venue startTime registeredCount maxCapacity price');

  res.json(new ApiResponse(200, { popularRides }, 'Popular rides retrieved successfully'));
}));

export default router;