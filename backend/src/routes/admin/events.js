import express from 'express';
import Event from '../../models/Event.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';
import logger from '../../config/logger.js';

const router = express.Router();

// @route   GET /api/admin/events
// @desc    Get all events (admin)
// @access  Admin
router.get('/', validate(schemas.eventQuery, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, category, isActive, status, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'createdAt', sortOrder);
  const [events, totalCount] = await Promise.all([
    Event.find(filter).populate('organizer', 'fullName').sort(sort).skip(skip).limit(limitNumber),
    Event.countDocuments(filter)
  ]);

  const result = getPaginationResult(events, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Events retrieved successfully'));
}));

// @route   POST /api/admin/events
// @desc    Create event (admin)
// @access  Admin
router.post('/', uploadSingle('eventImage'), asyncHandler(async (req, res) => {
  const eventData = {
    // Basic Info
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    details: req.body.details, // Legacy field
    
    // Logistics
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    location: req.body.location,
    
    // Venue (if provided as JSON string)
    ...(req.body.venue && typeof req.body.venue === 'string' ? 
      { venue: JSON.parse(req.body.venue) } : 
      req.body.venue ? { venue: req.body.venue } : {}),
    
    // Classification
    category: req.body.category,
    tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : [],
    
    // Status & Visibility
    isActive: req.body.isActive !== 'false',
    isFeatured: req.body.isFeatured === 'true',
    isPublished: req.body.isPublished === 'true',
    eventType: req.body.eventType,
    status: req.body.status || 'draft',
    
    // Organizer
    organizer: req.user._id,
    
    // Registration
    registrationInfo: req.body.registrationInfo ? 
      (typeof req.body.registrationInfo === 'string' ? 
        JSON.parse(req.body.registrationInfo) : req.body.registrationInfo) : {
        isRequired: req.body.isBookingEnabled !== 'false',
        deadline: req.body.registrationDeadline
      },
    
    // Pricing
    pricing: req.body.pricing ? 
      (typeof req.body.pricing === 'string' ? 
        JSON.parse(req.body.pricing) : req.body.pricing) : {
        isFree: parseFloat(req.body.price || 0) === 0,
        basePrice: parseFloat(req.body.price) || 0,
        currency: 'INR'
      },
    
    // Capacity
    capacity: req.body.capacity ? 
      (typeof req.body.capacity === 'string' ? 
        JSON.parse(req.body.capacity) : req.body.capacity) : {
        maxParticipants: parseInt(req.body.maxParticipants) || 100,
        currentParticipants: 0,
        waitlistEnabled: true
      },
    
    // Legacy fields for backward compatibility
    price: parseFloat(req.body.price) || 0,
    maxParticipants: parseInt(req.body.maxParticipants) || 100,
    isBookingEnabled: req.body.isBookingEnabled !== 'false',
    registrationDeadline: req.body.registrationDeadline,
    
    // Content Sections (if provided)
    contentSections: req.body.contentSections ? 
      (typeof req.body.contentSections === 'string' ? 
        JSON.parse(req.body.contentSections) : req.body.contentSections).map(section => {
          // Remove temporary IDs that start with "temp-"
          const cleanSection = { ...section };
          if (cleanSection._id && typeof cleanSection._id === 'string' && cleanSection._id.startsWith('temp-')) {
            delete cleanSection._id;
          }
          return cleanSection;
        }) : [],
    
    // Requirements (if provided)
    requirements: req.body.requirements ? 
      (typeof req.body.requirements === 'string' ? 
        JSON.parse(req.body.requirements) : req.body.requirements) : {},
    
    // Contact Info (if provided)
    contactInfo: req.body.contactInfo ? 
      (typeof req.body.contactInfo === 'string' ? 
        JSON.parse(req.body.contactInfo) : req.body.contactInfo) : {}
  };
  
  // Add main image URL if file was uploaded
  if (req.file && req.file.cloudinaryUrl) {
    eventData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const event = await Event.create(eventData);
  await event.populate('organizer', 'fullName');
  res.status(201).json(new ApiResponse(201, { event }, 'Event created successfully'));
}));

// @route   GET /api/admin/events/:id
// @desc    Get single event (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'fullName email');
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(new ApiResponse(200, { event }, 'Event retrieved successfully'));
}));

