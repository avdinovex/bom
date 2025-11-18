import express from 'express';
import Event from '../../models/Event.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = express.Router();

// @route   POST /api/admin/sync-capacity
// @desc    One-time migration to sync capacity fields
// @access  Admin
router.post('/', asyncHandler(async (req, res) => {
  // Find all events that don't have capacity object or have mismatched values
  const events = await Event.find({});
  
  let syncedCount = 0;
  
  for (const event of events) {
    const needsSync = 
      !event.capacity || 
      event.capacity.currentParticipants !== event.currentParticipants ||
      event.capacity.maxParticipants !== event.maxParticipants;
    
    if (needsSync) {
      event.capacity = event.capacity || {};
      event.capacity.currentParticipants = event.currentParticipants || 0;
      event.capacity.maxParticipants = event.maxParticipants || 100;
      event.capacity.waitlistEnabled = event.capacity.waitlistEnabled ?? true;
      event.capacity.maxWaitlist = event.capacity.maxWaitlist || 50;
      
      await event.save();
      syncedCount++;
    }
  }
  
  res.json(new ApiResponse(200, { 
    totalEvents: events.length,
    syncedEvents: syncedCount 
  }, `Capacity sync completed. ${syncedCount} events updated.`));
}));

export default router;
