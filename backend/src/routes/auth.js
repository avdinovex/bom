import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateToken } from '../utils/jwt.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (sends OTP for verification)
// @access  Public
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { fullName, email, password, primaryBike, experienceLevel } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.emailVerified) {
    throw new ApiError(409, 'User already exists with this email');
  }

  let user;
  if (existingUser && !existingUser.emailVerified) {
    // Update existing unverified user
    user = existingUser;
    user.fullName = fullName;
    user.passwordHash = password; // Will be hashed by pre-save middleware
    user.primaryBike = primaryBike;
    user.experienceLevel = experienceLevel;
  } else {
    // Create new user (email not verified by default)
    user = new User({
      fullName,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      primaryBike,
      experienceLevel,
      emailVerified: false
    });
  }

  // Generate OTP and send email
  const otp = user.generateOTP('registration');
  await user.save();

  // Send OTP email
  await emailService.sendRegistrationOTP(email, otp, fullName);

  res.status(201).json(new ApiResponse(201, {
    email: user.email,
    message: 'Registration initiated. Please check your email for OTP verification.'
  }, 'OTP sent successfully. Please verify your email to complete registration.'));
}));

// @route   POST /api/auth/verify-registration-otp
// @desc    Verify OTP for user registration
// @access  Public
router.post('/verify-registration-otp', validate(schemas.verifyRegistrationOTP), asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user with OTP data
  const user = await User.findOne({ email }).select('+otp +otpExpires +otpType');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.emailVerified) {
    throw new ApiError(400, 'Email already verified. Please login.');
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'registration')) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Mark email as verified and clear OTP
  user.emailVerified = true;
  user.clearOTP();
  await user.save();

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(email, user.fullName).catch(err => 
    console.error('Failed to send welcome email:', err)
  );

  // Generate token
  const token = generateToken(user._id, user.role);

  res.status(200).json(new ApiResponse(200, {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      primaryBike: user.primaryBike,
      experienceLevel: user.experienceLevel,
      emailVerified: user.emailVerified
    },
    token
  }, 'Email verified successfully. Registration completed!'));
}));

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for registration or forgot password
// @access  Public
router.post('/resend-otp', validate(schemas.resendOTP), asyncHandler(async (req, res) => {
  const { email, type } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (type === 'registration' && user.emailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  // Generate new OTP
  const otp = user.generateOTP(type);
  await user.save();

  // Send appropriate email
  if (type === 'registration') {
    await emailService.sendRegistrationOTP(email, otp, user.fullName);
  } else if (type === 'forgot-password') {
    await emailService.sendForgotPasswordOTP(email, otp);
  }

  res.json(new ApiResponse(200, null, `${type === 'registration' ? 'Registration' : 'Password reset'} OTP resent successfully`));
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if email is verified
  if (!user.emailVerified) {
    throw new ApiError(401, 'Please verify your email before logging in. Check your email for OTP.');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(401, 'Account is deactivated. Please contact support');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id, user.role);

  res.json(new ApiResponse(200, {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      primaryBike: user.primaryBike,
      experienceLevel: user.experienceLevel,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified
    },
    token
  }, 'Login successful'));
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('bookings', 'ride amount status createdAt')
    .populate({
      path: 'bookings',
      populate: {
        path: 'ride',
        select: 'title venue startTime'
      }
    });

  res.json(new ApiResponse(200, { user }, 'User profile retrieved successfully'));
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validate(schemas.updateProfile), asyncHandler(async (req, res) => {
  const { fullName, primaryBike, experienceLevel, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update fields
  if (fullName) user.fullName = fullName;
  if (primaryBike) user.primaryBike = primaryBike;
  if (experienceLevel) user.experienceLevel = experienceLevel;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json(new ApiResponse(200, { user }, 'Profile updated successfully'));
}));

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  res.json(new ApiResponse(200, null, 'Password changed successfully'));
}));

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', validate(schemas.forgotPassword), asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'No user found with this email address');
  }

  if (!user.emailVerified) {
    throw new ApiError(400, 'Email not verified. Please complete registration first.');
  }

  // Generate OTP for forgot password
  const otp = user.generateOTP('forgot-password');
  await user.save();

  // Send OTP email
  await emailService.sendForgotPasswordOTP(email, otp);

  res.json(new ApiResponse(200, null, 'Password reset OTP sent to your email'));
}));

// @route   POST /api/auth/verify-forgot-password-otp
// @desc    Verify OTP for forgot password
// @access  Public
router.post('/verify-forgot-password-otp', validate(schemas.verifyForgotPasswordOTP), asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user with OTP data
  const user = await User.findOne({ email }).select('+otp +otpExpires +otpType');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'forgot-password')) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  res.json(new ApiResponse(200, { email }, 'OTP verified. You can now reset your password.'));
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', validate(schemas.resetPassword), asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Find user with OTP data
  const user = await User.findOne({ email }).select('+otp +otpExpires +otpType');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify OTP
  if (!user.verifyOTP(otp, 'forgot-password')) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Update password and clear OTP
  user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  user.clearOTP();
  await user.save();

  res.json(new ApiResponse(200, null, 'Password reset successfully. You can now login with your new password.'));
}));

export default router;