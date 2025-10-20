import express from 'express';
import User from '../../models/User.js';
import UpcomingRide from '../../models/UpcomingRide.js';
import CompletedRide from '../../models/CompletedRide.js';
import Booking from '../../models/Booking.js';
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
    totalBlogs,
    totalEvents,
    activeUsers,
    upcomingRides,
    paidBookings,
    publishedBlogs,
    activeEvents,
    migrationStats
  ] = await Promise.all([
    User.countDocuments(),
    UpcomingRide.countDocuments(),
    CompletedRide.countDocuments(),
    Booking.countDocuments(),
    Blog.countDocuments(),
    Event.countDocuments(),
    User.countDocuments({ isActive: true }),
    UpcomingRide.countDocuments({ isActive: true, startTime: { $gte: new Date() } }),
    Booking.countDocuments({ status: 'paid' }),
    Blog.countDocuments({ isPublished: true }),
    Event.countDocuments({ isActive: true }),
    getMigrationStats()
  ]);

  // Get revenue statistics
  const revenueStats = await Booking.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        averageBookingValue: { $avg: '$amount' }
      }
    }
  ]);

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
      totalBookings,
      paidBookings,
      totalBlogs,
      publishedBlogs,
      totalEvents,
      activeEvents
    },
    revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 },
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
  const [recentUsers, recentBookings, recentBlogs] = await Promise.all([
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
    Blog.find({ isPublished: true })
      .populate('author', 'fullName')
      .select('title author publishedAt views')
      .sort({ publishedAt: -1 })
      .limit(5)
  ]);

  res.json(new ApiResponse(200, {
    recentUsers,
    recentBookings,
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