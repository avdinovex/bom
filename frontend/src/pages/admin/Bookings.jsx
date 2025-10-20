import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiCreditCard, FiUser, FiMapPin, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import api from '../../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings');
      setBookings(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      console.error(error);
      setBookings([]); // Ensure bookings is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.personalInfo?.contactNumber?.includes(searchTerm) ||
      booking.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ride?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ride?.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking?.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || booking?.status === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'bookingNumber',
      title: 'Booking ID',
      render: (booking) => (
        <div className="font-mono text-sm text-blue-600">
          #{booking?.bookingNumber || 'N/A'}
        </div>
      )
    },
    {
      key: 'user',
      title: 'Passenger',
      render: (booking) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
            {booking?.personalInfo?.fullName?.charAt(0)?.toUpperCase() || booking?.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{booking?.personalInfo?.fullName || booking?.user?.fullName || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{booking?.personalInfo?.email || booking?.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'ride',
      title: 'Route & Schedule',
      render: (booking) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm font-medium text-gray-900">
            <FiMapPin className="h-3 w-3 mr-1 text-green-500" />
            {booking?.ride?.title || 'Unknown Ride'}
          </div>
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <FiMapPin className="h-3 w-3 mr-1 text-blue-500" />
            {booking?.ride?.venue || 'Unknown Venue'}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <FiCalendar className="h-3 w-3 mr-1" />
            {booking?.ride?.startTime ? new Date(booking.ride.startTime).toLocaleDateString() : 'N/A'} at{' '}
            {booking?.ride?.startTime ? new Date(booking.ride.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (booking) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{booking?.personalInfo?.contactNumber || 'N/A'}</div>
          <div className="text-xs text-gray-500">
            {booking?.motorcycleInfo?.modelName || 'No bike info'}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (booking) => (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">₹{booking?.amount || 0}</div>
          <div className="text-xs text-gray-500">
            {booking?.currency || 'INR'}
          </div>
        </div>
      )
    },
    {
      key: 'payment',
      title: 'Payment Status',
      render: (booking) => {
        if (!booking) return <span>N/A</span>;
        
        const statusColors = {
          created: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
          refunded: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-gray-100 text-gray-800'
        };
        
        const status = booking.status || 'unknown';
        
        return (
          <div className="space-y-1">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {booking.razorpayPaymentId && (
              <div className="text-xs text-gray-500 font-mono">
                ID: {booking.razorpayPaymentId.slice(-8)}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Booked On',
      render: (booking) => (
        <div className="text-sm text-gray-600">
          <div>{booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs text-gray-400">
            {booking?.createdAt ? new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
          </div>
        </div>
      )
    }
  ];

  // Handle view booking details
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle edit booking
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      status: booking.status || 'created',
      fullName: booking.personalInfo?.fullName || '',
      email: booking.personalInfo?.email || '',
      contactNumber: booking.personalInfo?.contactNumber || '',
      amount: booking.amount || 0
    });
    setIsEditModalOpen(true);
  };

  // Handle update booking
  const handleUpdate = async () => {
    if (!selectedBooking) return;
    
    try {
      const updateData = {
        status: editFormData.status,
        'personalInfo.fullName': editFormData.fullName,
        'personalInfo.email': editFormData.email,
        'personalInfo.contactNumber': editFormData.contactNumber,
        amount: editFormData.amount
      };

      await api.put(`/admin/bookings/${selectedBooking._id}`, updateData);
      toast.success('Booking updated successfully');
      setIsEditModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  // Handle cancel booking
  const handleCancel = async (booking) => {
    if (!booking || booking.status === 'cancelled') {
      toast.error('Booking is already cancelled');
      return;
    }
    
    if (window.confirm(`Are you sure you want to cancel booking #${booking.bookingNumber}?`)) {
      try {
        await api.put(`/admin/bookings/${booking._id}`, { status: 'cancelled' });
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  // Export bookings
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Booking ID,Passenger,Email,Contact,Ride,Venue,Date,Amount,Status,Booked On\n" +
      filteredBookings.map(booking => 
        `${booking.bookingNumber},"${booking.personalInfo?.fullName || booking.user?.fullName}","${booking.personalInfo?.email || booking.user?.email}","${booking.personalInfo?.contactNumber}","${booking.ride?.title}","${booking.ride?.venue}",${booking.ride?.startTime ? new Date(booking.ride.startTime).toLocaleDateString() : 'N/A'},₹${booking.amount || 0},${booking.status},${new Date(booking.createdAt).toLocaleDateString()}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'paid').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'paid')
    .reduce((sum, booking) => sum + (booking.amount || 0), 0);
  const pendingPayments = bookings.filter(b => b.status === 'created').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings & Payments</h1>
        <p className="text-gray-600 mt-1">Manage ride bookings and payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              <p className="text-gray-600 text-sm">Total Bookings</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUser className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{confirmedBookings}</p>
              <p className="text-gray-600 text-sm">Paid</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiCreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiCreditCard className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{pendingPayments}</p>
              <p className="text-gray-600 text-sm">Created Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="created">Created</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="created">Created</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleCancel}
        loading={loading}
        emptyMessage="No bookings found"
      />

      {/* Booking Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Booking Details"
        size="xl"
      >
        {selectedBooking && (
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
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedBooking.status === 'paid' ? 'bg-green-100 text-green-800' :
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
                  <span className="ml-2 capitalize">{selectedBooking.paymentMethod || 'N/A'}</span>
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

            {/* Personal Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="mr-2" />
                Personal Information
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
                <div className="col-span-2">
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2">{selectedBooking.personalInfo?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Motorcycle Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                🏍️ Motorcycle Information
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

            {/* Ride Information */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiMapPin className="mr-2" />
                Ride Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <span className="ml-2 font-medium">{selectedBooking.ride?.title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Venue:</span>
                  <span className="ml-2">{selectedBooking.ride?.venue || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="ml-2 font-medium">
                    {selectedBooking.ride?.startTime ? 
                      new Date(selectedBooking.ride.startTime).toLocaleString() : 'Not specified'}
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
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-semibold text-green-600 text-lg">₹{selectedBooking.amount || 0}</span>
                </div>
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedBooking);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiUser className="h-4 w-4" />
                Edit Booking
              </button>
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    handleCancel(selectedBooking);
                    setIsViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Booking Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Booking"
        size="lg"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Booking Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Booking #{selectedBooking.bookingNumber}
              </h4>
              <p className="text-sm text-gray-600">
                Edit booking information and status
              </p>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created">Created</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Booking
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;