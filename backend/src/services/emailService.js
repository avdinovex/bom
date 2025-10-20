import nodemailer from 'nodemailer';
import { ApiError } from '../utils/ApiError.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration error: EMAIL_USER and EMAIL_PASSWORD must be set');
      return;
    }

    // Create transporter using Gmail SMTP with explicit configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email configuration error:', {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response
        });
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email for registration
  async sendRegistrationOTP(email, otp, fullName) {
    try {
      const mailOptions = {
        from: {
          name: 'Bikers of Maharashtra',
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
                <h1>Welcome to Bikers of Maharashtra!</h1>
              </div>
              <div class="content">
                <h2>Hello ${fullName}!</h2>
                <p>Thank you for registering with Bikers of Maharashtra. To complete your registration, please verify your email address using the OTP below:</p>
                
                <div class="otp-box">
                  <p><strong>Your OTP Code:</strong></p>
                  <div class="otp-code">${otp}</div>
                  <p class="warning">This OTP will expire in 10 minutes</p>
                </div>
                
                <p>If you didn't request this registration, please ignore this email.</p>
                <p>Welcome to our riding community!</p>
                
                <p>Best regards,<br>
                Bikers of Maharashtra Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bikers of Maharashtra. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Registration OTP sent successfully to:', email);
    } catch (error) {
      console.error('Error sending registration OTP:', error);
      throw new ApiError(500, 'Failed to send verification email');
    }
  }

  // Send OTP email for forgot password
  async sendForgotPasswordOTP(email, otp) {
    try {
      const mailOptions = {
        from: {
          name: 'Bikers of Maharashtra',
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
                <p>We received a request to reset your password for your Bikers of Maharashtra account. Use the OTP below to proceed:</p>
                
                <div class="otp-box">
                  <p><strong>Your OTP Code:</strong></p>
                  <div class="otp-code">${otp}</div>
                  <p class="warning">This OTP will expire in 10 minutes</p>
                </div>
                
                <div class="security-note">
                  <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email and consider changing your password for security.
                </div>
                
                <p>Best regards,<br>
                Bikers of Maharashtra Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bikers of Maharashtra. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Forgot password OTP sent successfully to:', email);
    } catch (error) {
      console.error('Error sending forgot password OTP:', error);
      throw new ApiError(500, 'Failed to send password reset email');
    }
  }

  // Send welcome email after successful registration
  async sendWelcomeEmail(email, fullName) {
    try {
      const mailOptions = {
        from: {
          name: 'Bikers of Maharashtra',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Welcome to Bikers of Maharashtra!',
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
                Bikers of Maharashtra Team</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Bikers of Maharashtra. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully to:', email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email as it's not critical
      console.log('Warning: Welcome email failed to send, but registration was successful');
    }
  }
}

export default new EmailService();