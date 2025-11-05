import axios from 'axios';
import FormData from 'form-data';
import logger from '../config/logger.js';

/**
 * WhatsApp Business API Service
 * Uses Facebook WhatsApp Business API to send messages and media
 */

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  /**
   * Validate WhatsApp configuration
   */
  validateConfig() {
    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error('WhatsApp API configuration is missing. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in environment variables.');
    }
  }

  /**
   * Format phone number to WhatsApp format (remove + and spaces)
   * @param {string} phoneNumber - Phone number with country code
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume India (+91)
    if (!formatted.startsWith('91') && formatted.length === 10) {
      formatted = '91' + formatted;
    }
    
    return formatted;
  }

  /**
   * Upload media to WhatsApp Business API
   * @param {Buffer} mediaBuffer - Media file buffer
   * @param {string} mimeType - MIME type of the media
   * @param {string} filename - Filename
   * @returns {Promise<string>} - Media ID
   */
  async uploadMedia(mediaBuffer, mimeType = 'image/png', filename = 'ticket.png') {
    try {
      this.validateConfig();

      const formData = new FormData();
      formData.append('file', mediaBuffer, {
        filename: filename,
        contentType: mimeType
      });
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      logger.info('Media uploaded to WhatsApp:', response.data);
      return response.data.id;
    } catch (error) {
      logger.error('Error uploading media to WhatsApp:', error.response?.data || error.message);
      throw new Error(`Failed to upload media to WhatsApp: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send text message via WhatsApp
   * @param {string} to - Recipient phone number
   * @param {string} message - Message text
   * @returns {Promise<Object>} - API response
   */
  async sendTextMessage(to, message) {
    try {
      this.validateConfig();

      const formattedNumber = this.formatPhoneNumber(to);

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp text message sent to ${formattedNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp text message:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send image with caption via WhatsApp
   * @param {string} to - Recipient phone number
   * @param {string} mediaId - Uploaded media ID
   * @param {string} caption - Image caption
   * @returns {Promise<Object>} - API response
   */
  async sendImage(to, mediaId, caption = '') {
    try {
      this.validateConfig();

      const formattedNumber = this.formatPhoneNumber(to);

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'image',
          image: {
            id: mediaId,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp image sent to ${formattedNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp image:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp image: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send document with caption via WhatsApp
   * @param {string} to - Recipient phone number
   * @param {string} mediaId - Uploaded media ID
   * @param {string} filename - Document filename
   * @param {string} caption - Document caption
   * @returns {Promise<Object>} - API response
   */
  async sendDocument(to, mediaId, filename, caption = '') {
    try {
      this.validateConfig();

      const formattedNumber = this.formatPhoneNumber(to);

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'document',
          document: {
            id: mediaId,
            filename: filename,
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp document sent to ${formattedNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp document:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp document: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Send ticket via WhatsApp
   * @param {string} phoneNumber - Recipient phone number
   * @param {Buffer} ticketBuffer - Ticket image buffer
   * @param {Object} ticketInfo - Ticket information for caption
   * @returns {Promise<Object>} - API response
   */
  async sendTicket(phoneNumber, ticketBuffer, ticketInfo) {
    try {
      const { userName, bookingNumber, eventName, rideName, amount } = ticketInfo;

      // Upload ticket image
      const mediaId = await this.uploadMedia(ticketBuffer, 'image/png', `ticket_${bookingNumber}.png`);

      // Create caption
      const caption = `🎟️ *Booking Confirmed!*\n\n` +
        `Hello ${userName}! 👋\n\n` +
        `Your ticket for *${eventName || rideName}* is ready!\n\n` +
        `📋 Booking: #${bookingNumber}\n` +
        `💰 Amount Paid: ₹${amount}\n\n` +
        `✅ Please show this ticket during check-in.\n` +
        `📱 Save this image for easy access.\n\n` +
        `See you there! 🏍️🔥`;

      // Send image with caption
      const result = await this.sendImage(phoneNumber, mediaId, caption);

      logger.info(`Ticket sent successfully to ${phoneNumber} for booking ${bookingNumber}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send ticket to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Send template message (if you have approved templates)
   * @param {string} to - Recipient phone number
   * @param {string} templateName - Template name
   * @param {string} languageCode - Language code (e.g., 'en', 'en_US')
   * @param {Array} components - Template components
   * @returns {Promise<Object>} - API response
   */
  async sendTemplate(to, templateName, languageCode = 'en', components = []) {
    try {
      this.validateConfig();

      const formattedNumber = this.formatPhoneNumber(to);

      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp template message sent to ${formattedNumber}`);
      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp template:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp template: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Check WhatsApp API health
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      this.validateConfig();
      
      const response = await axios.get(
        `${this.apiUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      logger.error('WhatsApp API health check failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new WhatsAppService();
