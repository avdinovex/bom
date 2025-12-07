import express from 'express';
import RegistrationEntityConfig from '../../models/RegistrationEntityConfig.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = express.Router();

// @route   GET /api/admin/registration-entities
// @desc    Get all registration entity configurations (admin)
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const entities = await RegistrationEntityConfig.find()
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email')
    .sort({ 'config.displayOrder': 1 });

  res.json(new ApiResponse(200, entities, 'Registration entities retrieved successfully'));
}));

// @route   GET /api/admin/registration-entities/:id
// @desc    Get single registration entity configuration (admin)
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const entity = await RegistrationEntityConfig.findById(req.params.id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  res.json(new ApiResponse(200, entity, 'Registration entity retrieved successfully'));
}));

// @route   POST /api/admin/registration-entities
// @desc    Create new registration entity configuration (admin)
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
  const {
    entityType,
    displayName,
    icon,
    description,
    features,
    termsAndConditions,
    config
  } = req.body;

  // Check if entity type already exists
  const existingEntity = await RegistrationEntityConfig.findOne({ entityType });
  if (existingEntity) {
    throw new ApiError(400, `Configuration for ${entityType} already exists. Use update instead.`);
  }

  const entity = await RegistrationEntityConfig.create({
    entityType,
    displayName,
    icon,
    description,
    features: features || [],
    termsAndConditions: termsAndConditions || [],
    config: config || {},
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  res.status(201).json(new ApiResponse(201, entity, 'Registration entity created successfully'));
}));

// @route   PUT /api/admin/registration-entities/:id
// @desc    Update registration entity configuration (admin)
// @access  Private/Admin
router.put('/:id', asyncHandler(async (req, res) => {
  const {
    displayName,
    icon,
    description,
    features,
    termsAndConditions,
    config
  } = req.body;

  const entity = await RegistrationEntityConfig.findById(req.params.id);

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  // Update fields
  if (displayName !== undefined) entity.displayName = displayName;
  if (icon !== undefined) entity.icon = icon;
  if (description !== undefined) entity.description = description;
  if (features !== undefined) entity.features = features;
  if (termsAndConditions !== undefined) entity.termsAndConditions = termsAndConditions;
  if (config !== undefined) entity.config = { ...entity.config, ...config };
  
  entity.updatedBy = req.user._id;

  await entity.save();

  res.json(new ApiResponse(200, entity, 'Registration entity updated successfully'));
}));

// @route   DELETE /api/admin/registration-entities/:id
// @desc    Delete registration entity configuration (admin)
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const entity = await RegistrationEntityConfig.findById(req.params.id);

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  await entity.deleteOne();

  res.json(new ApiResponse(200, null, 'Registration entity deleted successfully'));
}));

// @route   PATCH /api/admin/registration-entities/:id/toggle-status
// @desc    Toggle active status of entity (admin)
// @access  Private/Admin
router.patch('/:id/toggle-status', asyncHandler(async (req, res) => {
  const entity = await RegistrationEntityConfig.findById(req.params.id);

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  entity.config.isActive = !entity.config.isActive;
  entity.updatedBy = req.user._id;
  
  await entity.save();

  res.json(new ApiResponse(200, entity, `Entity ${entity.config.isActive ? 'activated' : 'deactivated'} successfully`));
}));

// @route   POST /api/admin/registration-entities/:id/event-override
// @desc    Add event-specific override (admin)
// @access  Private/Admin
router.post('/:id/event-override', asyncHandler(async (req, res) => {
  const {
    eventId,
    features,
    termsAndConditions,
    description,
    isActive
  } = req.body;

  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
  }

  const entity = await RegistrationEntityConfig.findById(req.params.id);

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  // Check if override already exists for this event
  const existingOverrideIndex = entity.eventOverrides.findIndex(
    o => o.eventId.toString() === eventId.toString()
  );

  const override = {
    eventId,
    features,
    termsAndConditions,
    description,
    isActive
  };

  if (existingOverrideIndex !== -1) {
    // Update existing override
    entity.eventOverrides[existingOverrideIndex] = override;
  } else {
    // Add new override
    entity.eventOverrides.push(override);
  }

  entity.updatedBy = req.user._id;
  await entity.save();

  res.json(new ApiResponse(200, entity, 'Event override saved successfully'));
}));

