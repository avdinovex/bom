import express from 'express';
import Event from '../models/Event.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (public)
// @access  Public
router.get('/', optionalAuth, validate(schemas.eventQuery, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, category, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter - more lenient to show admin-created events
  const filter = { 
    isActive: true
    // Temporarily remove isPublished requirement
    // isPublished: true
  };
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { 'venue.city': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy, sortOrder);

  console.log('Events filter:', JSON.stringify(filter, null, 2));

  // Execute queries
  const [events, totalCount] = await Promise.all([
    Event.find(filter)
      .populate('organizer', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Event.countDocuments(filter)
  ]);

  console.log(`Found ${events.length} events total`);

  const result = getPaginationResult(events, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Events retrieved successfully'));
}));

// @route   GET /api/events/type/:eventType
// @desc    Get events by type (upcoming/past)
// @access  Public
router.get('/type/:eventType', optionalAuth, validate(schemas.eventQuery, 'query'), asyncHandler(async (req, res) => {
  const { eventType } = req.params;
  const { page, limit, sortBy, sortOrder, category, search } = req.query;
  
  // Validate event type
  if (!['upcoming', 'past'].includes(eventType)) {
    return res.status(400).json(new ApiResponse(400, null, 'Invalid event type. Must be "upcoming" or "past"'));
  }
  
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter - more flexible to work with admin-created events
  const filter = { 
    isActive: true
    // Remove isPublished requirement for now to get admin events
    // isPublished: true
  };
  
  // Add category filter
  if (category) filter.category = category;
  
  // For date-based filtering instead of relying on eventType field
  const now = new Date();
  if (eventType === 'upcoming') {
    // Events that haven't started yet OR events without end date that started recently
    filter.$or = [
      { startDate: { $gte: now } },
      { 
        startDate: { $lte: now }, 
        $or: [
          { endDate: { $gte: now } },
          { endDate: { $exists: false } }
        ]
      }
    ];
  } else if (eventType === 'past') {
    // Events that have definitely ended
    filter.$and = [
      { startDate: { $lte: now } },
      { 
        $or: [
          { endDate: { $lte: now } },
          { 
            endDate: { $exists: false },
            startDate: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // 24 hours ago
          }
        ]
      }
    ];
  }
  
  // Add search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { 'venue.city': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Get sort options - default to startDate for events
  const defaultSortBy = eventType === 'upcoming' ? 'startDate' : '-startDate';
  const sort = getSortOptions(sortBy || defaultSortBy, sortOrder);


  // Execute queries
  const [events, totalCount] = await Promise.all([
    Event.find(filter)
      .populate('organizer', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Event.countDocuments(filter)
  ]);

  console.log(`Found ${events.length} ${eventType} events`);

  const result = getPaginationResult(events, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, `${eventType} events retrieved successfully`));
}));

// @route   GET /api/events/:id
// @desc    Get single event with analytics update
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const event = await Event.findOne({ 
    _id: req.params.id, 
    isActive: true,
    $or: [
      { isPublished: true },
      { organizer: req.user?._id } // Allow organizer to view unpublished events
    ]
  })
    .populate('organizer', 'fullName email')
    .populate('coOrganizers', 'fullName email');

  if (!event) {
    return res.status(404).json({
      status: 'error',
      message: 'Event not found'
    });
  }

  // Increment view count (but not for organizer)
  if (!req.user || req.user._id.toString() !== event.organizer._id.toString()) {
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { 'analytics.views': 1 }
    });
  }

  res.json(new ApiResponse(200, { event }, 'Event retrieved successfully'));
}));

// @route   GET /api/events/categories/list
// @desc    Get all event categories
// @access  Public
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Event.distinct('category', { isActive: true });
  
  res.json(new ApiResponse(200, { categories }, 'Categories retrieved successfully'));
}));

// @route   GET /api/events/featured/list
// @desc    Get featured events
// @access  Public
router.get('/featured/list', asyncHandler(async (req, res) => {
  const events = await Event.find({ 
    isActive: true,
    isPublished: true,
    $or: [
      { isFeatured: true },
      { startDate: { $gte: new Date() } }
    ]
  })
    .populate('organizer', 'fullName')
    .sort({ isFeatured: -1, startDate: 1 })
    .limit(6);

  res.json(new ApiResponse(200, { events }, 'Featured events retrieved successfully'));
}));

// @route   GET /api/events/mumbai-bikers-mania/latest
// @desc    Get latest Mumbai Bikers Mania event
// @access  Public
router.get('/mumbai-bikers-mania/latest', asyncHandler(async (req, res) => {
  const event = await Event.findOne({ 
    isActive: true,
    // Remove isPublished requirement for now
    // isPublished: true,
    category: 'mumbai-bikers-mania'
  })
    .populate('organizer', 'fullName')
    .populate('coOrganizers', 'fullName')
    .sort({ startDate: -1 });

  if (!event) {
    return res.status(404).json(new ApiResponse(404, null, 'No Mumbai Bikers Mania event found'));
  }

  res.json(new ApiResponse(200, { event }, 'Latest Mumbai Bikers Mania event retrieved successfully'));
}));

// @route   GET /api/events/mumbai-bikers-mania/all
// @desc    Get all Mumbai Bikers Mania events (for debugging)
// @access  Public
router.get('/mumbai-bikers-mania/all', asyncHandler(async (req, res) => {
  const events = await Event.find({ 
    isActive: true,
    category: 'mumbai-bikers-mania'
  })
    .populate('organizer', 'fullName')
    .populate('coOrganizers', 'fullName')
    .sort({ startDate: -1 });

  console.log(`Found ${events.length} Mumbai Bikers Mania events`);
  if (events.length > 0) {
    console.log('First event:', {
      title: events[0].title,
      startDate: events[0].startDate,
      isPublished: events[0].isPublished,
      status: events[0].status,
      eventType: events[0].eventType
    });
  }

  res.json(new ApiResponse(200, { events }, `Found ${events.length} Mumbai Bikers Mania events`));
}));

