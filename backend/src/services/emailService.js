import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    // Don't initialize immediately - do it lazily when first used
  }

  // Helper function to convert UTC date to IST and format it
  formatDateToIST(date, options = {}) {
    if (!date) return 'N/A';
    
    const defaultOptions = {
      timeZone: 'Asia/Kolkata', // IST timezone
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Date(date).toLocaleString('en-IN', formatOptions);
  }

  init() {
    // Skip if already initialized
    if (this.initialized) {
      return;
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration error: EMAIL_USER and EMAIL_PASSWORD must be set');
      return;
    }

    // Determine SMTP configuration
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
    const emailSecure = process.env.EMAIL_SECURE === 'true'; // true for port 465, false for port 587
    
    // Create transporter with flexible SMTP configuration
    const transportConfig = {
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000
    };

    // Add service property only for Gmail
    if (emailHost === 'smtp.gmail.com') {
      transportConfig.service = 'gmail';
    }

    console.log('📧 Initializing email service...', {
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      user: process.env.EMAIL_USER
    });

    this.transporter = nodemailer.createTransport(transportConfig);

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response
        });
      } else {
        console.log('✅ Email service initialized successfully');
        this.initialized = true;
      }
    });
  }

  // Ensure initialization before any email operation
  ensureInitialized() {
    if (!this.initialized) {
      this.init();
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email for registration
  async sendRegistrationOTP(email, otp, fullName) {
    this.ensureInitialized();
    try {
      const mailOptions = {
        from: {
          name: 'Brotherhood Of Mumbai',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Verify Your Registration - OTP Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
              .header { background-color: #ff4757; color: white; text-align: center; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; }
              .otp-box { background-color: #f8f9fa; border: 2px solid #ff4757; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 36px; font-weight: bold; color: #ff4757; letter-spacing: 5px; margin: 10px 0; }
              .footer { background-color: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
              .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Brotherhood Of Mumbai!</h1>
              </div>
              <div class="content">
                <h2>Hello ${fullName}!</h2>
                <p>Thank you for registering with Brotherhood Of Mumbai. To complete your registration, please verify your email address using the OTP below:</p>
                
                <div class="otp-box">
                  <p><strong>Your OTP Code:</strong></p>
                  <div class="otp-code">${otp}</div>
                  <p class="warning">This OTP will expire in 10 minutes</p>
                </div>
                
                <p>If you didn't request this registration, please ignore this email.</p>
                <p>Welcome to our riding community!</p>
                
                <p>Best regards,<br>
                Brotherhood Of Mumbai Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending registration OTP:', error);
      throw new ApiError(500, 'Failed to send verification email');
    }
  }

  // Send OTP email for forgot password
  async sendForgotPasswordOTP(email, otp) {
    this.ensureInitialized();
    try {
      const mailOptions = {
        from: {
          name: 'Brotherhood Of Mumbai',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Reset Your Password - OTP Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
              .header { background-color: #ff4757; color: white; text-align: center; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; }
              .otp-box { background-color: #f8f9fa; border: 2px solid #ff4757; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 36px; font-weight: bold; color: #ff4757; letter-spacing: 5px; margin: 10px 0; }
              .footer { background-color: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
              .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
              .security-note { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your Brotherhood Of Mumbai account. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                  <p><strong>Your OTP Code:</strong></p>
                  <div class="otp-code">${otp}</div>
                  <p class="warning">This OTP will expire in 10 minutes</p>
                </div>
                
                <div class="security-note">
                  <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email and consider changing your password for security.
                </div>
                
                <p>Best regards,<br>
                Brotherhood Of Mumbai Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending forgot password OTP:', error);
      throw new ApiError(500, 'Failed to send password reset email');
    }
  }

  // Send welcome email after successful registration
  async sendWelcomeEmail(email, fullName) {
    this.ensureInitialized();
    try {
      const mailOptions = {
        from: {
          name: 'Brotherhood Of Mumbai',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Welcome to Brotherhood Of Mumbai!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
              .header { background-color: #ff4757; color: white; text-align: center; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { padding: 30px 20px; }
              .welcome-section { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background-color: #333; color: white; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
              .feature-list { list-style: none; padding: 0; }
              .feature-list li { margin: 10px 0; padding: 10px; background-color: #fff; border-left: 4px solid #ff4757; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏍️ Welcome to the Family! 🏍️</h1>
              </div>
              <div class="content">
                <h2>Hello ${fullName}!</h2>
                <p>Congratulations! Your registration has been successfully completed and verified.</p>
                
                <div class="welcome-section">
                  <h3>What's Next?</h3>
                  <ul class="feature-list">
                    <li>🚀 <strong>Explore Rides:</strong> Browse and book exciting motorcycle rides</li>
                    <li>📅 <strong>Join Events:</strong> Participate in workshops, meetups, and competitions</li>
                    <li>👥 <strong>Connect:</strong> Meet fellow bikers and build your riding network</li>
                    <li>📖 <strong>Learn:</strong> Read our blog for tips, gear reviews, and safety guides</li>
                  </ul>
                </div>
                
                <p>Ready to start your journey? <a href="${process.env.FRONTEND_URL}/login" style="color: #ff4757; text-decoration: none; font-weight: bold;">Login to your account</a> and explore our upcoming rides!</p>
                
                <p>Ride safe, ride together!</p>
                
                <p>Best regards,<br>
                Brotherhood Of Mumbai Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
    }
  }

  // Send ride booking confirmation email
  async sendRideBookingConfirmation(email, bookingData) {
    this.ensureInitialized();
    try {
      const { 
        fullName, 
        bookingNumber, 
        rideTitle, 
        venue, 
        startTime,
        endTime, 
        amount, 
        originalAmount,
        discountAmount,
        bookingType, 
        groupSize,
        personalInfo,
        motorcycleInfo,
        couponCode,
        paymentId,
        paidAt
      } = bookingData;

      const formattedDate = this.formatDateToIST(startTime);
      const formattedEndDate = endTime ? this.formatDateToIST(endTime) : null;
      const formattedPaidAt = this.formatDateToIST(paidAt);

      const mailOptions = {
        from: {
          name: 'Brotherhood Of Mumbai',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: `Ride Booking Confirmed - ${rideTitle} (${bookingNumber})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 650px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%); color: white; text-align: center; padding: 30px 20px; }
              .header h1 { margin: 0; font-size: 28px; }
              .success-badge { background-color: #2ecc71; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
              .content { padding: 30px; }
              .booking-details { background-color: #f8f9fa; border-left: 4px solid #ff4757; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: 600; color: #555; }
              .detail-value { color: #333; text-align: right; }
              .price-section { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .total-amount { font-size: 24px; font-weight: bold; color: #ff4757; text-align: center; }
              .info-box { background-color: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .warning-box { background-color: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { background-color: #333; color: white; text-align: center; padding: 20px; font-size: 12px; }
              .button { display: inline-block; background-color: #ff4757; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; }
              .discount-text { color: #2ecc71; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏍️ Booking Confirmed!</h1>
                <div class="success-badge">✓ PAYMENT SUCCESSFUL</div>
              </div>
              
              <div class="content">
                <h2>Hello ${fullName}!</h2>
                <p>Your ride booking has been confirmed! Get ready for an amazing riding experience with Brotherhood Of Mumbai.</p>
                
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">📋 Booking Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Booking Number:</span>
                    <span class="detail-value"><strong>${bookingNumber}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentId || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Booking Type:</span>
                    <span class="detail-value">${bookingType === 'group' ? `Group (${groupSize} riders)` : 'Individual'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${formattedPaidAt}</span>
                  </div>
                </div>

                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">🏍️ Ride Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Ride:</span>
                    <span class="detail-value"><strong>${rideTitle}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">${venue}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Start Date & Time:</span>
                    <span class="detail-value">${formattedDate}</span>
                  </div>
                  ${formattedEndDate ? `
                  <div class="detail-row">
                    <span class="detail-label">End Date & Time:</span>
                    <span class="detail-value">${formattedEndDate}</span>
                  </div>
                  ` : ''}
                </div>

                ${personalInfo ? `
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">👤 Rider Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${personalInfo.contactNumber || personalInfo.phone || 'N/A'}</span>
                  </div>
                  ${personalInfo.address ? `
                  <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${personalInfo.address}</span>
                  </div>
                  ` : ''}
                </div>
                ` : ''}

                ${motorcycleInfo ? `
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">🏍️ Motorcycle Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Make & Model:</span>
                    <span class="detail-value">${motorcycleInfo.modelName || `${motorcycleInfo.make || ''} ${motorcycleInfo.model || ''}`.trim() || 'N/A'}</span>
                  </div>
                  ${motorcycleInfo.motorcycleNumber || motorcycleInfo.registrationNumber ? `
                  <div class="detail-row">
                    <span class="detail-label">Registration No:</span>
                    <span class="detail-value">${motorcycleInfo.motorcycleNumber || motorcycleInfo.registrationNumber}</span>
                  </div>
                  ` : ''}
                </div>
                ` : ''}

                <div class="price-section">
                  <h3 style="margin-top: 0; color: #333; text-align: center;">💰 Payment Summary</h3>
                  ${discountAmount > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Original Amount:</span>
                    <span class="detail-value">₹${originalAmount}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Discount ${couponCode ? `(${couponCode})` : ''}:</span>
                    <span class="detail-value discount-text">- ₹${discountAmount}</span>
                  </div>
                  <hr style="border: none; border-top: 2px solid #ddd; margin: 10px 0;">
                  ` : ''}
                  <div class="total-amount">
                    Total Paid: ₹${amount}
                  </div>
                </div>

                <div class="info-box">
                  <strong>📌 Important Instructions:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Please arrive at the venue 30 minutes before the scheduled start time</li>
                    <li>Carry a valid ID proof and this booking confirmation</li>
                    <li>Ensure your motorcycle is in good condition with valid documents</li>
                    <li>Wear proper riding gear including helmet, gloves, and protective clothing</li>
                    <li>Follow all safety guidelines and instructions from ride marshals</li>
                  </ul>
                </div>

                <div class="warning-box">
                  <strong>⚠️ Cancellation Policy:</strong>
                  <p style="margin: 10px 0;">Cancellations are allowed up to 24 hours before the ride. For assistance, contact our support team.</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL}/profile/bookings" class="button">View My Bookings</a>
                </div>

                <p>If you have any questions or need assistance, feel free to reach out to us.</p>
                
                <p>See you on the road! 🏍️💨</p>
                
                <p>Best regards,<br>
                <strong>Brotherhood Of Mumbai Team</strong></p>
              </div>
              
              <div class="footer">
                <p><strong>Brotherhood Of Mumbai</strong></p>
                <p>Email: ${process.env.EMAIL_USER} | Website: ${process.env.FRONTEND_URL || 'https://brotherhoodofmumbai.com'}</p>
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending ride booking confirmation email:', error);
      // Don't throw error as booking is already confirmed
    }
  }

  // Send event booking confirmation email
  async sendEventBookingConfirmation(email, bookingData) {
    this.ensureInitialized();
    try {
      const { 
        fullName, 
        bookingNumber, 
        eventTitle, 
        location, 
        startDate,
        endDate,
        amount,
        originalAmount,
        discountAmount,
        bookingType, 
        groupSize,
        personalInfo,
        motorcycleInfo,
        couponCode,
        paymentId,
        paidAt
      } = bookingData;

      const formattedStartDate = this.formatDateToIST(startDate);
      const formattedEndDate = endDate ? this.formatDateToIST(endDate) : null;
      const formattedPaidAt = this.formatDateToIST(paidAt);

      const mailOptions = {
        from: {
          name: 'Brotherhood Of Mumbai',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: `Event Registration Confirmed - ${eventTitle} (${bookingNumber})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 650px; margin: 0 auto; background-color: white; }
              .header { background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%); color: white; text-align: center; padding: 30px 20px; }
              .header h1 { margin: 0; font-size: 28px; }
              .success-badge { background-color: #2ecc71; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; font-weight: bold; }
              .content { padding: 30px; }
              .booking-details { background-color: #f8f9fa; border-left: 4px solid #ff4757; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: 600; color: #555; }
              .detail-value { color: #333; text-align: right; }
              .price-section { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .total-amount { font-size: 24px; font-weight: bold; color: #ff4757; text-align: center; }
              .info-box { background-color: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .warning-box { background-color: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { background-color: #333; color: white; text-align: center; padding: 20px; font-size: 12px; }
              .button { display: inline-block; background-color: #ff4757; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
              .discount-text { color: #2ecc71; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Event Registration Confirmed!</h1>
                <div class="success-badge">✓ PAYMENT SUCCESSFUL</div>
              </div>
              
              <div class="content">
                <h2>Hello ${fullName}!</h2>
                <p>Your event registration has been confirmed! We're excited to have you join us for this amazing event.</p>
                
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">📋 Registration Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Booking Number:</span>
                    <span class="detail-value"><strong>${bookingNumber}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentId || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Registration Type:</span>
                    <span class="detail-value">${bookingType === 'group' ? `Group (${groupSize} participants)` : 'Individual'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${formattedPaidAt}</span>
                  </div>
                </div>

                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">📅 Event Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value"><strong>${eventTitle}</strong></span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${location}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Start Date & Time:</span>
                    <span class="detail-value">${formattedStartDate}</span>
                  </div>
                  ${formattedEndDate ? `
                  <div class="detail-row">
                    <span class="detail-label">End Date & Time:</span>
                    <span class="detail-value">${formattedEndDate}</span>
                  </div>
                  ` : ''}
                </div>

                ${personalInfo ? `
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">👤 Participant Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${personalInfo.contactNumber || personalInfo.phone || 'N/A'}</span>
                  </div>
                  ${personalInfo.address ? `
                  <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${personalInfo.address}</span>
                  </div>
                  ` : ''}
                </div>
                ` : ''}

                ${motorcycleInfo ? `
                <div class="booking-details">
                  <h3 style="margin-top: 0; color: #ff4757;">🏍️ Motorcycle Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Make & Model:</span>
                    <span class="detail-value">${motorcycleInfo.modelName || `${motorcycleInfo.make || ''} ${motorcycleInfo.model || ''}`.trim() || 'N/A'}</span>
                  </div>
                  ${motorcycleInfo.motorcycleNumber || motorcycleInfo.registrationNumber ? `
                  <div class="detail-row">
                    <span class="detail-label">Registration No:</span>
                    <span class="detail-value">${motorcycleInfo.motorcycleNumber || motorcycleInfo.registrationNumber}</span>
                  </div>
                  ` : ''}
                </div>
                ` : ''}

                <div class="price-section">
                  <h3 style="margin-top: 0; color: #333; text-align: center;">💰 Payment Summary</h3>
                  ${discountAmount > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Original Amount:</span>
                    <span class="detail-value">₹${originalAmount}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Discount ${couponCode ? `(${couponCode})` : ''}:</span>
                    <span class="detail-value discount-text">- ₹${discountAmount}</span>
                  </div>
                  <hr style="border: none; border-top: 2px solid #ddd; margin: 10px 0;">
                  ` : ''}
                  <div class="total-amount">
                    Total Paid: ₹${amount}
                  </div>
                </div>

                <div class="info-box">
                  <strong>📌 Important Instructions:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Please arrive at the venue 30 minutes before the event starts</li>
                    <li>Carry a valid ID proof and this registration confirmation</li>
                    <li>Check your email regularly for any event updates</li>
                    <li>Follow the event schedule and guidelines</li>
                    <li>For motorcycle events, ensure your bike is in good condition with valid documents</li>
                  </ul>
                </div>

                <div class="warning-box">
                  <strong>⚠️ Cancellation Policy:</strong>
                  <p style="margin: 10px 0;">Cancellation is not allowed once the ticket is booked. For assistance before the event contact our support team.</p>
                </div>


                <p>If you have any questions or need assistance, feel free to reach out to us.</p>
                
                <p>See you at the event! 🎉🏍️</p>
                
                <p>Best regards,<br>
                <strong>Brotherhood Of Mumbai Team</strong></p>
              </div>
              
              <div class="footer">
                <p><strong>Brotherhood Of Mumbai</strong></p>
                <p>Email: ${process.env.EMAIL_USER} | Website: ${process.env.FRONTEND_URL || 'https://brotherhoodofmumbai.com'}</p>
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending event booking confirmation email:', error);
      // Don't throw error as booking is already confirmed
    }
  }

  async sendAudienceConfirmation(registration, event) {
    this.ensureInitialized();

    if (!this.initialized || !this.transporter) {
      console.error('Email service not initialized');
      return;
    }

    try {
      const { personalInfo, paymentInfo, ticketNumber } = registration;
      // Format date without time
      const eventDate = this.formatDateToIST(event.eventDate || event.startDate, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

      const mailOptions = {
        from: `"Brotherhood Of Mumbai" <${process.env.EMAIL_USER}>`,
        to: personalInfo.email,
        subject: `🎉 Audience Registration Confirmed - ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
                color: white;
                padding: 30px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
              }
              .content {
                padding: 30px;
              }
              .ticket-info {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .ticket-number {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
                letter-spacing: 2px;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
              }
              .detail-label {
                font-weight: 600;
                color: #666;
              }
              .detail-value {
                color: #333;
              }
              .info-box {
                background-color: #e7f3ff;
                border-left: 4px solid #2196F3;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Registration Confirmed!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for registering as an audience member</p>
              </div>
              
              <div class="content">
                <p>Dear <strong>${personalInfo.name}</strong>,</p>
                
                <p>Your registration for <strong>${event.title}</strong> has been confirmed successfully! We're excited to have you join us.</p>

                ${ticketNumber ? `
                <div class="ticket-info">
                  <div>🎫 Your Ticket Number</div>
                  <div class="ticket-number">${ticketNumber}</div>
                  <div style="font-size: 14px; margin-top: 10px;">Please keep this for your records</div>
                </div>
                ` : ''}

                <h3 style="color: #ff4757; margin-top: 30px;">📅 Event Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Event:</span>
                  <span class="detail-value">${event.title}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${eventDate}</span>
                </div>
                ${event.venue?.name ? `
                <div class="detail-row">
                  <span class="detail-label">Venue:</span>
                  <span class="detail-value">${event.venue.name}</span>
                </div>
                ` : event.location ? `
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${event.location}</span>
                </div>
                ` : ''}

                <h3 style="color: #ff4757; margin-top: 30px;">👤 Your Information</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${personalInfo.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${personalInfo.email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${personalInfo.phoneNumber}</span>
                </div>

                ${paymentInfo?.amount > 0 ? `
                <h3 style="color: #ff4757; margin-top: 30px;">💰 Payment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value"><strong>₹${paymentInfo.amount}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment Status:</span>
                  <span class="detail-value" style="color: #4CAF50; font-weight: bold;">✓ Completed</span>
                </div>
                ` : ''}

                <div class="info-box">
                  <strong>📌 Important Instructions:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Please arrive at the venue at least 30 minutes before the event starts</li>
                    <li>Carry a valid ID proof for verification</li>
                    <li>Keep this confirmation email handy</li>
                    <li>Check your email regularly for any event updates</li>
                    <li>Follow all event guidelines and instructions from the organizers</li>
                  </ul>
                </div>

                <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <strong style="color: #ff9800;">⚠️ Terms & Conditions:</strong>
                  <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                    <li>Tickets are non-refundable & non-transferable.</li>
                    <li>Valid ID & digital ticket required for entry.</li>
                    <li>Access only to spectator zones; no entry into paddock / track areas.</li>
                    <li>No outside food, drinks, alcohol, drugs allowed.</li>
                    <li>Weapons & hazardous items banned.</li>
                    <li>Follow staff & security instructions.</li>
                    <li>Organizers not responsible for lost belongings.</li>
                    <li>Photos/videos only from allowed areas; no drones.</li>
                    <li>Parking at your own risk.</li>
                    <li>Misconduct may result in removal without refund.</li>
                    <li>Audience attends at own risk; organizers not liable for injuries.</li>
                    <li>Wristband must be worn at all times.</li>
                  </ol>
                  <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">By attending this event, you agree to abide by all terms and conditions.</p>
                </div>

                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                
                <p>We look forward to seeing you at the event! 🎉</p>
                
                <p>Best regards,<br>
                <strong>Brotherhood Of Mumbai Team</strong></p>
              </div>
              
              <div class="footer">
                <p><strong>Brotherhood Of Mumbai</strong></p>
                <p>Email: ${process.env.EMAIL_USER} | Website: ${process.env.FRONTEND_URL || 'https://brotherhoodofmumbai.com'}</p>
                <p>&copy; ${new Date().getFullYear()} Brotherhood Of Mumbai. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Audience confirmation email sent to:', personalInfo.email);
    } catch (error) {
      console.error('Error sending audience confirmation email:', error);
      // Don't throw error as registration is already confirmed
    }
  }
}

export default new EmailService();