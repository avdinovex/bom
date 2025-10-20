import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiCalendar, FiMapPin, FiUsers, FiImage } from 'react-icons/fi';

const CompletedRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedRide, setSelectedRide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    details: '',
    date: '',
    venue: '',
    distance: '',
    participants: 0,
    highlights: [],
    gallery: [],
    isPublished: true,
    route: {
      startLocation: '',
      endLocation: '',
      waypoints: []
    },
    weather: '',
    difficulty: 'Medium'
  });

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterPublished) params.append('isPublished', filterPublished);
      
      const response = await api.get(`/admin/completed-rides?${params.toString()}`);
      
      if (response.data?.success && response.data?.data?.data) {
        setRides(response.data.data.data);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching completed rides:', error);
      toast.error('Failed to fetch completed rides');
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterPublished]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      details: '',
      date: '',
      venue: '',
      distance: '',
      participants: 0,
      highlights: [],
      gallery: [],
      isPublished: true,
      route: {
        startLocation: '',
        endLocation: '',
        waypoints: []
      },
      weather: '',
      difficulty: 'Medium'
    });
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
      details: ride.details || '',
      date: ride.date ? new Date(ride.date).toISOString().slice(0, 10) : '',
      venue: ride.venue || '',
      distance: ride.distance || '',
      participants: ride.participants || 0,
      highlights: Array.isArray(ride.highlights) ? ride.highlights : [],
      gallery: Array.isArray(ride.gallery) ? ride.gallery : [],
      isPublished: ride.isPublished ?? true,
      route: ride.route || {
        startLocation: '',
        endLocation: '',
        waypoints: []
      },
      weather: ride.weather || '',
      difficulty: ride.difficulty || 'Medium'
    });
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
        await api.delete(`/admin/completed-rides/${ride._id}`);
        toast.success('Completed ride deleted successfully');
        fetchRides();
      } catch (error) {
        console.error('Error deleting completed ride:', error);
        toast.error('Failed to delete completed ride');
      }
    }
  }, [fetchRides]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        await api.post('/admin/completed-rides', formData);
        toast.success('Completed ride created successfully');
      } else {
        await api.put(`/admin/completed-rides/${selectedRide._id}`, formData);
        toast.success('Completed ride updated successfully');
      }
      
      setModalOpen(false);
      resetForm();
      fetchRides();
    } catch (error) {
      console.error('Error saving completed ride:', error);
      toast.error(`Failed to ${modalMode === 'create' ? 'create' : 'update'} completed ride`);
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
      header: 'Date',
      accessor: 'date',
      render: (ride) => ride?.date ? (
        <div className="text-sm flex items-center">
          <FiCalendar className="w-3 h-3 mr-1" />
          {new Date(ride.date).toLocaleDateString()}
        </div>
      ) : '-'
    },
    {
      header: 'Participants',
      accessor: 'participants',
      render: (ride) => (
        <div className="flex items-center text-sm">
          <FiUsers className="w-3 h-3 mr-1" />
          {ride?.participants || 0}
        </div>
      )
    },
    {
      header: 'Distance',
      accessor: 'distance',
      render: (ride) => ride?.distance ? `${ride.distance} km` : '-'
    },
    {
      header: 'Images',
      accessor: 'gallery',
      render: (ride) => (
        <div className="flex items-center text-sm">
          <FiImage className="w-3 h-3 mr-1" />
          {Array.isArray(ride?.gallery) ? ride.gallery.length : 0}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isPublished',
      render: (ride) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ride?.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {ride?.isPublished ? 'Published' : 'Draft'}
        </span>
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
      const matchesPublished = !filterPublished || ride.isPublished?.toString() === filterPublished;
      
      return matchesSearch && matchesPublished;
    });
  }, [rides, searchTerm, filterPublished]);

  if (loading && rides.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Completed Rides</h1>
          <p className="text-gray-600">Manage completed bike ride records</p>
        </div>
        <button
          onClick={handleCreateRide}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Completed Ride
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search completed rides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
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
          title={
            modalMode === 'create' ? 'Add Completed Ride' :
            modalMode === 'edit' ? 'Edit Completed Ride' : 'View Completed Ride'
          }
          onClose={() => setModalOpen(false)}
        >
          {modalMode === 'view' ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedRide?.title}</h3>
                <p className="text-gray-600">{selectedRide?.details}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">
                    {selectedRide?.date ? new Date(selectedRide.date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <p className="text-gray-900">{selectedRide?.venue || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distance</label>
                  <p className="text-gray-900">{selectedRide?.distance ? `${selectedRide.distance} km` : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <p className="text-gray-900">{selectedRide?.participants || 0}</p>
                </div>
              </div>

              {selectedRide?.highlights && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Highlights</label>
                  <p className="text-gray-900">{String(selectedRide.highlights || '')}</p>
                </div>
              )}

              {selectedRide?.route && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <p className="text-gray-900">{String(selectedRide.route || '')}</p>
                </div>
              )}

              {selectedRide?.weather && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weather</label>
                  <p className="text-gray-900">{String(selectedRide.weather || '')}</p>
                </div>
              )}

              {selectedRide?.feedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Feedback</label>
                  <p className="text-gray-900">{String(selectedRide.feedback || '')}</p>
                </div>
              )}

              {selectedRide?.images && Array.isArray(selectedRide.images) && selectedRide.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedRide.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Ride image ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
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
                  Details
                </label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 25.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlights
                </label>
                <textarea
                  rows={3}
                  value={formData.highlights}
                  onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Key highlights and achievements from the ride..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Details
                </label>
                <textarea
                  rows={2}
                  value={formData.route}
                  onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the route taken..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weather Conditions
                  </label>
                  <input
                    type="text"
                    value={formData.weather}
                    onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Sunny, 25°C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Feedback
                  </label>
                  <input
                    type="text"
                    value={formData.feedback}
                    onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Excellent, Good, Average"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Published (visible to users)
                </label>
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
                  {loading ? 'Saving...' : modalMode === 'create' ? 'Create Record' : 'Update Record'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CompletedRides;