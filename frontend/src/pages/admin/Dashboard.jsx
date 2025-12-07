import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiCreditCard,
  FiMap,
  FiFileText,
  FiTrendingUp,
  FiCalendar,
  FiActivity
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [popularRides, setPopularRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse, ridesResponse] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-activity'),
        api.get('/admin/dashboard/popular-rides')
      ]);

      setStats(statsResponse.data.data);
      setRecentActivity(activityResponse.data.data);
      setPopularRides(ridesResponse.data.data.popularRides);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }, []);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const statCards = useMemo(() => [
    {
      title: 'Total Users',
      value: stats?.overview.totalUsers || 0,
      subValue: `${stats?.overview.activeUsers || 0} active`,
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue.totalRevenue || 0),
      subValue: `${stats?.overview.paidBookings || 0} paid bookings`,
      icon: FiCreditCard,
      color: 'bg-green-500'
    },
    {
      title: 'Upcoming Rides',
      value: stats?.overview.upcomingRides || 0,
      subValue: `${stats?.overview.totalRides || 0} total rides`,
      icon: FiMap,
      color: 'bg-purple-500'
    },
    {
      title: 'Published Blogs',
      value: stats?.overview.publishedBlogs || 0,
      subValue: `${stats?.overview.totalBlogs || 0} total blogs`,
      icon: FiFileText,
      color: 'bg-orange-500'
    }
  ], [stats, formatCurrency]);

  const getBookingTypeIcon = useCallback((type) => {
    switch(type) {
      case 'ride':
        return { icon: FiMap, color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'event':
        return { icon: FiCalendar, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'audience':
        return { icon: FiUsers, color: 'text-green-600', bgColor: 'bg-green-100' };
      default:
        return { icon: FiCreditCard, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  }, []);

  const getBookingTypeLabel = useCallback((type) => {
    switch(type) {
      case 'ride':
        return 'Ride Booking';
      case 'event':
        return 'Event Booking';
      case 'audience':
        return 'Audience Registration';
      default:
        return 'Booking';
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.subValue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiActivity className="mr-2 h-5 w-5" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            {recentActivity ? (
              <div className="space-y-4">
                {/* Recent Users */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Users</h4>
                  {recentActivity.recentUsers?.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivity.recentUsers.slice(0, 3).map((user) => (
                        <div key={user._id} className="flex items-center text-sm">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <FiUsers className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="font-medium">{user.fullName}</span>
                          <span className="text-gray-500 ml-2">joined {formatDate(user.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent users</p>
                  )}
                </div>

                {/* Recent Bookings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Bookings & Registrations</h4>
                  {recentActivity.recentBookings?.length > 0 ? (
                    <div className="space-y-2">
                      {recentActivity.recentBookings.slice(0, 5).map((booking, index) => {
                        const typeInfo = getBookingTypeIcon(booking.type);
                        const TypeIcon = typeInfo.icon;
                        return (
                          <div key={booking._id || index} className="flex items-start text-sm border-l-2 pl-3 py-1" style={{ borderColor: typeInfo.color.replace('text-', '#') }}>
                            <div className={`h-6 w-6 ${typeInfo.bgColor} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                              <TypeIcon className={`h-3 w-3 ${typeInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{booking.user?.fullName}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.bgColor} ${typeInfo.color} font-medium`}>
                                  {getBookingTypeLabel(booking.type)}
                                </span>
                              </div>
                              <div className="text-gray-600 text-xs mt-0.5">
                                {booking.type === 'event' ? booking.event?.title : booking.type === 'ride' ? booking.ride?.title : booking.event?.title}
                                {' • '}
                                <span className="font-medium text-green-600">{formatCurrency(booking.amount)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent bookings</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading activity...</p>
            )}
          </div>
        </div>

        {/* Popular Rides */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiTrendingUp className="mr-2 h-5 w-5" />
              Popular Rides
            </h3>
          </div>
          <div className="p-6">
            {popularRides.length > 0 ? (
              <div className="space-y-4">
                {popularRides.map((ride) => (
                  <div key={ride._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ride.title}</p>
                      <p className="text-xs text-gray-500">
                        {ride.venue} • {formatDate(ride.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {ride.registeredCount}/{ride.maxCapacity}
                      </p>
                      <p className="text-xs text-gray-500">{formatCurrency(ride.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No rides available</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {stats?.revenue && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiCreditCard className="mr-2 h-5 w-5" />
              Revenue Breakdown
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Ride Bookings</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.revenue.rideRevenue || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.revenue.rideBookings || 0} bookings</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Event Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.revenue.eventRevenue || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.revenue.eventBookings || 0} bookings</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Audience Registrations</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.revenue.audienceRevenue || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.revenue.audienceRegistrations || 0} registrations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Growth Chart Placeholder */}
      {stats?.monthlyGrowth && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FiCalendar className="mr-2 h-5 w-5" />
              Monthly Growth
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.monthlyGrowth.map((month, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{month.newUsers}</p>
                  <p className="text-sm text-gray-500">
                    {month._id.month}/{month._id.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;