// @route   PUT /api/admin/events/:id
// @desc    Update event (admin)
// @access  Admin
router.put('/:id', uploadSingle('eventImage'), asyncHandler(async (req, res) => {
  const existingEvent = await Event.findById(req.params.id);
  if (!existingEvent) throw new ApiError(404, 'Event not found');
  
  const updateData = {
    // Basic Info
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    details: req.body.details, // Legacy field
    
    // Logistics
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    location: req.body.location,
    
    // Venue (if provided)
    ...(req.body.venue && typeof req.body.venue === 'string' ? 
      { venue: JSON.parse(req.body.venue) } : 
      req.body.venue ? { venue: req.body.venue } : {}),
    
    // Classification
    category: req.body.category,
    tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : undefined,
    
    // Status & Visibility
    isActive: req.body.isActive !== 'false',
    isFeatured: req.body.isFeatured === 'true',
    isPublished: req.body.isPublished === 'true',
    eventType: req.body.eventType,
    status: req.body.status,
    
    // Registration (update if provided)
    ...(req.body.registrationInfo ? {
      registrationInfo: typeof req.body.registrationInfo === 'string' ? 
        JSON.parse(req.body.registrationInfo) : req.body.registrationInfo
    } : {
      'registrationInfo.isRequired': req.body.isBookingEnabled !== 'false',
      'registrationInfo.deadline': req.body.registrationDeadline
    }),
    
    // Pricing (update if provided)
    ...(req.body.pricing ? {
      pricing: typeof req.body.pricing === 'string' ? 
        JSON.parse(req.body.pricing) : req.body.pricing
    } : {
      'pricing.isFree': parseFloat(req.body.price || 0) === 0,
      'pricing.basePrice': parseFloat(req.body.price) || 0
    }),
    
    // Capacity (update if provided)
    ...(req.body.capacity ? {
      capacity: typeof req.body.capacity === 'string' ? 
        JSON.parse(req.body.capacity) : req.body.capacity
    } : {
      'capacity.maxParticipants': parseInt(req.body.maxParticipants) || undefined
    }),
    
    // Legacy fields for backward compatibility
    price: parseFloat(req.body.price) || 0,
    maxParticipants: parseInt(req.body.maxParticipants) || undefined,
    isBookingEnabled: req.body.isBookingEnabled !== 'false',
    registrationDeadline: req.body.registrationDeadline,
    
    // Content Sections (if provided)
    contentSections: req.body.contentSections ? 
      (typeof req.body.contentSections === 'string' ? 
        JSON.parse(req.body.contentSections) : req.body.contentSections).map(section => {
          // Remove temporary IDs that start with "temp-"
          const cleanSection = { ...section };
          if (cleanSection._id && typeof cleanSection._id === 'string' && cleanSection._id.startsWith('temp-')) {
            delete cleanSection._id;
          }
          return cleanSection;
        }) : undefined,
    
    // Requirements (if provided)
    requirements: req.body.requirements ? 
      (typeof req.body.requirements === 'string' ? 
        JSON.parse(req.body.requirements) : req.body.requirements) : undefined,
    
    // Contact Info (if provided)
    contactInfo: req.body.contactInfo ? 
      (typeof req.body.contactInfo === 'string' ? 
        JSON.parse(req.body.contactInfo) : req.body.contactInfo) : undefined
  };
  
  // Remove undefined fields to prevent overwriting existing data
  Object.keys(updateData).forEach(key => 
    updateData[key] === undefined && delete updateData[key]
  );
  
  // Handle image update
  if (req.file && req.file.cloudinaryUrl) {
    // Delete old image if it exists and is from cloudinary
    if (existingEvent.imgUrl && existingEvent.imgUrl.includes('cloudinary')) {
      try {
        const deleteResult = await deleteFromCloudinary(existingEvent.imgUrl);
        if (deleteResult && deleteResult.result !== 'skipped') {
          logger.info('Old event image deleted successfully');
        }
      } catch (error) {
        // Log but don't fail the request if image deletion fails
        logger.error('Error deleting old image:', error);
      }
    }
    updateData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const event = await Event.findByIdAndUpdate(req.params.id, updateData, { 
    new: true, 
    runValidators: true 
  }).populate('organizer', 'fullName');
  
  res.json(new ApiResponse(200, { event }, 'Event updated successfully'));
}));

// @route   POST /api/admin/events/:id/content-sections
// @desc    Add content section to event (admin)
// @access  Admin
router.post('/:id/content-sections', uploadSingle('sectionImage'), asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  const newSection = {
    sectionTitle: req.body.sectionTitle,
    subheading: req.body.subheading,
    heading: req.body.heading,
    content: req.body.content,
    imageAlt: req.body.imageAlt,
    order: parseInt(req.body.order) || event.contentSections.length,
    layout: req.body.layout || 'image-left'
  };
  
  // Add section image if uploaded
  if (req.file && req.file.cloudinaryUrl) {
    newSection.imageUrl = req.file.cloudinaryUrl;
  }
  
  event.contentSections.push(newSection);
  await event.save();
  
  res.status(201).json(new ApiResponse(201, { 
    event,
    addedSection: event.contentSections[event.contentSections.length - 1]
  }, 'Content section added successfully'));
}));