// @route   GET /api/events/debug/all
// @desc    Get all events for debugging (no filters)
// @access  Public  
router.get('/debug/all', asyncHandler(async (req, res) => {
  const allEvents = await Event.find({})
    .populate('organizer', 'fullName')
    .sort({ createdAt: -1 });

  console.log(`Found ${allEvents.length} total events in database`);
  
  const eventSummary = allEvents.map(event => ({
    _id: event._id,
    title: event.title,
    category: event.category,
    isActive: event.isActive,
    isPublished: event.isPublished,
    status: event.status,
    eventType: event.eventType,
    startDate: event.startDate,
    createdAt: event.createdAt
  }));

  res.json(new ApiResponse(200, { 
    totalCount: allEvents.length,
    events: eventSummary 
  }, `Found ${allEvents.length} total events`));
}));

// @route   POST /api/events/debug/create-test
// @desc    Create a test Mumbai Bikers Mania event for debugging
// @access  Public
router.post('/debug/create-test', asyncHandler(async (req, res) => {
  try {
    const testEvent = await Event.create({
      title: 'Test Mumbai Bikers Mania Event',
      subtitle: 'A test event for debugging',
      description: 'This is a test event created for debugging purposes',
      category: 'mumbai-bikers-mania',
      location: 'Mumbai Test Location',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      isActive: true,
      isPublished: true,
      status: 'published',
      eventType: 'upcoming',
      pricing: {
        isFree: false,
        basePrice: 1000,
        currency: 'INR'
      },
      capacity: {
        maxParticipants: 100,
        currentParticipants: 0
      },
      contentSections: [
        {
          sectionTitle: 'Test Section',
          subheading: 'TEST',
          heading: 'Test Section Heading',
          content: 'This is a test content section created for debugging purposes.',
          order: 1,
          layout: 'image-left'
        }
      ]
    });

    console.log('Created test event:', testEvent);
    res.json(new ApiResponse(201, { event: testEvent }, 'Test event created successfully'));
  } catch (error) {
    console.error('Error creating test event:', error);
    res.status(500).json(new ApiResponse(500, null, `Error creating test event: ${error.message}`));
  }
}));

// @route   POST /api/events/debug/fix-categories
// @desc    Fix categories and publish status for Mumbai Bikers Mania events
// @access  Public
router.post('/debug/fix-categories', asyncHandler(async (req, res) => {
  try {
    // Find events that should be Mumbai Bikers Mania events
    const eventsToFix = await Event.find({
      $or: [
        { title: { $regex: 'mumbai bikers mania', $options: 'i' } },
        { title: { $regex: 'mumbai bikers', $options: 'i' } },
        { title: { $regex: 'mbm', $options: 'i' } }
      ]
    });

    console.log(`Found ${eventsToFix.length} events to fix`);

    const updateResults = [];
    for (const event of eventsToFix) {
      const updated = await Event.findByIdAndUpdate(
        event._id,
        {
          category: 'mumbai-bikers-mania',
          isPublished: true,
          status: 'published',
          eventType: event.startDate && new Date(event.startDate) > new Date() ? 'upcoming' : 'past'
        },
        { new: true }
      );
      updateResults.push({
        _id: updated._id,
        title: updated.title,
        category: updated.category,
        isPublished: updated.isPublished,
        status: updated.status,
        eventType: updated.eventType
      });
    }

    res.json(new ApiResponse(200, { 
      fixed: updateResults.length, 
      events: updateResults 
    }, `Fixed ${updateResults.length} events`));
  } catch (error) {
    console.error('Error fixing categories:', error);
    res.status(500).json(new ApiResponse(500, null, `Error fixing categories: ${error.message}`));
  }
}));

// @route   GET /api/events/search
// @desc    Advanced search events
// @access  Public
router.get('/search', optionalAuth, validate(schemas.eventQuery, 'query'), asyncHandler(async (req, res) => {
  const { 
    page, 
    limit, 
    sortBy, 
    sortOrder, 
    category, 
    search, 
    city, 
    state,
    priceMin,
    priceMax,
    dateFrom,
    dateTo,
    tags,
    skillLevel,
    isFree
  } = req.query;
  
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build advanced filter
  const filter = { 
    isActive: true,
    isPublished: true
  };
  
  if (category) filter.category = category;
  if (city) filter['venue.city'] = new RegExp(city, 'i');
  if (state) filter['venue.state'] = new RegExp(state, 'i');
  if (skillLevel) filter['requirements.skillLevel'] = skillLevel;
  if (isFree === 'true') filter['pricing.isFree'] = true;
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    filter.tags = { $in: tagArray };
  }
  
  // Price range filter
  if (priceMin || priceMax) {
    filter['pricing.basePrice'] = {};
    if (priceMin) filter['pricing.basePrice'].$gte = parseFloat(priceMin);
    if (priceMax) filter['pricing.basePrice'].$lte = parseFloat(priceMax);
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    filter.startDate = {};
    if (dateFrom) filter.startDate.$gte = new Date(dateFrom);
    if (dateTo) filter.startDate.$lte = new Date(dateTo);
  }
  
  // Text search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
      { 'venue.name': { $regex: search, $options: 'i' } },
      { 'venue.city': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'startDate', sortOrder);

  // Execute queries
  const [events, totalCount] = await Promise.all([
    Event.find(filter)
      .populate('organizer', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Event.countDocuments(filter)
  ]);

  const result = getPaginationResult(events, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Events search completed successfully'));
}));

export default router;