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
  FiRefreshCw
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
    search: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, [pagination.page, pagination.limit, sortConfig, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...filters
      };

      const [bookingsResponse, statsResponse] = await Promise.all([
        eventBookingsAPI.getAll(params),
        eventBookingsAPI.getStats()
      ]);

      setBookings(bookingsResponse.data.bookings);
      setPagination(prev => ({ ...prev, total: bookingsResponse.data.pagination.total }));
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      toast.error('Failed to fetch event bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ limit: 100 });
      setEvents(response.data.events || response.data.items || []);
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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      eventId: '',
      search: '',
      startDate: '',
      endDate: ''
    });
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
      label: 'Booking ID',
      sortable: true,
      render: (booking) => (
        <div className="font-medium text-gray-900">
          {booking.bookingNumber}
        </div>
      )
    },
    {
      key: 'event.title',
      label: 'Event',
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
      label: 'Customer',
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
      label: 'Amount',
      sortable: true,
      render: (booking) => (
        <div className="font-medium text-gray-900">
          ₹{booking.amount}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (booking) => getStatusBadge(booking.status)
    },
    {
      key: 'createdAt',
      label: 'Booking Date',
      sortable: true,
      render: (booking) => (
        <div className="text-sm text-gray-900">
          {new Date(booking.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
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
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
          onSort={handleSort}
          sortConfig={sortConfig}
          emptyMessage="No event bookings found"
        />
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Event Booking Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Booking Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Booking ID:</span> {selectedBooking.bookingNumber}</p>
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedBooking.status)}</p>
                  <p><span className="font-medium">Amount:</span> ₹{selectedBooking.amount}</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedBooking.paymentMethod}</p>
                  {selectedBooking.paymentUtr && (
                    <p><span className="font-medium">UTR Number:</span> {selectedBooking.paymentUtr}</p>
                  )}
                  <p><span className="font-medium">Booking Date:</span> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  {selectedBooking.paidAt && (
                    <p><span className="font-medium">Payment Date:</span> {new Date(selectedBooking.paidAt).toLocaleString()}</p>
                  )}
                  {selectedBooking.cancelledAt && (
                    <p><span className="font-medium">Cancelled Date:</span> {new Date(selectedBooking.cancelledAt).toLocaleString()}</p>
                  )}
                  {selectedBooking.refundedAt && (
                    <p><span className="font-medium">Refunded Date:</span> {new Date(selectedBooking.refundedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Event:</span> {selectedBooking.event?.title}</p>
                  <p><span className="font-medium">Location:</span> {selectedBooking.event?.location}</p>
                  <p><span className="font-medium">Date:</span> {selectedBooking.event?.startDate && new Date(selectedBooking.event.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedBooking.personalInfo.fullName}</p>
                  <p><span className="font-medium">Email:</span> {selectedBooking.personalInfo.email}</p>
                  <p><span className="font-medium">Contact:</span> {selectedBooking.personalInfo.contactNumber}</p>
                  <p><span className="font-medium">Gender:</span> {selectedBooking.personalInfo.gender}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium">DOB:</span> {new Date(selectedBooking.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                  <p><span className="font-medium">Blood Group:</span> {selectedBooking.personalInfo.bloodGroup}</p>
                  <p><span className="font-medium">Address:</span> {selectedBooking.personalInfo.address}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Motorcycle Information</h4>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Model:</span> {selectedBooking.motorcycleInfo.modelName}</p>
                <p><span className="font-medium">Number:</span> {selectedBooking.motorcycleInfo.motorcycleNumber}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Emergency Contact</h4>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Name:</span> {selectedBooking.emergencyContact.personName}</p>
                <p><span className="font-medium">Number:</span> {selectedBooking.emergencyContact.number}</p>
              </div>
            </div>

            {selectedBooking.medicalHistory && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedBooking.medicalHistory}</p>
              </div>
            )}

            {/* Payment Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  {selectedBooking.razorpayOrderId && (
                    <p><span className="font-medium">Razorpay Order ID:</span> {selectedBooking.razorpayOrderId}</p>
                  )}
                  {selectedBooking.razorpayPaymentId && (
                    <p><span className="font-medium">Razorpay Payment ID:</span> {selectedBooking.razorpayPaymentId}</p>
                  )}
                  {selectedBooking.paymentUtr && (
                    <p><span className="font-medium">Payment UTR:</span> {selectedBooking.paymentUtr}</p>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedBooking.refundAmount > 0 && (
                    <p><span className="font-medium">Refund Amount:</span> ₹{selectedBooking.refundAmount}</p>
                  )}
                  {selectedBooking.refundReason && (
                    <p><span className="font-medium">Refund Reason:</span> {selectedBooking.refundReason}</p>
                  )}
                  {selectedBooking.cancellationReason && (
                    <p><span className="font-medium">Cancellation Reason:</span> {selectedBooking.cancellationReason}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Agreements */}
            {selectedBooking.agreements && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Agreements & Consents</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><span className="font-medium">Food & Refreshments:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedBooking.agreements.foodAndRefreshments ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBooking.agreements.foodAndRefreshments ? 'Agreed' : 'Not Agreed'}
                      </span>
                    </p>
                    <p><span className="font-medium">Information Accuracy:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedBooking.agreements.informationAccuracy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBooking.agreements.informationAccuracy ? 'Agreed' : 'Not Agreed'}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">No Contrabands:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedBooking.agreements.noContrabands ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBooking.agreements.noContrabands ? 'Agreed' : 'Not Agreed'}
                      </span>
                    </p>
                    <p><span className="font-medium">Rules & Regulations:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedBooking.agreements.rulesAndRegulations ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedBooking.agreements.rulesAndRegulations ? 'Agreed' : 'Not Agreed'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedBooking.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedBooking.notes}</p>
              </div>
            )}
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