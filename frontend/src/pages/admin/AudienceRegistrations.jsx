import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiTrash2,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEdit
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import { audienceRegistrationsAPI, eventsAPI } from '../../services/api';

const AudienceRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    audienceTicketPrice: '',
    audienceCapacity: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    eventId: '',
    paymentStatus: '',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, [currentPage, itemsPerPage, filters, sortConfig]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...filters
      };

      const [registrationsRes, statsRes] = await Promise.all([
        audienceRegistrationsAPI.getAll(params),
        audienceRegistrationsAPI.getStats(filters.eventId ? { eventId: filters.eventId } : {})
      ]);

      if (registrationsRes.success) {
        setRegistrations(registrationsRes.data.registrations || []);
        setPagination(registrationsRes.data.pagination);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch audience registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll({ limit: 100, status: 'published' });
      if (response.success) {
        // Handle both possible response structures
        const eventsList = response.data.events || response.data.data || [];
        setEvents(eventsList);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusUpdate = async (registrationId, newStatus, notes = '') => {
    try {
      const response = await audienceRegistrationsAPI.updateStatus(registrationId, {
        status: newStatus,
        notes
      });

      if (response.success) {
        toast.success('Status updated successfully');
        fetchData();
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      const response = await audienceRegistrationsAPI.delete(registrationId);
      if (response.success) {
        toast.success('Registration deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error(error.response?.data?.message || 'Failed to delete registration');
    }
  };

  const handleResendConfirmation = async (registrationId, type) => {
    try {
      const response = await audienceRegistrationsAPI.resendConfirmation(registrationId, { type });
      if (response.success) {
        toast.success(`${type === 'email' ? 'Email' : 'WhatsApp'} sent successfully`);
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast.error('Failed to resend confirmation');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await audienceRegistrationsAPI.exportCSV(filters);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audience-registrations-${new Date().toISOString()}.csv`;
      a.click();
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleUpdatePricing = async () => {
    try {
      if (!selectedEvent) {
        toast.error('Please select an event');
        return;
      }

      const data = {};
      if (pricingForm.audienceTicketPrice !== '') {
        data.audienceTicketPrice = parseFloat(pricingForm.audienceTicketPrice);
      }
      if (pricingForm.audienceCapacity !== '') {
        data.audienceCapacity = parseInt(pricingForm.audienceCapacity);
      }

      if (Object.keys(data).length === 0) {
        toast.error('Please enter at least one value to update');
        return;
      }

      const response = await eventsAPI.updateAudiencePricing(selectedEvent._id, data);
      if (response.success) {
        toast.success('Audience pricing updated successfully');
        setShowPricingModal(false);
        setPricingForm({ audienceTicketPrice: '', audienceCapacity: '' });
        setSelectedEvent(null);
        fetchEvents();
        fetchData();
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error(error.response?.data?.message || 'Failed to update pricing');
    }
  };

  const handleEventSelection = (eventId) => {
    const event = events.find(e => e._id === eventId);
    if (event) {
      setSelectedEvent(event);
      setPricingForm({
        audienceTicketPrice: event.audienceTicketPrice || '',
        audienceCapacity: event.audienceCapacity || ''
      });
    } else {
      setSelectedEvent(null);
      setPricingForm({ audienceTicketPrice: '', audienceCapacity: '' });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FiXCircle, text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', text: 'Refunded' }
    };
    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const columns = [
    {
      key: 'ticketNumber',
      title: 'Ticket #',
      sortable: true,
      render: (row) => (
        <div className="font-medium text-gray-900">
          {row.ticketNumber || 'N/A'}
        </div>
      )
    },
    {
      key: 'personalInfo.name',
      title: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.personalInfo?.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{row.personalInfo?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'eventDetails.title',
      title: 'Event',
      sortable: false,
      render: (row) => row.eventDetails?.title || 'N/A'
    },
    {
      key: 'paymentInfo.amount',
      title: 'Amount',
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">₹{row.paymentInfo?.amount || 0}</div>
        </div>
      )
    },
    {
      key: 'payment',
      title: 'Payment',
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            row.paymentInfo?.paymentStatus === 'completed'
              ? 'bg-green-100 text-green-800'
              : row.paymentInfo?.paymentStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : row.paymentInfo?.paymentStatus === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : row.paymentInfo?.paymentStatus === 'refunded'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
          }`}>
            {row.paymentInfo?.paymentStatus === 'completed' ? '✓ Paid' :
              row.paymentInfo?.paymentStatus === 'pending' ? '⏳ Pending' :
                row.paymentInfo?.paymentStatus === 'failed' ? '✗ Failed' :
                  row.paymentInfo?.paymentStatus === 'refunded' ? '↩ Refunded' :
                    row.paymentInfo?.paymentStatus || 'N/A'}
          </div>
          {row.paymentInfo?.razorpayPaymentId && (
            <div className="text-xs text-gray-500 mt-1 font-mono truncate" style={{ maxWidth: '120px' }} title={row.paymentInfo.razorpayPaymentId}>
              {row.paymentInfo.razorpayPaymentId}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'createdAt',
      title: 'Registration Date',
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-900">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedRegistration(row);
              setShowDetails(true);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedRegistration(row);
              setShowStatusModal(true);
            }}
            className="text-green-600 hover:text-green-900"
            title="Update Status"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-900"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audience Registrations Management</h1>
        <p className="mt-2 text-gray-600">Manage all audience registrations for events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRegistrations || 0}</p>
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
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.statusCounts?.confirmed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiClock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.statusCounts?.pending || 0}</p>
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
                placeholder="Search by name, email, ticket..."
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
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
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
              Payment
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Payment</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilters({ status: '', eventId: '', paymentStatus: '', search: '' });
                setCurrentPage(1);
              }}
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
            <button
              onClick={() => {
                setShowPricingModal(true);
              }}
              className="px-4 py-2 text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200 flex items-center gap-2"
            >
              <FiDollarSign size={16} />
              Manage Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={registrations}
          columns={columns}
          loading={loading}
          emptyMessage="No audience registrations found"
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
              Showing {registrations.length} of {pagination.totalItems} registrations
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedRegistration && (
        <Modal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedRegistration(null);
          }}
          title="Registration Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Registration Overview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Ticket Number</p>
                  <p className="text-lg font-bold text-blue-700">{selectedRegistration.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Registration Status</p>
                  {getStatusBadge(selectedRegistration.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Registration Date</p>
                  <p className="text-sm text-blue-800">
                    {new Date(selectedRegistration.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Last Updated</p>
                  <p className="text-sm text-blue-800">
                    {new Date(selectedRegistration.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <FiUser className="text-gray-700" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                  <p className="text-gray-900">{selectedRegistration.personalInfo?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                  <p className="text-gray-900">{selectedRegistration.personalInfo?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                  <p className="text-gray-900">{selectedRegistration.personalInfo?.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Address</p>
                  <p className="text-gray-900">{selectedRegistration.personalInfo?.address}</p>
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-900">
                <FiCalendar className="text-purple-700" />
                Event Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-purple-600 mb-1">Event Title</p>
                  <p className="text-lg font-semibold text-purple-900">{selectedRegistration.eventDetails?.title}</p>
                </div>
                {selectedRegistration.eventDetails?.date && (
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Event Date</p>
                    <p className="text-purple-900">
                      {new Date(selectedRegistration.eventDetails.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRegistration.eventDetails?.location && (
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Location</p>
                    <p className="text-purple-900">{selectedRegistration.eventDetails.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-900">
                <FiCreditCard className="text-green-700" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Base Amount</p>
                  <p className="text-lg font-bold text-green-800">₹{selectedRegistration.paymentInfo?.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Discount Applied</p>
                  <p className="text-lg font-bold text-green-800">
                    ₹{selectedRegistration.paymentInfo?.discount || 0}
                  </p>
                </div>
                {selectedRegistration.paymentInfo?.couponCode && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Coupon Code</p>
                    <p className="text-green-900 font-mono">{selectedRegistration.paymentInfo.couponCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Final Amount</p>
                  <p className="text-xl font-bold text-green-900">
                    ₹{selectedRegistration.paymentInfo?.finalAmount || selectedRegistration.paymentInfo?.amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Payment Status</p>
                  {getPaymentStatusBadge(selectedRegistration.paymentInfo?.paymentStatus)}
                </div>
                {selectedRegistration.paymentInfo?.razorpayOrderId && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Order ID</p>
                    <p className="font-mono text-xs text-green-800 break-all">
                      {selectedRegistration.paymentInfo.razorpayOrderId}
                    </p>
                  </div>
                )}
                {selectedRegistration.paymentInfo?.razorpayPaymentId && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-green-600 mb-1">Payment ID</p>
                    <p className="font-mono text-xs text-green-800 break-all">
                      {selectedRegistration.paymentInfo.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-orange-900">Actions</h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FiEdit size={16} />
                  Update Status
                </button>
                {selectedRegistration.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleResendConfirmation(selectedRegistration._id, 'email')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FiMail size={16} />
                      Resend Email
                    </button>
                    <button
                      onClick={() => handleResendConfirmation(selectedRegistration._id, 'whatsapp')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FiPhone size={16} />
                      Resend WhatsApp
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedRegistration._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <FiTrash2 size={16} />
                  Delete Registration
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedRegistration && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Registration Status"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                id="newStatus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                id="statusNotes"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes about this status change..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStatus = document.getElementById('newStatus').value;
                  const notes = document.getElementById('statusNotes').value;
                  handleStatusUpdate(selectedRegistration._id, newStatus, notes);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Audience Pricing Modal */}
      {showPricingModal && (
        <Modal
          isOpen={showPricingModal}
          onClose={() => {
            setShowPricingModal(false);
            setSelectedEvent(null);
            setPricingForm({ audienceTicketPrice: '', audienceCapacity: '' });
          }}
          title="Manage Audience Pricing"
        >
          <div className="space-y-6">
            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                value={selectedEvent?._id || ''}
                onChange={(e) => handleEventSelection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select an Event --</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Current Settings</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Current Price</p>
                      <p className="font-semibold text-blue-900">₹{selectedEvent.audienceTicketPrice || 0}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Current Capacity</p>
                      <p className="font-semibold text-blue-900">
                        {selectedEvent.audienceBookedCount || 0} / {selectedEvent.audienceCapacity || 'Not Set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audience Ticket Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricingForm.audienceTicketPrice}
                      onChange={(e) => setPricingForm(prev => ({ ...prev, audienceTicketPrice: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new price"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audience Capacity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pricingForm.audienceCapacity}
                      onChange={(e) => setPricingForm(prev => ({ ...prev, audienceCapacity: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter capacity"
                    />
                    {selectedEvent.audienceBookedCount > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Note: Capacity cannot be less than current bookings ({selectedEvent.audienceBookedCount})
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  setSelectedEvent(null);
                  setPricingForm({ audienceTicketPrice: '', audienceCapacity: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePricing}
                disabled={!selectedEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiDollarSign size={16} />
                Update Pricing
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AudienceRegistrations;
