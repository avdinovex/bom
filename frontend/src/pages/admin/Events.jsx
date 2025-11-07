import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiMapPin, FiUsers, FiUpload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    details: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'other',
    imgUrl: '',
    price: 0,
    maxParticipants: 100,
    isBookingEnabled: true,
    isPublished: false,
    isFeatured: false,
    eventType: 'upcoming',
    status: 'draft',
    registrationDeadline: '',
    tags: '',
    // Venue info
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    // Pricing info
    pricing: {
      isFree: false,
      basePrice: 0,
      currency: 'INR',
      earlyBirdPrice: '',
      earlyBirdDeadline: ''
    },
    // Contact info
    contactInfo: {
      supportEmail: '',
      supportPhone: ''
    }
  });
  
  // Content sections management
  const [contentSections, setContentSections] = useState([]);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionFormData, setSectionFormData] = useState({
    sectionTitle: '',
    subheading: '',
    heading: '',
    content: '',
    imageAlt: '',
    imageUrl: '',
    order: 0,
    layout: 'image-left'
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sectionImageFile, setSectionImageFile] = useState(null);
  const [sectionImagePreview, setSectionImagePreview] = useState('');

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/events', { params: { limit: 100 } });

      const payload = response?.data?.data;
      const eventsData = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.events)
          ? payload.events
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
            : Array.isArray(response?.data?.events)
              ? response.data.events
              : [];

      setEvents(eventsData);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    // Filter out invalid events
    if (!event || typeof event !== 'object') return false;
    
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.category === filterType;
    return matchesSearch && matchesType;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      title: 'Event',
      render: (event) => (
        <div className="flex items-center">
          {event?.imgUrl && (
            <img 
              src={event.imgUrl} 
              alt={event.title || 'Event'}
              className="h-12 w-12 rounded-lg object-cover mr-3"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{event?.title || 'Untitled'}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {event?.details || 'No description'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'startDate',
      title: 'Date & Time',
      render: (event) => {
        const startDate = event?.startDate;
        if (!startDate) return <span className="text-gray-500">No date</span>;
        
        return (
          <div className="text-sm">
            <div className="flex items-center text-gray-900">
              <FiCalendar className="h-3 w-3 mr-1" />
              {new Date(startDate).toLocaleDateString()}
            </div>
            <div className="text-gray-500 text-xs">
              {new Date(startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        );
      }
    },
    {
      key: 'location',
      title: 'Location',
      render: (event) => (
        <div className="flex items-center text-sm text-gray-600">
          <FiMapPin className="h-3 w-3 mr-1" />
          {event?.location || 'No location'}
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (event) => {
        const categoryColors = {
          'mumbai-bikers-mania': 'bg-red-100 text-red-800',
          ride: 'bg-blue-100 text-blue-800',
          workshop: 'bg-purple-100 text-purple-800',
          meetup: 'bg-green-100 text-green-800',
          competition: 'bg-pink-100 text-pink-800',
          other: 'bg-gray-100 text-gray-800'
        };
        const category = event?.category;
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'booking',
      title: 'Booking Info',
      render: (event) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium">₹{event?.price || 0}</div>
          <div className="text-gray-500">
            {event?.currentParticipants || 0}/{event?.maxParticipants || 0} booked
          </div>
          <div className="text-xs">
            {event?.isBookingEnabled ? (
              <span className="text-green-600">Booking Open</span>
            ) : (
              <span className="text-red-600">Booking Closed</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'eventType',
      title: 'Type',
      render: (event) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          event?.eventType === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {event?.eventType || 'upcoming'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (event) => {
        const startDate = event?.startDate;
        if (!startDate) {
          return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              No Date
            </span>
          );
        }

        const now = new Date();
        const eventDate = new Date(startDate);
        let status, statusClass;
        
        if (eventDate > now) {
          status = 'Upcoming';
          statusClass = 'bg-blue-100 text-blue-800';
        } else if (eventDate.toDateString() === now.toDateString()) {
          status = 'Today';
          statusClass = 'bg-yellow-100 text-yellow-800';
        } else {
          status = 'Completed';
          statusClass = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
            {status}
          </span>
        );
      }
    }
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Handle sections with image files - upload them separately
      const sectionsWithImages = contentSections.filter(section => 
        section._imageFile && section._imageFile instanceof File
      );
      const sectionsWithoutImages = contentSections.filter(section => 
        !section._imageFile || !(section._imageFile instanceof File)
      );
      
      const submitData = new FormData();
      
      // Append basic fields
      Object.keys(formData).forEach(key => {
        if (key === 'venue' || key === 'pricing' || key === 'contactInfo') {
          // Handle nested objects
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key !== 'imgUrl') { // Skip imgUrl as we're using file upload
          submitData.append(key, formData[key]);
        }
      });
      
      // Only append sections WITHOUT image files to the main event
      // Sections WITH image files will be added separately via the sections endpoint
      if (sectionsWithoutImages.length > 0) {
        const cleanedSections = sectionsWithoutImages.map(section => {
          const { _imageFile, ...cleanSection } = section;
          return cleanSection;
        });
        submitData.append('contentSections', JSON.stringify(cleanedSections));
      }
      
      // Append main event image if selected
      if (selectedFile) {
        submitData.append('eventImage', selectedFile);
      }

      let savedEvent;
      
      if (editingEvent) {
        // Update event
        const response = await api.put(`/admin/events/${editingEvent._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        savedEvent = response.data.data.event;
        
        // Show success message based on whether there are section images to upload
        if (sectionsWithImages.length === 0) {
          toast.success('Event updated successfully');
        }
      } else {
        // Create event
        const response = await api.post('/admin/events', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        savedEvent = response.data.data.event;
        
        // Show success message based on whether there are section images to upload
        if (sectionsWithImages.length === 0) {
          toast.success('Event created successfully');
        }
      }
      
      // Now upload section images using the dedicated endpoint
      if (sectionsWithImages.length > 0 && savedEvent?._id) {
        for (const section of sectionsWithImages) {
          try {
            const sectionData = new FormData();
            sectionData.append('sectionImage', section._imageFile);
            sectionData.append('sectionTitle', section.sectionTitle);
            sectionData.append('subheading', section.subheading || '');
            sectionData.append('heading', section.heading);
            sectionData.append('content', section.content);
            sectionData.append('imageAlt', section.imageAlt || '');
            sectionData.append('order', section.order || 0);
            sectionData.append('layout', section.layout || 'image-left');
            
            // Check if this is an existing section (has non-temp _id) or new section
            const isExistingSection = section._id && !section._id.toString().startsWith('temp-');
            
            if (isExistingSection && editingEvent) {
              // Update existing section with image
              await api.put(`/admin/events/${savedEvent._id}/content-sections/${section._id}`, sectionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            } else {
              // Add new section with image
              await api.post(`/admin/events/${savedEvent._id}/content-sections`, sectionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            }
          } catch (imgError) {
            console.error('Error uploading section image:', imgError);
            toast.error(`Failed to upload image for: ${section.sectionTitle}`);
          }
        }
        
        // Show final success message with section count
        if (editingEvent) {
          toast.success(`Event updated with ${sectionsWithImages.length} section image(s) successfully!`);
        } else {
          toast.success(`Event created with ${sectionsWithImages.length} section image(s) successfully!`);
        }
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Event submission error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      subtitle: event.subtitle || '',
      description: event.description || '',
      details: event.details || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      category: event.category || 'other',
      imgUrl: event.imgUrl || '',
      price: event.price || event.pricing?.basePrice || 0,
      maxParticipants: event.maxParticipants || event.capacity?.maxParticipants || 100,
      isBookingEnabled: event.isBookingEnabled !== false,
      isPublished: event.isPublished || false,
      isFeatured: event.isFeatured || false,
      eventType: event.eventType || 'upcoming',
      status: event.status || 'draft',
      registrationDeadline: event.registrationDeadline || event.registrationInfo?.deadline ? 
        new Date(event.registrationDeadline || event.registrationInfo.deadline).toISOString().slice(0, 16) : '',
      tags: event.tags ? event.tags.join(', ') : '',
      venue: {
        name: event.venue?.name || '',
        address: event.venue?.address || '',
        city: event.venue?.city || '',
        state: event.venue?.state || '',
        pincode: event.venue?.pincode || ''
      },
      pricing: {
        isFree: event.pricing?.isFree || false,
        basePrice: event.pricing?.basePrice || event.price || 0,
        currency: event.pricing?.currency || 'INR',
        earlyBirdPrice: event.pricing?.earlyBirdPrice || '',
        earlyBirdDeadline: event.pricing?.earlyBirdDeadline ? 
          new Date(event.pricing.earlyBirdDeadline).toISOString().slice(0, 16) : ''
      },
      contactInfo: {
        supportEmail: event.contactInfo?.supportEmail || '',
        supportPhone: event.contactInfo?.supportPhone || ''
      }
    });
    
    // Set content sections
    setContentSections(event.contentSections || []);
    
    setSelectedFile(null);
    setImagePreview(event.imgUrl || '');
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await api.delete(`/admin/events/${event._id}`);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  // Reset form
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

  // Handle section image file selection
  const handleSectionImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSectionImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setSectionImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
        e.target.value = '';
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      details: '',
      startDate: '',
      endDate: '',
      location: '',
      category: 'other',
      imgUrl: '',
      price: 0,
      maxParticipants: 100,
      isBookingEnabled: true,
      isPublished: false,
      isFeatured: false,
      eventType: 'upcoming',
      status: 'draft',
      registrationDeadline: '',
      tags: '',
      venue: {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      },
      pricing: {
        isFree: false,
        basePrice: 0,
        currency: 'INR',
        earlyBirdPrice: '',
        earlyBirdDeadline: ''
      },
      contactInfo: {
        supportEmail: '',
        supportPhone: ''
      }
    });
    setContentSections([]);
    setSelectedFile(null);
    setImagePreview('');
    setEditingEvent(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Get stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.startDate && new Date(e.startDate) > new Date()).length;
  const todayEvents = events.filter(e => 
    e.startDate && new Date(e.startDate).toDateString() === new Date().toDateString()
  ).length;
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
        <p className="text-gray-600 mt-1">Manage community events and gatherings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              <p className="text-gray-600 text-sm">Total Events</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCalendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
              <p className="text-gray-600 text-sm">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiCalendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{todayEvents}</p>
              <p className="text-gray-600 text-sm">Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{events.reduce((sum, event) => sum + (event.currentParticipants || 0), 0)}</p>
              <p className="text-gray-600 text-sm">Total Participants</p>
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
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="mumbai-bikers-mania">Mumbai Bikers Mania</option>
                <option value="ride">Ride</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="competition">Competition</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredEvents}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No events found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description for listings (max 1000 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed event description (for legacy compatibility)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., biking, festival, mumbai, adventure"
                />
              </div>
            </div>
          </div>

          {/* Event Schedule */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Event Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Venue & Location */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Venue & Location</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter general location (e.g., Mumbai, Pune)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.venue.name}
                    onChange={(e) => setFormData({
                      ...formData, 
                      venue: {...formData.venue, name: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Specific venue name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.venue.city}
                    onChange={(e) => setFormData({
                      ...formData, 
                      venue: {...formData.venue, city: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address
                </label>
                <textarea
                  rows={2}
                  value={formData.venue.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    venue: {...formData.venue, address: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Complete venue address"
                />
              </div>
            </div>
          </div>

          {/* Event Classification */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Event Classification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mumbai-bikers-mania">Mumbai Bikers Mania</option>
                  <option value="ride">Ride</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="competition">Competition</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="postponed">Postponed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Registration */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Pricing & Registration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={formData.pricing.isFree}
                    onChange={(e) => setFormData({
                      ...formData, 
                      pricing: {...formData.pricing, isFree: e.target.checked},
                      price: e.target.checked ? 0 : formData.price
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    This is a free event
                  </span>
                </label>
              </div>

              {!formData.pricing.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pricing.basePrice || formData.price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData({
                          ...formData, 
                          pricing: {...formData.pricing, basePrice: value},
                          price: value // Legacy field sync
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Early Bird Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.earlyBirdPrice}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {...formData.pricing, earlyBirdPrice: parseFloat(e.target.value) || ''}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional early bird price"
                    />
                  </div>

                  {formData.pricing.earlyBirdPrice && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Early Bird Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.pricing.earlyBirdDeadline}
                        onChange={(e) => setFormData({
                          ...formData, 
                          pricing: {...formData.pricing, earlyBirdDeadline: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Media & Visibility */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Media & Visibility</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Event Image
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
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Publish Event
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Feature Event
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBookingEnabled}
                      onChange={(e) => setFormData({...formData, isBookingEnabled: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Enable Registration
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.supportEmail}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contactInfo: {...formData.contactInfo, supportEmail: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="support@event.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.supportPhone}
                  onChange={(e) => setFormData({
                    ...formData, 
                    contactInfo: {...formData.contactInfo, supportPhone: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Content Sections Management */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Sections</h3>
              <button
                type="button"
                onClick={() => setShowSectionForm(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Section
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {contentSections.map((section, index) => (
                <div key={section._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center flex-1 gap-3">
                    {/* Section Image Thumbnail */}
                    {section.imageUrl && (
                      <img 
                        src={section.imageUrl} 
                        alt={section.imageAlt || section.heading}
                        className="h-12 w-12 object-cover rounded border border-gray-300"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.heading}</div>
                      <div className="text-xs text-gray-500">
                        {section.sectionTitle} • {section.layout} • Order: {section.order}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSection(section);
                        setSectionFormData(section);
                        // Set image preview if section has an image URL
                        if (section.imageUrl) {
                          setSectionImagePreview(section.imageUrl);
                        }
                        setShowSectionForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContentSections(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {contentSections.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No content sections added. Add sections to create dynamic event pages.
                </p>
              )}
            </div>
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
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Content Section Form Modal */}
      <Modal
        isOpen={showSectionForm}
        onClose={() => {
          setShowSectionForm(false);
          setEditingSection(null);
          setSectionImageFile(null);
          setSectionImagePreview('');
          setSectionFormData({
            sectionTitle: '',
            subheading: '',
            heading: '',
            content: '',
            imageAlt: '',
            imageUrl: '',
            order: contentSections.length,
            layout: 'image-left'
          });
        }}
        title={editingSection ? 'Edit Content Section' : 'Add Content Section'}
        size="lg"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          
          // Prepare section data
          const sectionData = {
            ...sectionFormData
          };
          
          // Only add _imageFile if a file was actually uploaded
          if (sectionImageFile) {
            sectionData._imageFile = sectionImageFile;
          }
          
          if (editingSection) {
            // Update existing section
            const updatedSections = contentSections.map((section, index) => 
              section === editingSection ? { ...sectionData, _id: section._id || `temp-${index}` } : section
            );
            setContentSections(updatedSections);
            toast.success('Section updated successfully');
          } else {
            // Add new section
            setContentSections(prev => [...prev, { 
              ...sectionData, 
              _id: `temp-${Date.now()}`,
              order: prev.length 
            }]);
            toast.success('Section added successfully');
          }
          
          // Reset and close
          setShowSectionForm(false);
          setEditingSection(null);
          setSectionImageFile(null);
          setSectionImagePreview('');
          setSectionFormData({
            sectionTitle: '',
            subheading: '',
            heading: '',
            content: '',
            imageAlt: '',
            imageUrl: '',
            order: 0,
            layout: 'image-left'
          });
        }} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title *
              </label>
              <input
                type="text"
                required
                value={sectionFormData.sectionTitle}
                onChange={(e) => setSectionFormData({...sectionFormData, sectionTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., INTRODUCING, OUR VISION"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout *
              </label>
              <select
                required
                value={sectionFormData.layout}
                onChange={(e) => setSectionFormData({...sectionFormData, layout: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="image-left">Image Left</option>
                <option value="image-right">Image Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Heading *
            </label>
            <textarea
              required
              rows={2}
              value={sectionFormData.heading}
              onChange={(e) => setSectionFormData({...sectionFormData, heading: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Main heading (use \n for line breaks)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              rows={4}
              value={sectionFormData.content}
              onChange={(e) => setSectionFormData({...sectionFormData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Section content/description"
            />
          </div>

          {/* Section Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Image
            </label>
            <div className="space-y-2">
              {/* Image URL Input */}
              <input
                type="url"
                value={sectionFormData.imageUrl || ''}
                onChange={(e) => setSectionFormData({...sectionFormData, imageUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL or upload below"
              />
              
              {/* File Upload */}
              <div className="flex items-center space-x-4">
                <label className="flex-1">
                  <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <FiUpload className="mr-2" />
                    <span className="text-sm text-gray-600">
                      {sectionImageFile ? sectionImageFile.name : 'Upload Image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSectionImageSelect}
                    className="hidden"
                  />
                </label>
                
                {/* Image Preview */}
                {(sectionImagePreview || sectionFormData.imageUrl) && (
                  <img
                    src={sectionImagePreview || sectionFormData.imageUrl}
                    alt="Section preview"
                    className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">
                This image will appear in the section. Upload a new image or provide a URL.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                value={sectionFormData.imageAlt}
                onChange={(e) => setSectionFormData({...sectionFormData, imageAlt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={sectionFormData.order}
                onChange={(e) => setSectionFormData({...sectionFormData, order: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowSectionForm(false);
                setEditingSection(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingSection ? 'Update Section' : 'Add Section'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;