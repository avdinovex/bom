import express from 'express';
import AudienceRegistration from '../models/AudienceRegistration.js';
import Event from '../models/Event.js';
import Coupon from '../models/Coupon.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { createOrder, verifyPayment } from '../services/razorpayService.js';
import emailService from '../services/emailService.js';
import whatsappService from '../services/whatsappService.js';
import logger from '../config/logger.js';

const router = express.Router();

// @route   POST /api/audience-registrations/validate-coupon
// @desc    Validate a coupon code for audience registration
// @access  Public
router.post('/validate-coupon', asyncHandler(async (req, res) => {
  const { couponCode, eventId } = req.body;

  if (!couponCode) {
    throw new ApiError(400, 'Coupon code is required');
  }

  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
  }

  // Find the coupon
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  // Find the event to get the price
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    throw new ApiError(400, 'This coupon is not active');
  }

  // Check if coupon is valid for audience type
  if (coupon.applicableFor && !coupon.applicableFor.includes('audience')) {
    throw new ApiError(400, 'This coupon is not valid for audience registrations');
  }

  // Check validity dates
  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    throw new ApiError(400, 'This coupon is not yet valid');
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    throw new ApiError(400, 'This coupon has expired');
  }

  // Check usage limit
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, 'This coupon has reached its usage limit');
  }

  // Calculate discount
  const basePrice = event.audienceTicketPrice || event.ticketPrice || 0;
  let discount = 0;
  let finalPrice = basePrice;

  if (coupon.discountType === 'percentage') {
    discount = (basePrice * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  finalPrice = Math.max(0, basePrice - discount);

  res.json(new ApiResponse(200, {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount
    },
    pricing: {
      basePrice,
      discount,
      finalPrice
    }
  }, 'Coupon validated successfully'));
}));