// @route   DELETE /api/admin/registration-entities/:id/event-override/:eventId
// @desc    Remove event-specific override (admin)
// @access  Private/Admin
router.delete('/:id/event-override/:eventId', asyncHandler(async (req, res) => {
  const entity = await RegistrationEntityConfig.findById(req.params.id);

  if (!entity) {
    throw new ApiError(404, 'Registration entity not found');
  }

  entity.eventOverrides = entity.eventOverrides.filter(
    o => o.eventId.toString() !== req.params.eventId.toString()
  );

  entity.updatedBy = req.user._id;
  await entity.save();

  res.json(new ApiResponse(200, entity, 'Event override removed successfully'));
}));

// @route   POST /api/admin/registration-entities/seed
// @desc    Seed default configurations (admin - one time use)
// @access  Private/Admin
router.post('/seed', asyncHandler(async (req, res) => {
  // Check if already seeded
  const existing = await RegistrationEntityConfig.countDocuments();
  if (existing > 0) {
    throw new ApiError(400, 'Entities already exist. Use update endpoints instead.');
  }

  const defaultConfigs = [
    {
      entityType: 'audience',
      displayName: 'Audience - One Day Pass',
      icon: 'Eye',
      description: 'Join us as a spectator and witness the thrill of the event. Perfect for enthusiasts who want to experience the excitement without riding.',
      features: [
        { title: 'Event access pass', order: 1 },
        { title: 'Complimentary refreshments', order: 2 },
        { title: 'Photo opportunities', order: 3 },
        { title: 'Meet fellow enthusiasts', order: 4 }
      ],
      termsAndConditions: [
        { content: 'I confirm that all information provided is accurate and complete.', order: 1 },
        { content: 'I agree to follow all event rules, regulations, and safety guidelines.', order: 2 },
        { content: 'I understand that participation is at my own risk and I release the organizers from any liability.', order: 3 },
        { content: 'I will not carry any prohibited items, contraband, or illegal substances.', order: 4 },
        { content: 'I will respect other participants and maintain proper event etiquette.', order: 5 },
        { content: 'I will not consume alcohol or drugs before or during the event.', order: 6 },
        { content: 'I understand that non-compliance may result in removal from the event without refund.', order: 7 },
        { content: 'I authorize the organizers to use photographs/videos taken during the event for promotional purposes.', order: 8 }
      ],
      config: {
        displayOrder: 1,
        isActive: true,
        themeColor: '#ff4757'
      },
      createdBy: req.user._id,
      updatedBy: req.user._id
    },
    {
      entityType: 'participant',
      displayName: 'Participant',
      icon: 'Bike',
      description: 'Ride with us! Join the event as an active participant and be part of the motorcycle community on the road.',
      features: [
        { title: 'Full ride participation', order: 1 },
        { title: 'Event T-shirt', order: 2 },
        { title: 'Meals & refreshments', order: 3 },
        { title: 'Rider support & safety', order: 4 },
        { title: 'Certificate & goodies', order: 5 }
      ],
      termsAndConditions: [
        { content: 'I confirm that all information provided is accurate and complete.', order: 1 },
        { content: 'I agree to follow all event rules, regulations, and safety guidelines.', order: 2 },
        { content: 'I understand that participation is at my own risk and I release the organizers from any liability.', order: 3 },
        { content: 'I will wear appropriate safety gear including helmet and protective clothing during the ride.', order: 4 },
        { content: 'I will not carry any prohibited items, contraband, or illegal substances.', order: 5 },
        { content: 'I will follow all traffic rules and speed limits during the event.', order: 6 },
        { content: 'I will respect other participants and maintain proper riding etiquette.', order: 7 },
        { content: 'I will not consume alcohol or drugs before or during the event.', order: 8 },
        { content: 'I understand that non-compliance may result in removal from the event without refund.', order: 9 },
        { content: 'I authorize the organizers to use photographs/videos taken during the event for promotional purposes.', order: 10 }
      ],
      config: {
        displayOrder: 2,
        isActive: true,
        themeColor: '#ff4757'
      },
      createdBy: req.user._id,
      updatedBy: req.user._id
    }
  ];

  const entities = await RegistrationEntityConfig.insertMany(defaultConfigs);

  res.status(201).json(new ApiResponse(201, entities, 'Default configurations seeded successfully'));
}));

export default router;