// @route   PUT /api/admin/events/:id/content-sections/:sectionId
// @desc    Update content section (admin)
// @access  Admin
router.put('/:id/content-sections/:sectionId', uploadSingle('sectionImage'), asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  const section = event.contentSections.id(req.params.sectionId);
  if (!section) throw new ApiError(404, 'Content section not found');
  
  // Store old image URL for cleanup
  const oldImageUrl = section.imageUrl;
  
  // Update section fields
  if (req.body.sectionTitle !== undefined) section.sectionTitle = req.body.sectionTitle;
  if (req.body.subheading !== undefined) section.subheading = req.body.subheading;
  if (req.body.heading !== undefined) section.heading = req.body.heading;
  if (req.body.content !== undefined) section.content = req.body.content;
  if (req.body.imageAlt !== undefined) section.imageAlt = req.body.imageAlt;
  if (req.body.order !== undefined) section.order = parseInt(req.body.order);
  if (req.body.layout !== undefined) section.layout = req.body.layout;
  
  // Handle image update
  if (req.file && req.file.cloudinaryUrl) {
    // Delete old image if it exists and is from cloudinary
    if (oldImageUrl && oldImageUrl.includes('cloudinary')) {
      try {
        const deleteResult = await deleteFromCloudinary(oldImageUrl);
        if (deleteResult && deleteResult.result !== 'skipped') {
          logger.info('Old section image deleted successfully');
        }
      } catch (error) {
        // Log but don't fail the request if image deletion fails
        logger.error('Error deleting old section image:', error);
      }
    }
    section.imageUrl = req.file.cloudinaryUrl;
  }
  
  await event.save();
  
  res.json(new ApiResponse(200, { event, updatedSection: section }, 'Content section updated successfully'));
}));

// @route   DELETE /api/admin/events/:id/content-sections/:sectionId
// @desc    Delete content section (admin)
// @access  Admin
router.delete('/:id/content-sections/:sectionId', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  const section = event.contentSections.id(req.params.sectionId);
  if (!section) throw new ApiError(404, 'Content section not found');
  
  // Delete section image if it exists
  if (section.imageUrl && section.imageUrl.includes('cloudinary')) {
    try {
      const deleteResult = await deleteFromCloudinary(section.imageUrl);
      if (deleteResult && deleteResult.result !== 'skipped') {
        logger.info('Section image deleted successfully');
      }
    } catch (error) {
      // Log but don't fail the request if image deletion fails
      logger.error('Error deleting section image:', error);
    }
  }
  
  event.contentSections.pull(req.params.sectionId);
  await event.save();
  
  res.json(new ApiResponse(200, { event }, 'Content section deleted successfully'));
}));

// @route   POST /api/admin/events/:id/duplicate
// @desc    Duplicate event (admin)
// @access  Admin
router.post('/:id/duplicate', asyncHandler(async (req, res) => {
  const originalEvent = await Event.findById(req.params.id);
  if (!originalEvent) throw new ApiError(404, 'Event not found');
  
  const eventData = originalEvent.toObject();
  delete eventData._id;
  delete eventData.createdAt;
  delete eventData.updatedAt;
  delete eventData.__v;
  
  // Clean content sections by removing their _id fields so new ones are generated
  if (eventData.contentSections && eventData.contentSections.length > 0) {
    eventData.contentSections = eventData.contentSections.map(section => {
      const cleanSection = { ...section };
      delete cleanSection._id;
      return cleanSection;
    });
  }
  
  // Reset some fields for the duplicate
  eventData.title = `${eventData.title} (Copy)`;
  eventData.status = 'draft';
  eventData.isPublished = false;
  eventData.organizer = req.user._id;
  if (eventData.capacity) {
    eventData.capacity.currentParticipants = 0;
  }
  eventData.currentParticipants = 0;
  
  // Clear analytics
  eventData.analytics = {
    views: 0,
    registrations: 0,
    completions: 0,
    ratings: { average: 0, count: 0 }
  };
  
  const duplicatedEvent = await Event.create(eventData);
  await duplicatedEvent.populate('organizer', 'fullName');
  
  res.status(201).json(new ApiResponse(201, { event: duplicatedEvent }, 'Event duplicated successfully'));
}));

