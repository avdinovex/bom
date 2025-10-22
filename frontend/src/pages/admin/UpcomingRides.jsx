import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiCalendar, FiMapPin, FiUsers, FiClock, FiImage } from 'react-icons/fi';

const UpcomingRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slogan: '',
    description: '',
    startTime: '',
    endTime: '',
    venue: '',
    difficulty: 'Easy',
    maxCapacity: 50,
    price: 0,
    currency: 'INR',
    distance: 0,
    isActive: true,
    isFeatured: false,
    route: {
      startLocation: '',
      endLocation: '',
      waypoints: []
    },
    requirements: [],
    waypointsText: '',
    requirementsText: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterDifficulty) params.append('difficulty', filterDifficulty);
      if (filterActive) params.append('isActive', filterActive);
      
      const response = await api.get(`/admin/rides?${params.toString()}`);
      
      if (response.data?.success && response.data?.data?.data) {
        setRides(response.data.data.data);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to fetch rides');
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterDifficulty, filterActive]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      slogan: '',
      description: '',
      startTime: '',
      endTime: '',
      venue: '',
      difficulty: 'Easy',
      maxCapacity: 50,
      price: 0,
      currency: 'INR',
      distance: 0,
      isActive: true,
      isFeatured: false,
      route: {
        startLocation: '',
        endLocation: '',
        waypoints: []
      },
      requirements: [],
      waypointsText: '',
      requirementsText: ''
    });
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const handleCreateRide = () => {
    resetForm();
    setModalMode('create');
    setSelectedRide(null);
    setModalOpen(true);
  };

  const handleEditRide = useCallback((ride) => {
    setFormData({
      title: ride.title || '',
      slogan: ride.slogan || '',
      description: ride.description || '',
      startTime: ride.startTime ? new Date(ride.startTime).toISOString().slice(0, 16) : '',
      endTime: ride.endTime ? new Date(ride.endTime).toISOString().slice(0, 16) : '',
      venue: ride.venue || '',
      difficulty: ride.difficulty || 'Easy',
      maxCapacity: ride.maxCapacity || 50,
      price: ride.price || 0,
      currency: ride.currency || 'INR',
      distance: ride.distance || 0,
      isActive: ride.isActive ?? true,
      isFeatured: ride.isFeatured ?? false,
      route: {
        startLocation: ride.route?.startLocation || '',
        endLocation: ride.route?.endLocation || '',
        waypoints: ride.route?.waypoints || []
      },
      requirements: ride.requirements || [],
      waypointsText: ride.route?.waypoints ? ride.route.waypoints.join(', ') : '',
      requirementsText: ride.requirements ? ride.requirements.join(', ') : ''
    });
    setImagePreview(ride.imgUrl || null);
    setImageFile(null);
    setSelectedRide(ride);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const handleViewRide = useCallback((ride) => {
    setSelectedRide(ride);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const handleDeleteRide = useCallback(async (ride) => {
    if (window.confirm(`Are you sure you want to delete "${ride.title}"?`)) {
      try {
        await api.delete(`/admin/rides/${ride._id}`);
        toast.success('Ride deleted successfully');
        fetchRides();
      } catch (error) {
        console.error('Error deleting ride:', error);
        toast.error('Failed to delete ride');
      }
    }
  }, [fetchRides]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'route') {
          // Process waypoints from text before sending
          const routeData = {
            ...formData.route,
            waypoints: formData.waypointsText ? 
              formData.waypointsText.split(',').map(w => w.trim()).filter(w => w) : []
          };
          submitData.append('route', JSON.stringify(routeData));
        } else if (key === 'requirements') {
          // Process requirements from text before sending
          const requirementsData = formData.requirementsText ? 
            formData.requirementsText.split(',').map(r => r.trim()).filter(r => r) : [];
          submitData.append('requirements', JSON.stringify(requirementsData));
        } else if (key !== 'waypointsText' && key !== 'requirementsText') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add image file if selected
      if (imageFile) {
        submitData.append('rideImage', imageFile);
      }
      
      if (modalMode === 'create') {
        await api.post('/admin/rides', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        toast.success('Ride created successfully');
      } else {
        await api.put(`/admin/rides/${selectedRide._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        toast.success('Ride updated successfully');
      }
      
      setModalOpen(false);
      resetForm();
      fetchRides();
    } catch (error) {
      console.error('Error saving ride:', error);
      toast.error(`Failed to ${modalMode === 'create' ? 'create' : 'update'} ride`);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Title',
      accessor: 'title',
      render: (ride) => {
        const title = ride?.title || '-';
        const venue = ride?.venue || '-';
        return (
          <div className="font-medium">
            {title}
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <FiMapPin className="w-3 h-3 mr-1" />
              {venue}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Date & Time',
      accessor: 'startTime',
      render: (ride) => ride?.startTime ? (
        <div className="text-sm">
          <div className="flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(ride.startTime).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-500 mt-1">
            <FiClock className="w-3 h-3 mr-1" />
            {new Date(ride.startTime).toLocaleTimeString()}
          </div>
        </div>
      ) : '-'
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (ride) => {
        const value = ride?.difficulty;
        const colors = {
          'Easy': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Hard': 'bg-orange-100 text-orange-800',
          'Expert': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || '-'}
          </span>
        );
      }
    },
    {
      header: 'Riders',
      accessor: 'riders',
      render: (ride) => (
        <div className="flex items-center text-sm">
          <FiUsers className="w-3 h-3 mr-1" />
          {ride?.registeredCount || 0} / {ride?.maxCapacity || 0}
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (ride) => (
        <div className="text-sm font-medium">
          ₹{ride?.price || 0}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (ride) => (
        <div className="space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ride?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {ride?.isActive ? 'Active' : 'Inactive'}
          </span>
          {ride?.isFeatured && (
            <span className="block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Featured
            </span>
          )}
        </div>
      )
    }
  ], []);

  const filteredRides = useMemo(() => {
    if (!Array.isArray(rides)) return [];
    
    return rides.filter(ride => {
      // Filter out undefined/null items
      if (!ride || typeof ride !== 'object') return false;
      
      const matchesSearch = !searchTerm || 
        ride.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.venue?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = !filterDifficulty || ride.difficulty === filterDifficulty;
      const matchesActive = !filterActive || ride.isActive?.toString() === filterActive;
      
      return matchesSearch && matchesDifficulty && matchesActive;
    });
  }, [rides, searchTerm, filterDifficulty, filterActive]);

  if (loading && rides.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Rides</h1>
          <p className="text-gray-600">Manage upcoming bike rides</p>
        </div>
        <button
          onClick={handleCreateRide}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Ride
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <DataTable
          data={filteredRides}
          columns={columns}
          loading={loading}
          actions={[
            {
              icon: FiEye,
              label: 'View',
              onClick: handleViewRide,
              className: 'text-blue-600 hover:text-blue-900'
            },
            {
              icon: FiEdit3,
              label: 'Edit',
              onClick: handleEditRide,
              className: 'text-green-600 hover:text-green-900'
            },
            {
              icon: FiTrash2,
              label: 'Delete',
              onClick: handleDeleteRide,
              className: 'text-red-600 hover:text-red-900'
            }
          ]}
        />
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          title={
            modalMode === 'create' ? 'Create Ride' :
            modalMode === 'edit' ? 'Edit Ride' : 'View Ride'
          }
          onClose={() => setModalOpen(false)}
        >
          {modalMode === 'view' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selectedRide?.imgUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedRide.imgUrl} 
                      alt={selectedRide.title}
                      className="max-w-48 h-auto max-h-48 rounded-lg border border-gray-200"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedRide?.title}</h3>
                  {selectedRide?.slogan && (
                    <p className="text-blue-600 italic">{selectedRide.slogan}</p>
                  )}
                  <p className="text-gray-600 mt-2">{selectedRide?.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <p className="text-gray-900">
                    {selectedRide?.startTime ? new Date(selectedRide.startTime).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <p className="text-gray-900">
                    {selectedRide?.endTime ? new Date(selectedRide.endTime).toLocaleString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <p className="text-gray-900">{selectedRide?.venue || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <p className="text-gray-900">{selectedRide?.difficulty || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Capacity</label>
                  <p className="text-gray-900">{selectedRide?.maxCapacity || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="text-gray-900">₹{selectedRide?.price || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distance</label>
                  <p className="text-gray-900">{selectedRide?.distance || 0} km</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registered</label>
                  <p className="text-gray-900">{selectedRide?.registeredCount || 0}</p>
                </div>
              </div>

              {selectedRide?.route && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {selectedRide.route.startLocation && (
                      <p><strong>Start:</strong> {selectedRide.route.startLocation}</p>
                    )}
                    {selectedRide.route.endLocation && (
                      <p><strong>End:</strong> {selectedRide.route.endLocation}</p>
                    )}
                    {selectedRide.route.waypoints && selectedRide.route.waypoints.length > 0 && (
                      <p><strong>Waypoints:</strong> {selectedRide.route.waypoints.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedRide?.requirements && selectedRide.requirements.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <ul className="list-disc list-inside text-gray-900">
                    {selectedRide.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRide?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRide?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Featured</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRide?.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRide?.isFeatured ? 'Featured' : 'Not Featured'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slogan
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escape the city chaos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ride Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mumbai to Lonavala"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        price: value === '' ? 0 : parseFloat(value) || 0 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.distance === 0 ? '' : formData.distance}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        distance: value === '' ? 0 : parseFloat(value) || 0 
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Route Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Location
                    </label>
                    <input
                      type="text"
                      value={formData.route.startLocation}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        route: { ...prev.route, startLocation: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Starting point"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Location
                    </label>
                    <input
                      type="text"
                      value={formData.route.endLocation}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        route: { ...prev.route, endLocation: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Destination"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waypoints (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.waypointsText}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      waypointsText: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Stop 1, Stop 2, Stop 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.requirementsText}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    requirementsText: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Helmet required, Own bike, Valid license"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active (visible to users)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Featured ride
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : modalMode === 'create' ? 'Create Ride' : 'Update Ride'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default UpcomingRides;