import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../config/logger.js';

// Lazy initialize Razorpay instance to ensure env variables are loaded
let razorpay = null;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.warn('Razorpay credentials not found. Using test credentials for development.');
      // Use test credentials for development
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_key_1234567890'
      });
    } else {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  }
  return razorpay;
};

export const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  try {
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise for INR)
      currency,
      receipt,
      notes,
      payment_capture: 1 // Auto capture payment
    };

    const order = await getRazorpayInstance().orders.create(orderOptions);
    logger.info('Razorpay order created:', { orderId: order.id, amount: order.amount });
    
    return order;
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = ({ order_id, payment_id, signature }) => {
  try {
    const sign = order_id + '|' + payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    const isValid = expectedSign === signature;
    
    if (isValid) {
      logger.info('Payment verified successfully:', { payment_id, order_id });
    } else {
      logger.warn('Payment verification failed:', { payment_id, order_id });
    }
    
    return isValid;
  } catch (error) {
    logger.error('Error verifying payment:', error);
    return false;
  }
};

export const getPayment = async (paymentId) => {
  try {
    const payment = await getRazorpayInstance().payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error('Error fetching payment:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId, { amount, notes = {} }) => {
  try {
    const refundOptions = {
      amount: amount * 100, // Amount in smallest currency unit
      notes
    };

    const refund = await getRazorpayInstance().payments.refund(paymentId, refundOptions);
    logger.info('Refund processed:', { refundId: refund.id, amount: refund.amount });
    
    return refund;
  } catch (error) {
    logger.error('Error processing refund:', error);
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const order = await getRazorpayInstance().orders.fetch(orderId);
    return order;
  } catch (error) {
    logger.error('Error fetching order:', error);
    throw error;
  }
};

export const getAllOrders = async (options = {}) => {
  try {
    const orders = await getRazorpayInstance().orders.all(options);
    return orders;
  } catch (error) {
    logger.error('Error fetching orders:', error);
    throw error;
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (rawBody, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
};