// @route   POST /api/audience-registrations/create-order
// @desc    Create payment order for audience registration
// @access  Public
router.post('/create-order', asyncHandler(async (req, res) => {
  const { eventId, personalInfo, couponCode } = req.body;

  // Validate required fields
  if (!eventId) {
    throw new ApiError(400, 'Event ID is required');
  }

  if (!personalInfo || !personalInfo.name || !personalInfo.email || !personalInfo.phoneNumber || !personalInfo.address) {
    throw new ApiError(400, 'Complete personal information is required');
  }

  // Find the event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if event is active and open for registration
  if (event.status !== 'published') {
    throw new ApiError(400, 'This event is not available for registration');
  }

  // Check if event date has passed
  if (event.eventDate && new Date(event.eventDate) < new Date()) {
    throw new ApiError(400, 'This event has already passed');
  }

  // Check available seats
  if (event.audienceCapacity && event.audienceBookedCount >= event.audienceCapacity) {
    throw new ApiError(400, 'No seats available for this event');
  }

  // Calculate pricing
  let basePrice = event.audienceTicketPrice || event.ticketPrice || event.price || event.pricing?.basePrice || 0;
  let discount = 0;
  let finalPrice = basePrice;
  let couponData = null;

  logger.info('Audience registration pricing:', {
    eventId: event._id,
    audienceTicketPrice: event.audienceTicketPrice,
    ticketPrice: event.ticketPrice,
    price: event.price,
    pricingBasePrice: event.pricing?.basePrice,
    calculatedBasePrice: basePrice
  });

  // Apply coupon if provided
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    
    if (coupon) {
      // Validate coupon
      const now = new Date();
      if ((!coupon.validFrom || now >= new Date(coupon.validFrom)) &&
          (!coupon.validUntil || now <= new Date(coupon.validUntil)) &&
          (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
          (!coupon.applicableFor || coupon.applicableFor.includes('audience'))) {
        
        // Calculate discount
        if (coupon.discountType === 'percentage') {
          discount = (basePrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
        } else {
          discount = coupon.discountValue;
        }

        finalPrice = Math.max(0, basePrice - discount);

        couponData = {
          code: coupon.code,
          discount: discount,
          discountType: coupon.discountType
        };
      }
    }
  }

  // Create audience registration record
  const registration = new AudienceRegistration({
    user: req.user?._id,
    event: eventId,
    personalInfo,
    paymentInfo: {
      amount: basePrice,
      currency: 'INR',
      paymentStatus: finalPrice === 0 ? 'completed' : 'pending'
    },
    coupon: couponData,
    status: finalPrice === 0 ? 'confirmed' : 'pending'
  });

  await registration.save();

  // If free registration, confirm immediately
  if (finalPrice === 0) {
    registration.paymentInfo.paidAt = new Date();
    await registration.save();

    // Update event booked count
    event.audienceBookedCount = (event.audienceBookedCount || 0) + 1;
    await event.save();

    // Update coupon usage if applicable
    if (couponData) {
      await Coupon.findOneAndUpdate(
        { code: couponData.code },
        { $inc: { usedCount: 1 } }
      );
    }

  // Send confirmation emails/messages (non-blocking)
  setImmediate(async () => {
    try {
      await emailService.sendAudienceConfirmation(registration, event);
      registration.emailSent = true;
      await registration.save();
      logger.info('Free registration confirmation email sent successfully');
    } catch (error) {
      logger.error('Error sending audience confirmation email:', error);
    }

    // Only send WhatsApp if configured
    if (whatsappService.isConfigured && whatsappService.isConfigured()) {
      try {
        await whatsappService.sendAudienceConfirmation(registration, event);
        registration.whatsappSent = true;
        await registration.save();
        logger.info('Free registration confirmation WhatsApp sent successfully');
      } catch (error) {
        logger.warn('WhatsApp not sent (service not configured or failed):', error.message);
      }
    } else {
      logger.info('WhatsApp service not configured, skipping WhatsApp notification');
    }
  });

    return res.json(new ApiResponse(201, {
      registration: {
        _id: registration._id,
        ticketNumber: registration.ticketNumber,
        status: registration.status
      },
      payment: {
        required: false,
        amount: 0
      }
    }, 'Registration completed successfully'));
  }

  // Create Razorpay order for paid registration
  const order = await createOrder({
    amount: finalPrice,
    currency: 'INR',
    receipt: `audience_${registration._id}`,
    notes: {
      registrationId: registration._id.toString(),
      eventId: eventId,
      type: 'audience_registration'
    }
  });

  // Update registration with order ID
  registration.paymentInfo.razorpayOrderId = order.id;
  await registration.save();

  res.json(new ApiResponse(201, {
    registration: {
      _id: registration._id,
      status: registration.status
    },
    payment: {
      required: true,
      orderId: order.id,
      amount: finalPrice,
      currency: order.currency,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    },
    pricing: {
      basePrice,
      discount,
      finalPrice
    }
  }, 'Payment order created successfully'));
}));

// @route   POST /api/audience-registrations/verify-payment
// @desc    Verify payment and confirm registration
// @access  Public
router.post('/verify-payment', asyncHandler(async (req, res) => {
  const { registrationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!registrationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'All payment details are required');
  }

  // Find the registration
  const registration = await AudienceRegistration.findById(registrationId).populate('event');
  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  // Verify order ID matches
  if (registration.paymentInfo.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, 'Order ID mismatch');
  }

  // Verify payment signature
  const isValid = verifyPayment({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id,
    signature: razorpay_signature
  });

  if (!isValid) {
    registration.paymentInfo.paymentStatus = 'failed';
    await registration.save();
    throw new ApiError(400, 'Payment verification failed');
  }

  // Update registration with payment details
  registration.paymentInfo.razorpayPaymentId = razorpay_payment_id;
  registration.paymentInfo.razorpaySignature = razorpay_signature;
  registration.paymentInfo.paymentStatus = 'completed';
  registration.paymentInfo.paidAt = new Date();
  registration.status = 'confirmed';
  await registration.save();

  // Update event booked count
  const event = registration.event;
  event.audienceBookedCount = (event.audienceBookedCount || 0) + 1;
  await event.save();

  // Update coupon usage if applicable
  if (registration.coupon && registration.coupon.code) {
    await Coupon.findOneAndUpdate(
      { code: registration.coupon.code },
      { $inc: { usedCount: 1 } }
    );
  }

  // Send confirmation emails/messages (non-blocking)
  setImmediate(async () => {
    try {
      await emailService.sendAudienceConfirmation(registration, event);
      registration.emailSent = true;
      await registration.save();
      logger.info('Audience confirmation email sent successfully');
    } catch (error) {
      logger.error('Error sending audience confirmation email:', error);
    }

    // Only send WhatsApp if configured
    if (whatsappService.isConfigured && whatsappService.isConfigured()) {
      try {
        await whatsappService.sendAudienceConfirmation(registration, event);
        registration.whatsappSent = true;
        await registration.save();
        logger.info('Audience confirmation WhatsApp sent successfully');
      } catch (error) {
        logger.warn('WhatsApp not sent (service not configured or failed):', error.message);
      }
    } else {
      logger.info('WhatsApp service not configured, skipping WhatsApp notification');
    }
  });

  res.json(new ApiResponse(200, {
    registration: {
      _id: registration._id,
      ticketNumber: registration.ticketNumber,
      status: registration.status,
      personalInfo: registration.personalInfo,
      event: {
        title: event.title,
        eventDate: event.eventDate
      }
    }
  }, 'Payment verified and registration confirmed'));
}));

// @route   GET /api/audience-registrations/my-registrations
// @desc    Get user's audience registrations
// @access  Private
router.get('/my-registrations', authenticate, asyncHandler(async (req, res) => {
  const registrations = await AudienceRegistration.find({
    $or: [
      { user: req.user._id },
      { 'personalInfo.email': req.user.email }
    ]
  })
  .populate('event', 'title eventDate location venue imgUrl')
  .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, { registrations }, 'Registrations fetched successfully'));
}));

// @route   GET /api/audience-registrations/:id
// @desc    Get single audience registration
// @access  Public (with registration ID)
router.get('/:id', asyncHandler(async (req, res) => {
  const registration = await AudienceRegistration.findById(req.params.id)
    .populate('event', 'title eventDate location venue imgUrl');

  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  res.json(new ApiResponse(200, { registration }, 'Registration fetched successfully'));
}));

export default router;
