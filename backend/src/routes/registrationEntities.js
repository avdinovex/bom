import express from 'express';
import RegistrationEntityConfig from '../models/RegistrationEntityConfig.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// @route   GET /api/registration-entities
// @desc    Get all active registration entity configurations (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { eventId } = req.query;

  const entities = await RegistrationEntityConfig.find({ 
    'config.isActive': true 
  }).sort({ 'config.displayOrder': 1 });

  if (!entities || entities.length === 0) {
    throw new ApiError(404, 'No registration entities found');
  }

  // If eventId is provided, get event-specific configurations
  const configs = eventId 
    ? entities.map(entity => entity.getConfigForEvent(eventId))
    : entities.map(entity => entity.getConfigForEvent(null));

  res.json(new ApiResponse(200, configs, 'Registration entities retrieved successfully'));
}));

// @route   GET /api/registration-entities/:entityType
// @desc    Get specific entity configuration (public)
// @access  Public
router.get('/:entityType', asyncHandler(async (req, res) => {
  const { entityType } = req.params;
  const { eventId } = req.query;

  if (!['audience', 'participant'].includes(entityType)) {
    throw new ApiError(400, 'Invalid entity type. Must be "audience" or "participant"');
  }

  const entity = await RegistrationEntityConfig.findOne({ 
    entityType,
    'config.isActive': true 
  });

  if (!entity) {
    throw new ApiError(404, `${entityType} configuration not found`);
  }

  const config = entity.getConfigForEvent(eventId);

  res.json(new ApiResponse(200, config, `${entityType} configuration retrieved successfully`));
}));

export default router;
