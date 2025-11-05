import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import whatsappService from '../services/whatsappService.js';
import { generateRideTicket, generateEventTicket } from '../services/ticketService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/test/whatsapp/health
// @desc    Check WhatsApp API health
// @access  Private (Admin only in production)
router.get('/whatsapp/health', authenticate, asyncHandler(async (req, res) => {
  try {
    const isHealthy = await whatsappService.checkHealth();
    
    if (isHealthy) {
      res.json(new ApiResponse(200, { healthy: true }, 'WhatsApp API is connected'));
    } else {
      res.status(503).json(new ApiResponse(503, { healthy: false }, 'WhatsApp API is not responding'));
    }
  } catch (error) {
    throw new ApiError(500, `WhatsApp health check failed: ${error.message}`);
  }
}));

// @route   POST /api/test/whatsapp/send-text
// @desc    Send test WhatsApp text message
// @access  Private (Admin only in production)
router.post('/whatsapp/send-text', authenticate, asyncHandler(async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    throw new ApiError(400, 'Phone number and message are required');
  }

  try {
    const result = await whatsappService.sendTextMessage(phoneNumber, message);
    res.json(new ApiResponse(200, result, 'Test message sent successfully'));
  } catch (error) {
    throw new ApiError(500, `Failed to send test message: ${error.message}`);
  }
}));

// @route   POST /api/test/whatsapp/send-test-ticket
// @desc    Send test ticket via WhatsApp
// @access  Private (Admin only in production)
router.post('/whatsapp/send-test-ticket', authenticate, asyncHandler(async (req, res) => {
  const { phoneNumber, type = 'ride' } = req.body;

  if (!phoneNumber) {
    throw new ApiError(400, 'Phone number is required');
  }

  try {
    let ticketBuffer;
    
    if (type === 'event') {
      // Generate test event ticket
      ticketBuffer = await generateEventTicket({
        bookingNumber: 'TEST' + Date.now(),
        userName: 'Test User',
        eventName: 'Test Event - Rock Concert',
        location: 'Mumbai, Maharashtra',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        amount: 1500,
        bookingType: 'individual',
        groupSize: 1,
        motorcycleInfo: {
          modelName: 'Royal Enfield Classic 350',
          motorcycleNumber: 'MH01AB1234'
        },
        qrData: JSON.stringify({
          test: true,
          bookingNumber: 'TEST' + Date.now(),
          type: 'event'
        })
      });
    } else {
      // Generate test ride ticket
      ticketBuffer = await generateRideTicket({
        bookingNumber: 'TEST' + Date.now(),
        userName: 'Test User',
        rideName: 'Test Ride - Mumbai to Lonavala',
        venue: 'Gateway of India, Mumbai',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        amount: 999,
        bookingType: 'individual',
        groupSize: 1,
        motorcycleInfo: {
          modelName: 'Royal Enfield Classic 350',
          motorcycleNumber: 'MH01AB1234'
        },
        qrData: JSON.stringify({
          test: true,
          bookingNumber: 'TEST' + Date.now(),
          type: 'ride'
        })
      });
    }

    const result = await whatsappService.sendTicket(
      phoneNumber,
      ticketBuffer,
      {
        userName: 'Test User',
        bookingNumber: 'TEST' + Date.now(),
        rideName: type === 'ride' ? 'Test Ride - Mumbai to Lonavala' : undefined,
        eventName: type === 'event' ? 'Test Event - Rock Concert' : undefined,
        amount: type === 'ride' ? 999 : 1500
      }
    );

    res.json(new ApiResponse(200, result, `Test ${type} ticket sent successfully to ${phoneNumber}`));
  } catch (error) {
    throw new ApiError(500, `Failed to send test ticket: ${error.message}`);
  }
}));

// @route   POST /api/test/generate-ticket-preview
// @desc    Generate ticket preview (returns base64 image)
// @access  Private
router.post('/generate-ticket-preview', authenticate, asyncHandler(async (req, res) => {
  const { type = 'ride' } = req.body;

  try {
    let ticketBuffer;
    
    if (type === 'event') {
      ticketBuffer = await generateEventTicket({
        bookingNumber: 'PREVIEW' + Date.now(),
        userName: req.user.fullName || 'Sample User',
        eventName: 'Sample Event - Mumbai Riders Meet',
        location: 'Marine Drive, Mumbai',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        amount: 1299,
        bookingType: 'individual',
        groupSize: 1,
        motorcycleInfo: {
          modelName: 'Royal Enfield Himalayan',
          motorcycleNumber: 'MH02CD5678'
        },
        qrData: JSON.stringify({ preview: true })
      });
    } else {
      ticketBuffer = await generateRideTicket({
        bookingNumber: 'PREVIEW' + Date.now(),
        userName: req.user.fullName || 'Sample User',
        rideName: 'Sample Ride - Coastal Highway Tour',
        venue: 'Bandra Bandstand, Mumbai',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        amount: 899,
        bookingType: 'individual',
        groupSize: 1,
        motorcycleInfo: {
          modelName: 'Royal Enfield Himalayan',
          motorcycleNumber: 'MH02CD5678'
        },
        qrData: JSON.stringify({ preview: true })
      });
    }

    // Convert buffer to base64
    const base64Image = ticketBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    res.json(new ApiResponse(200, { 
      imageData: dataUrl,
      type: type
    }, 'Ticket preview generated successfully'));
  } catch (error) {
    throw new ApiError(500, `Failed to generate ticket preview: ${error.message}`);
  }
}));

export default router;
