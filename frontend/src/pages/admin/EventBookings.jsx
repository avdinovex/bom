import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiCreditCard
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import { eventBookingsAPI, eventsAPI } from '../../services/api';

const EventBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    eventId: '',
    bookingType: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Pagination state - simplified to match backend structure
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch data when page, itemsPerPage, filters, or sort changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build query parameters as object
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };

      // Add filters
      if (filters.status) params.status = filters.status;
      if (filters.eventId) params.eventId = filters.eventId;
      if (filters.bookingType) params.bookingType = filters.bookingType;
      if (filters.search) params.search = filters.search;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const [bookingsResponse, statsResponse] = await Promise.all([
        eventBookingsAPI.getAll(params),
        eventBookingsAPI.getStats()
      ]);

      console.log('Full Bookings Response:', bookingsResponse);

      // Extract data from response - the structure is response.data.data (array) and response.data.pagination
      const responseData = bookingsResponse?.data?.data || bookingsResponse?.data;

      // Check if responseData is an object with data and pagination, or just an array
      let bookingsData;
      let paginationData;

      if (Array.isArray(responseData)) {
        // If responseData is directly an array, use it as bookings
        bookingsData = responseData;
        // Try to get pagination from the parent level
        paginationData = bookingsResponse?.data?.pagination || null;
      } else if (responseData && typeof responseData === 'object') {
        // If responseData is an object, extract data and pagination from it
        bookingsData = Array.isArray(responseData.data) ? responseData.data : [];
        paginationData = responseData.pagination || null;
      } else {
        bookingsData = [];
        paginationData = null;
      }

      const statsPayload = statsResponse?.data?.data || statsResponse?.data;

      console.log('Extracted Bookings Data:', bookingsData);
      console.log('Extracted Pagination Data:', paginationData);

      setBookings(bookingsData);
      setPagination(paginationData);
      setStats(statsPayload || {});
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      toast.error('Failed to fetch event bookings');
      setBookings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ limit: 100 });
      const payload = response?.data?.data || response?.data;
      const eventsData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.events)
          ? payload.events
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(response?.data?.events)
              ? response.data.events
              : Array.isArray(response?.data)
                ? response.data
                : [];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleStatusUpdate = async (id, status, notes = '', refundAmount = 0, refundReason = '') => {
    try {
      await eventBookingsAPI.updateStatus(id, {
        status,
        notes,
        refundAmount: parseFloat(refundAmount) || 0,
        refundReason
      });
      toast.success('Booking status updated successfully');
      fetchData();
      setShowStatusModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await eventBookingsAPI.delete(id);
      toast.success('Event booking deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await eventBookingsAPI.exportCSV(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Event bookings exported successfully');
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      eventId: '',
      bookingType: '',
      search: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1); // Reset to page 1 when clearing filters
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      created: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'bookingNumber',
      title: 'Booking ID',
      sortable: true,
      render: (booking) => (
        <div className="font-medium text-gray-900">
          {booking.bookingNumber}
        </div>
      )
    },
    {
      key: 'bookingType',
      title: 'Type',
      sortable: true,
      render: (booking) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          booking.bookingType === 'group'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {booking.bookingType === 'group' && <FiUsers className="mr-1" size={12} />}
          {booking.bookingType === 'group' ? `Group (${booking.groupInfo?.groupSize || 0})` : 'Individual'}
        </span>
      )
    },
    {
      key: 'event.title',
      title: 'Event',
      sortable: true,
      render: (booking) => (
        <div>
          <div className="font-medium text-gray-900">{booking.event?.title}</div>
          <div className="text-sm text-gray-500">
            {booking.event?.startDate && new Date(booking.event.startDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'personalInfo.fullName',
      title: 'Customer',
      sortable: true,
      render: (booking) => (
        <div>
          <div className="font-medium text-gray-900">{booking.personalInfo.fullName}</div>
          <div className="text-sm text-gray-500">{booking.personalInfo.email}</div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (booking) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">₹{booking.amount}</div>
          {booking.discountAmount > 0 && (
            <div className="text-xs text-green-600">
              Saved: ₹{booking.discountAmount}
            </div>
          )}
          {booking.couponCode && (
            <div className="text-xs text-purple-600 font-mono">
              {booking.couponCode}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'payment',
      title: 'Payment',
      sortable: true,
      render: (booking) => (
        <div className="text-sm">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'paid'
            ? 'bg-green-100 text-green-800'
            : booking.status === 'created'
              ? 'bg-yellow-100 text-yellow-800'
              : booking.status === 'failed'
                ? 'bg-red-100 text-red-800'
                : booking.status === 'refunded'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
            {booking.status === 'paid' ? '✓ Paid' :
              booking.status === 'created' ? '⏳ Pending' :
                booking.status === 'failed' ? '✗ Failed' :
                  booking.status === 'refunded' ? '↩ Refunded' :
                    booking.status}
          </div>
          {booking.razorpayPaymentId && (
            <div className="text-xs text-gray-500 mt-1 font-mono truncate" style={{ maxWidth: '120px' }} title={booking.razorpayPaymentId}>
              {booking.razorpayPaymentId}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-0.5">
            {booking.paymentMethod || 'razorpay'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (booking) => getStatusBadge(booking.status)
    },
    {
      key: 'createdAt',
      title: 'Booking Date',
      sortable: true,
      render: (booking) => (
        <div className="text-sm text-gray-900">
          {new Date(booking.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (booking) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowDetails(true);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowStatusModal(true);
            }}
            className="text-green-600 hover:text-green-900"
            title="Update Status"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(booking._id)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Bookings Management</h1>
        <p className="mt-2 text-gray-600">Manage all event bookings and reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.overview?.totalBookings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiDollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{stats.overview?.totalRevenue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Paid Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.overview?.statusBreakdown?.find(s => s._id === 'paid')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCalendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.overview?.statusBreakdown?.find(s => s._id === 'created')?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, booking ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="created">Created</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event
            </label>
            <select
              value={filters.eventId}
              onChange={(e) => handleFilterChange('eventId', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Type
            </label>
            <select
              value={filters.bookingType}
              onChange={(e) => handleFilterChange('bookingType', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <FiFilter size={16} />
              Clear
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200 flex items-center gap-2"
            >
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={bookings}
          columns={columns}
          loading={loading}
          emptyMessage="No event bookings found"
        />
        
        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="mx-3 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 20, 50, 100].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {bookings.length} of {pagination.totalItems} bookings
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Event Booking Details"
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Booking Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Booking Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="ml-2 font-mono text-blue-600">#{selectedBooking.bookingNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedBooking.status === 'paid' ? 'bg-green-100 text-green-800' :
                    selectedBooking.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'failed' ? 'bg-red-100 text-red-800' :
                        selectedBooking.status === 'refunded' ? 'bg-blue-100 text-blue-800' :
                          selectedBooking.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedBooking.status?.charAt(0)?.toUpperCase() + selectedBooking.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="ml-2 capitalize">{selectedBooking.paymentMethod || 'razorpay'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Currency:</span>
                  <span className="ml-2">{selectedBooking.currency || 'INR'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Booked On:</span>
                  <span className="ml-2">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
                </div>
                {selectedBooking.paidAt && (
                  <div>
                    <span className="text-gray-600">Paid On:</span>
                    <span className="ml-2">{new Date(selectedBooking.paidAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Type Badge */}
            {selectedBooking.bookingType === 'group' && (
              <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded">
                <div className="flex items-center">
                  <FiUsers className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-semibold text-purple-900">
                    Group Booking - {selectedBooking.groupInfo?.groupSize || 0} Members
                  </span>
                </div>
              </div>
            )}

            {/* Group Information - Show if group booking */}
            {selectedBooking.bookingType === 'group' && selectedBooking.groupInfo && (
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiUsers className="mr-2 text-purple-600" />
                  Group Information
                </h4>
                <div className="mb-4">
                  <span className="text-gray-600 font-medium">Group Name:</span>
                  <span className="ml-2 text-lg font-semibold text-purple-900">
                    {selectedBooking.groupInfo.groupName || 'N/A'}
                  </span>
                </div>

                <h5 className="font-semibold text-gray-800 mb-3 mt-4">
                  Group Members ({selectedBooking.groupInfo.members?.length || 0}):
                </h5>
                <div className="space-y-3">
                  {selectedBooking.groupInfo.members?.map((member, index) => (
                    <div key={member._id || index} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{member.name || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{member.contactNumber || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm ml-13">
                        <div>
                          <span className="text-gray-600">Emergency Contact:</span>
                          <span className="ml-2 font-medium">{member.emergencyContact || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <span className="ml-2 font-medium">
                            {member.address || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Food Preference:</span>
                          <span className={`ml-2 font-semibold ${member.foodPreference === 'Veg' ? 'text-green-600' : 'text-orange-600'}`}>
                            {member.foodPreference === 'Veg' ? '🌱 Veg' :
                              member.foodPreference === 'Non-Veg' ? '🍖 Non-Veg' : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">T-shirt Size:</span>
                          <span className="ml-2 font-medium">{member.tshirtSize || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Information - Leader Info for Group or Individual Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="mr-2" />
                {selectedBooking.bookingType === 'group' ? 'Group Leader Information' : 'Personal Information'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Full Name:</span>
                  <span className="ml-2 font-medium">{selectedBooking.personalInfo?.fullName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2">{selectedBooking.personalInfo?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="ml-2 font-medium">{selectedBooking.personalInfo?.contactNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2">{selectedBooking.personalInfo?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="ml-2">
                    {selectedBooking.personalInfo?.dateOfBirth ?
                      new Date(selectedBooking.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="ml-2 font-medium">{selectedBooking.personalInfo?.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">T-shirt Size:</span>
                  <span className="ml-2 font-medium">{selectedBooking.personalInfo?.tshirtSize || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Food Preference:</span>
                  <span className={`ml-2 font-semibold ${selectedBooking.personalInfo?.foodPreference === 'Veg' ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedBooking.personalInfo?.foodPreference === 'Veg' ? '🌱 Veg' :
                      selectedBooking.personalInfo?.foodPreference === 'Non-Veg' ? '🍖 Non-Veg' : 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2">{selectedBooking.personalInfo?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Motorcycle Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                🏍️ {selectedBooking.bookingType === 'group' ? 'Leader\'s Motorcycle Information' : 'Motorcycle Information'}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Model Name:</span>
                  <span className="ml-2 font-medium">{selectedBooking.motorcycleInfo?.modelName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Number Plate:</span>
                  <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                    {selectedBooking.motorcycleInfo?.motorcycleNumber || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                🚨 Emergency Contact
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Contact Person:</span>
                  <span className="ml-2 font-medium">{selectedBooking.emergencyContact?.personName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Contact Number:</span>
                  <span className="ml-2 font-medium">{selectedBooking.emergencyContact?.number || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {selectedBooking.medicalHistory && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  🏥 Medical History
                </h4>
                <div className="text-sm">
                  <p className="text-gray-700 bg-white p-3 rounded border">
                    {selectedBooking.medicalHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Agreements */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                📋 Agreements & Consents
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <span className={`mr-2 ${selectedBooking.agreements?.foodAndRefreshments ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBooking.agreements?.foodAndRefreshments ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700">Food & Refreshments</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${selectedBooking.agreements?.informationAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBooking.agreements?.informationAccuracy ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700">Information Accuracy</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${selectedBooking.agreements?.noContrabands ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBooking.agreements?.noContrabands ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700">No Contrabands</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 ${selectedBooking.agreements?.rulesAndRegulations ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBooking.agreements?.rulesAndRegulations ? '✅' : '❌'}
                  </span>
                  <span className="text-gray-700">Rules & Regulations</span>
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiMapPin className="mr-2" />
                Event Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <span className="ml-2 font-medium">{selectedBooking.event?.title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2">{selectedBooking.event?.location || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <span className="ml-2 font-medium">
                    {selectedBooking.event?.startDate ?
                      new Date(selectedBooking.event.startDate).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <span className="ml-2">
                    {selectedBooking.event?.endDate ?
                      new Date(selectedBooking.event.endDate).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiCreditCard className="mr-2" />
                Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedBooking.originalAmount > 0 && selectedBooking.originalAmount !== selectedBooking.amount && (
                  <div className="col-span-2 bg-purple-100 p-3 rounded border border-purple-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Original Amount:</span>
                      <span className="ml-2 text-gray-500 line-through">₹{selectedBooking.originalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">Discount ({selectedBooking.couponCode}):</span>
                      <span className="ml-2 font-semibold text-green-600">-₹{selectedBooking.discountAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                      <span className="text-gray-900 font-semibold">Final Amount:</span>
                      <span className="ml-2 font-bold text-green-600 text-lg">₹{selectedBooking.amount || 0}</span>
                    </div>
                  </div>
                )}
                {(!selectedBooking.originalAmount || selectedBooking.originalAmount === selectedBooking.amount) && (
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-semibold text-green-600 text-lg">₹{selectedBooking.amount || 0}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="ml-2 font-semibold text-red-600">₹{selectedBooking.refundAmount || 0}</span>
                </div>
                {selectedBooking.razorpayPaymentId && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Razorpay Payment ID:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedBooking.razorpayPaymentId}
                    </span>
                  </div>
                )}
                {selectedBooking.razorpayOrderId && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Razorpay Order ID:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedBooking.razorpayOrderId}
                    </span>
                  </div>
                )}
                {selectedBooking.razorpaySignature && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Payment Signature:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">
                      {selectedBooking.razorpaySignature}
                    </span>
                  </div>
                )}
                {selectedBooking.paymentUtr && (
                  <div className="col-span-2">
                    <span className="text-gray-600">UTR Number:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedBooking.paymentUtr}
                    </span>
                  </div>
                )}
                {selectedBooking.refundReason && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Refund Reason:</span>
                    <span className="ml-2 italic">{selectedBooking.refundReason}</span>
                  </div>
                )}
                {selectedBooking.cancellationReason && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Cancellation Reason:</span>
                    <span className="ml-2 italic">{selectedBooking.cancellationReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* User Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Associated User Account
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Account Name:</span>
                  <span className="ml-2">{selectedBooking.user?.fullName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Account Email:</span>
                  <span className="ml-2">{selectedBooking.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            {selectedBooking.notes && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  📝 Admin Notes
                </h4>
                <p className="text-sm text-gray-700">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedBooking(selectedBooking);
                  setShowStatusModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiEdit className="h-4 w-4" />
                Update Status
              </button>
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'refunded' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this booking?')) {
                      handleDelete(selectedBooking._id);
                      setShowDetails(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Booking
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <StatusUpdateModal
          booking={selectedBooking}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedBooking(null);
          }}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Status Update Modal Component
const StatusUpdateModal = ({ booking, onClose, onUpdate }) => {
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.notes || '');
  const [refundAmount, setRefundAmount] = useState(booking.refundAmount || '');
  const [refundReason, setRefundReason] = useState(booking.refundReason || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(booking._id, status, notes, refundAmount, refundReason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Update Booking Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="created">Created</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {status === 'refunded' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Amount (₹)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                max={booking.amount}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refund Reason
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for refund..."
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Add any notes..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EventBookings;