// @route   POST /api/admin/events/:id/publish
// @desc    Publish/Unpublish event (admin)
// @access  Admin
router.post('/:id/publish', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  const { isPublished } = req.body;
  
  event.isPublished = isPublished;
  event.status = isPublished ? 'published' : 'draft';
  
  await event.save();
  
  const action = isPublished ? 'published' : 'unpublished';
  res.json(new ApiResponse(200, { event }, `Event ${action} successfully`));
}));

// @route   GET /api/admin/events/stats/overview
// @desc    Get events statistics (admin)
// @access  Admin
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const [
    totalEvents,
    publishedEvents,
    draftEvents,
    upcomingEvents,
    ongoingEvents,
    completedEvents,
    totalRegistrations,
    totalRevenue
  ] = await Promise.all([
    Event.countDocuments({ isActive: true }),
    Event.countDocuments({ isActive: true, isPublished: true }),
    Event.countDocuments({ isActive: true, status: 'draft' }),
    Event.countDocuments({ isActive: true, eventType: 'upcoming', isPublished: true }),
    Event.countDocuments({ isActive: true, eventType: 'ongoing', isPublished: true }),
    Event.countDocuments({ isActive: true, eventType: 'past', status: 'completed' }),
    Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$analytics.registrations' } } }
    ]).then(result => result[0]?.total || 0),
    Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$pricing.basePrice', '$analytics.registrations'] } } } }
    ]).then(result => result[0]?.total || 0)
  ]);
  
  // Get recent events
  const recentEvents = await Event.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('organizer', 'fullName')
    .select('title startDate status analytics.registrations');
  
  // Get popular events
  const popularEvents = await Event.find({ isActive: true, isPublished: true })
    .sort({ 'analytics.views': -1, 'analytics.registrations': -1 })
    .limit(5)
    .select('title analytics.views analytics.registrations');
  
  const stats = {
    overview: {
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      totalRegistrations,
      totalRevenue
    },
    recentEvents,
    popularEvents
  };
  
  res.json(new ApiResponse(200, stats, 'Event statistics retrieved successfully'));
}));

// @route   DELETE /api/admin/events/:id
// @desc    Delete event (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  
  // Delete main image from cloudinary if it exists
  if (event.imgUrl && event.imgUrl.includes('cloudinary')) {
    try {
      const deleteResult = await deleteFromCloudinary(event.imgUrl);
      if (deleteResult && deleteResult.result !== 'skipped') {
        logger.info('Main event image deleted successfully');
      }
    } catch (error) {
      // Log but don't fail the request if image deletion fails
      logger.error('Error deleting main image:', error);
    }
  }
  
  // Delete all section images from cloudinary
  if (event.contentSections && event.contentSections.length > 0) {
    for (const section of event.contentSections) {
      if (section.imageUrl && section.imageUrl.includes('cloudinary')) {
        try {
          const deleteResult = await deleteFromCloudinary(section.imageUrl);
          if (deleteResult && deleteResult.result !== 'skipped') {
            logger.info('Section image deleted successfully');
          }
        } catch (error) {
          // Log but don't fail the request if image deletion fails
          logger.error('Error deleting section image:', error);
        }
      }
    }
  }
  
  await event.deleteOne();
  res.json(new ApiResponse(200, null, 'Event deleted successfully'));
}));

// @route   PATCH /api/admin/events/:id/audience-pricing
// @desc    Update audience ticket price and capacity for an event
// @access  Admin
router.patch('/:id/audience-pricing', asyncHandler(async (req, res) => {
  const { audienceTicketPrice, audienceCapacity } = req.body;

  // Validate inputs
  if (audienceTicketPrice !== undefined && (isNaN(audienceTicketPrice) || audienceTicketPrice < 0)) {
    throw new ApiError(400, 'Invalid audience ticket price');
  }

  if (audienceCapacity !== undefined && (isNaN(audienceCapacity) || audienceCapacity < 0)) {
    throw new ApiError(400, 'Invalid audience capacity');
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Update fields if provided
  if (audienceTicketPrice !== undefined) {
    event.audienceTicketPrice = parseFloat(audienceTicketPrice);
  }

  if (audienceCapacity !== undefined) {
    const newCapacity = parseInt(audienceCapacity);
    // Check if new capacity is less than already booked count
    if (event.audienceBookedCount > newCapacity) {
      throw new ApiError(400, `Cannot set capacity lower than current bookings (${event.audienceBookedCount})`);
    }
    event.audienceCapacity = newCapacity;
  }

  await event.save();

  res.json(new ApiResponse(200, {
    event: {
      _id: event._id,
      title: event.title,
      audienceTicketPrice: event.audienceTicketPrice,
      audienceCapacity: event.audienceCapacity,
      audienceBookedCount: event.audienceBookedCount
    }
  }, 'Audience pricing updated successfully'));
}));

export default router;