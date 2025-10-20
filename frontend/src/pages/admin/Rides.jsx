import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    startTime: '',
    endTime: '',
    price: '',
    maxCapacity: '',
    description: '',
    difficulty: 'Medium',
    distance: '',
    imgUrl: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch rides
  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/rides');
      setRides(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch rides');
      console.error(error);
      setRides([]); // Ensure rides is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  // Filter rides based on search and status
  const filteredRides = rides.filter(ride => {
    const matchesSearch = ride.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ride.to?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ride.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'route',
      title: 'Route',
      render: (ride) => (
        <div className="flex items-center space-x-2">
          <FiMapPin className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {ride.from} → {ride.to}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(ride.departureTime).toLocaleString()}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'timing',
      title: 'Timing',
      render: (ride) => (
        <div className="text-sm">
          <div className="flex items-center text-gray-900">
            <FiClock className="h-3 w-3 mr-1" />
            {new Date(ride.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <div className="text-gray-500 text-xs">
            Arrival: {new Date(ride.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      )
    },
    {
      key: 'fare',
      title: 'Fare',
      render: (ride) => (
        <span className="text-sm font-medium text-gray-900">
          ₹{ride.fare}
        </span>
      )
    },
    {
      key: 'seats',
      title: 'Seats',
      render: (ride) => (
        <div className="flex items-center space-x-1">
          <FiUsers className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-900">
            {ride.availableSeats}/{ride.totalSeats}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            ride.availableSeats === 0 
              ? 'bg-red-100 text-red-800' 
              : ride.availableSeats <= 5 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }`}>
            {ride.availableSeats === 0 ? 'Full' : `${ride.availableSeats} left`}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (ride) => {
        const statusColors = {
          scheduled: 'bg-blue-100 text-blue-800',
          ongoing: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[ride.status]}`}>
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (ride) => (
        <span className="text-xs text-gray-500">
          {new Date(ride.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'imgUrl') { // Skip imgUrl as we're using file upload
          submitData.append(key, formData[key]);
        }
      });
      
      // Append file if selected
      if (selectedFile) {
        submitData.append('rideImage', selectedFile);
      }

      if (editingRide) {
        // Update ride
        await api.put(`/admin/rides/${editingRide._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Ride updated successfully');
      } else {
        // Create ride
        await api.post('/admin/rides', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Ride created successfully');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchRides();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (ride) => {
    setEditingRide(ride);
    setFormData({
      title: ride.title || '',
      venue: ride.venue || '',
      startTime: ride.startTime ? new Date(ride.startTime).toISOString().slice(0, 16) : '',
      endTime: ride.endTime ? new Date(ride.endTime).toISOString().slice(0, 16) : '',
      price: ride.price || '',
      maxCapacity: ride.maxCapacity || '',
      description: ride.description || '',
      difficulty: ride.difficulty || 'Medium',
      distance: ride.distance || '',
      imgUrl: ride.imgUrl || ''
    });
    setSelectedFile(null);
    setImagePreview(ride.imgUrl || '');
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (ride) => {
    if (window.confirm(`Are you sure you want to delete the ride from ${ride.from} to ${ride.to}?`)) {
      try {
        await api.delete(`/admin/rides/${ride._id}`);
        toast.success('Ride deleted successfully');
        fetchRides();
      } catch (error) {
        toast.error('Failed to delete ride');
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
        e.target.value = '';
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      venue: '',
      startTime: '',
      endTime: '',
      price: '',
      maxCapacity: '',
      description: '',
      difficulty: 'Medium',
      distance: '',
      imgUrl: ''
    });
    setSelectedFile(null);
    setImagePreview('');
    setEditingRide(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Get stats
  const totalRides = rides.length;
  const activeRides = rides.filter(r => r.status === 'scheduled' || r.status === 'ongoing').length;
  const completedRides = rides.filter(r => r.status === 'completed').length;
  const totalRevenue = rides
    .filter(r => r.status === 'completed')
    .reduce((sum, ride) => sum + (ride.fare * (ride.totalSeats - ride.availableSeats)), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rides Management</h1>
        <p className="text-gray-600 mt-1">Manage bus rides and schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalRides}</p>
              <p className="text-gray-600 text-sm">Total Rides</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiClock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeRides}</p>
              <p className="text-gray-600 text-sm">Active Rides</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{completedRides}</p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 font-bold text-lg">₹</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-gray-600 text-sm">Total Revenue</p>
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
                placeholder="Search routes..."
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
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Ride
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredRides}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No rides found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingRide ? 'Edit Ride' : 'Add New Ride'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ride title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ride venue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.distance}
              onChange={(e) => setFormData({...formData, distance: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Distance in kilometers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ride Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Ride description..."
            />
          </div>



          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {formLoading && <LoadingSpinner size="sm" />}
              {editingRide ? 'Update Ride' : 'Create Ride'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Rides;