import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api, { completedRidesAPI } from '../../services/api';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiCalendar, FiMapPin, FiUsers, FiImage, FiCheckCircle } from 'react-icons/fi';

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
    distance: 0,
    duration: '',
    participants: 0,
    highlights: [],
    gallery: [],
    isPublished: true,
    isFeatured: false,
    route: {
      startLocation: '',
      endLocation: '',
      waypoints: []
    },
    weather: '',
    difficulty: 'Medium',
    tags: [],
    stats: {
      averageSpeed: 0,
      totalElevation: 0,
      maxSpeed: 0
    }
  });

  // Image uploads
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const fetchRides = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterPublished) params.isPublished = filterPublished;
      
      const response = await completedRidesAPI.getAll(params);
      
      if (response?.success && response?.data?.data) {
        setRides(response.data.data);
      } else if (response?.data) {
        // Handle different response structure
        setRides(Array.isArray(response.data) ? response.data : []);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching completed rides:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch completed rides';
      toast.error(errorMessage);
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
      distance: 0,
      duration: '',
      participants: 0,
      highlights: [],
      gallery: [],
      isPublished: true,
      isFeatured: false,
      route: {
        startLocation: '',
        endLocation: '',
        waypoints: []
      },
      weather: '',
      difficulty: 'Medium',
      tags: [],
      stats: {
        averageSpeed: 0,
        totalElevation: 0,
        maxSpeed: 0
      }
    });
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
  }, []);

  const handleCreateRide = () => {
    console.log('Create ride button clicked');
    resetForm();
    setModalMode('create');
    setSelectedRide(null);
    setModalOpen(true);
  };

  const handleEditRide = useCallback((ride) => {
    console.log('Edit ride button clicked', ride);
    setFormData({
      title: ride.title || '',
      details: ride.details || '',
      date: ride.date ? new Date(ride.date).toISOString().slice(0, 10) : '',
      venue: ride.venue || '',
      distance: ride.distance || 0,
      duration: ride.duration || '',
      participants: ride.participants || 0,
      highlights: Array.isArray(ride.highlights) ? ride.highlights : [],
      gallery: Array.isArray(ride.gallery) ? ride.gallery : [],
      isPublished: ride.isPublished ?? true,
      isFeatured: ride.isFeatured ?? false,
      route: ride.route || {
        startLocation: '',
        endLocation: '',
        waypoints: []
      },
      weather: ride.weather || '',
      difficulty: ride.difficulty || 'Medium',
      tags: Array.isArray(ride.tags) ? ride.tags : [],
      stats: ride.stats || {
        averageSpeed: 0,
        totalElevation: 0,
        maxSpeed: 0
      }
    });
    setCoverImagePreview(ride.imgUrl || null);
    setCoverImageFile(null);
    setGalleryFiles([]);
    setGalleryPreviews(Array.isArray(ride.gallery) ? ride.gallery : []);
    setSelectedRide(ride);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const handleViewRide = useCallback((ride) => {
    console.log('View ride button clicked', ride);
    setSelectedRide(ride);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const handleDeleteRide = useCallback(async (ride) => {
    console.log('Delete ride button clicked', ride);
    if (window.confirm(`Are you sure you want to delete "${ride.title}"?`)) {
      try {
        await completedRidesAPI.delete(ride._id);
        toast.success('Completed ride deleted successfully');
        fetchRides();
      } catch (error) {
        console.error('Error deleting completed ride:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete completed ride';
        toast.error(errorMessage);
      }
    }
  }, [fetchRides]);

  const handleCompleteRide = useCallback(async (ride) => {
    console.log('Complete ride button clicked', ride);
    try {
      const updateData = {
        ...ride,
        isPublished: true,
        isFeatured: true
      };
      await completedRidesAPI.update(ride._id, updateData);
      toast.success('Ride marked as completed and featured');
      fetchRides();
    } catch (error) {
      console.error('Error completing ride:', error);
      const errorMessage = error.response?.data?.message || 'Failed to complete ride';
      toast.error(errorMessage);
    }
  }, [fetchRides]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', { modalMode, formData });
    
    try {
      setLoading(true);
      
      // Use FormData to support image uploads (cover + gallery)
      const submitData = new FormData();

      // Primitive fields
      submitData.append('title', formData.title);
      submitData.append('details', formData.details || '');
      submitData.append('date', formData.date);
      submitData.append('venue', formData.venue);
      submitData.append('distance', String(Number(formData.distance) || 0));
      submitData.append('duration', formData.duration || '');
      submitData.append('participants', String(Number(formData.participants) || 0));
      submitData.append('difficulty', formData.difficulty || 'Medium');
      submitData.append('weather', formData.weather || '');
      submitData.append('isPublished', String(!!formData.isPublished));
      submitData.append('isFeatured', String(!!formData.isFeatured));

      // Arrays/objects as JSON
      const highlights = Array.isArray(formData.highlights)
        ? formData.highlights
        : (formData.highlights ? formData.highlights.split(',').map(h => h.trim()).filter(Boolean) : []);
      submitData.append('highlights', JSON.stringify(highlights));

      const tags = Array.isArray(formData.tags)
        ? formData.tags
        : (formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      submitData.append('tags', JSON.stringify(tags));

      submitData.append('route', JSON.stringify({
        startLocation: formData.route?.startLocation || '',
        endLocation: formData.route?.endLocation || '',
        waypoints: Array.isArray(formData.route?.waypoints) ? formData.route.waypoints : []
      }));

      submitData.append('stats', JSON.stringify({
        averageSpeed: Number(formData.stats?.averageSpeed) || 0,
        totalElevation: Number(formData.stats?.totalElevation) || 0,
        maxSpeed: Number(formData.stats?.maxSpeed) || 0
      }));

      // Files
      if (coverImageFile) {
        submitData.append('coverImage', coverImageFile);
      }
      if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
        galleryFiles.forEach(file => submitData.append('gallery', file));
      }

      if (modalMode === 'create') {
        await api.post('/admin/completed-rides', submitData);
        toast.success('Completed ride created successfully');
      } else {
        await api.put(`/admin/completed-rides/${selectedRide._id}`, submitData);
        toast.success('Completed ride updated successfully');
      }
      
      setModalOpen(false);
      resetForm();
      fetchRides();
    } catch (error) {
      console.error('Error saving completed ride:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} completed ride`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
    // Generate previews
    const readers = files.map(file => new Promise(resolve => {
      const fr = new FileReader();
      fr.onloadend = () => resolve(fr.result);
      fr.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => setGalleryPreviews(results));
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
      header: 'Duration',
      accessor: 'duration',
      render: (ride) => ride?.duration || '-'
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (ride) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          ride?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          ride?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          ride?.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {ride?.difficulty || 'Medium'}
        </span>
      )
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
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            ride?.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {ride?.isPublished ? 'Published' : 'Draft'}
          </span>
          {ride?.isFeatured && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
              onClick: (ride) => {
                console.log('DataTable View action clicked', ride);
                handleViewRide(ride);
              },
              className: 'text-blue-600 hover:text-blue-900'
            },
            {
              icon: FiCheckCircle,
              label: 'Complete',
              onClick: (ride) => {
                console.log('DataTable Complete action clicked', ride);
                handleCompleteRide(ride);
              },
              className: 'text-green-600 hover:text-green-900',
              condition: (ride) => !ride?.isFeatured
            },
            {
              icon: FiEdit3,
              label: 'Edit',
              onClick: (ride) => {
                console.log('DataTable Edit action clicked', ride);
                handleEditRide(ride);
              },
              className: 'text-yellow-600 hover:text-yellow-900'
            },
            {
              icon: FiTrash2,
              label: 'Delete',
              onClick: (ride) => {
                console.log('DataTable Delete action clicked', ride);
                handleDeleteRide(ride);
              },
              className: 'text-red-600 hover:text-red-900'
            }
          ]}
        />
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          title={
            modalMode === 'create' ? 'Add Completed Ride' :
            modalMode === 'edit' ? 'Edit Completed Ride' : 'View Completed Ride'
          }
          onClose={() => setModalOpen(false)}
        >
          {modalMode === 'view' ? (
            <div className="space-y-4">
              {selectedRide?.imgUrl && (
                <div>
                  <img
                    src={selectedRide.imgUrl}
                    alt={selectedRide.title}
                    className="w-full max-h-56 object-cover rounded border"
                  />
                </div>
              )}
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
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-gray-900">{selectedRide?.duration || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <p className="text-gray-900">{selectedRide?.participants || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <p className="text-gray-900">{selectedRide?.difficulty || 'Medium'}</p>
                </div>
              </div>

              {selectedRide?.highlights && Array.isArray(selectedRide.highlights) && selectedRide.highlights.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Highlights</label>
                  <ul className="text-gray-900 list-disc list-inside">
                    {selectedRide.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRide?.route && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <div className="text-gray-900">
                    <p><strong>Start:</strong> {selectedRide.route.startLocation || '-'}</p>
                    <p><strong>End:</strong> {selectedRide.route.endLocation || '-'}</p>
                    {selectedRide.route.waypoints && selectedRide.route.waypoints.length > 0 && (
                      <p><strong>Waypoints:</strong> {selectedRide.route.waypoints.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedRide?.weather && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weather</label>
                  <p className="text-gray-900">{selectedRide.weather}</p>
                </div>
              )}

              {selectedRide?.tags && Array.isArray(selectedRide.tags) && selectedRide.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRide.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRide?.stats && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statistics</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-600">Avg Speed</p>
                      <p className="font-medium">{selectedRide.stats.averageSpeed || 0} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Elevation</p>
                      <p className="font-medium">{selectedRide.stats.totalElevation || 0} m</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Speed</p>
                      <p className="font-medium">{selectedRide.stats.maxSpeed || 0} km/h</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedRide?.gallery && Array.isArray(selectedRide.gallery) && selectedRide.gallery.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedRide.gallery.map((image, index) => (
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

              <div className="flex items-center gap-4">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRide?.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRide?.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {selectedRide?.isFeatured && (
                  <div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                {coverImagePreview && (
                  <img src={coverImagePreview} alt="Cover preview" className="w-40 h-28 object-cover rounded border mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                  maxLength={3000}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.distance}
                    onChange={(e) => setFormData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 4 hours"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Highlights (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(formData.highlights) ? formData.highlights.join(', ') : formData.highlights}
                  onChange={(e) => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Beautiful scenery, Great teamwork, Perfect weather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="adventure, cycling, weekend, mountain"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Details
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.route.startLocation}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      route: { ...prev.route, startLocation: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start location"
                  />
                  <input
                    type="text"
                    value={formData.route.endLocation}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      route: { ...prev.route, endLocation: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End location"
                  />
                </div>
                <input
                  type="text"
                  value={Array.isArray(formData.route.waypoints) ? formData.route.waypoints.join(', ') : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    route: { 
                      ...prev.route, 
                      waypoints: e.target.value ? e.target.value.split(',').map(w => w.trim()) : []
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                  placeholder="Waypoints (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statistics
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.stats.averageSpeed}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      stats: { ...prev.stats, averageSpeed: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Avg Speed (km/h)"
                  />
                  <input
                    type="number"
                    min="0"
                    value={formData.stats.totalElevation}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      stats: { ...prev.stats, totalElevation: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Total Elevation (m)"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.stats.maxSpeed}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      stats: { ...prev.stats, maxSpeed: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max Speed (km/h)"
                  />
                </div>
              </div>


              <div className="flex items-center space-x-6">
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