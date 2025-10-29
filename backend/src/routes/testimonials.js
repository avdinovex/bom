import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

// @route   GET /api/testimonials
// @desc    Get all active testimonials (public route)
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v');

    res.json(
      new ApiResponse(200, testimonials, 'Testimonials fetched successfully')
    );
  })
);

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial by ID
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new ApiError(404, 'Testimonial not found');
    }

    res.json(
      new ApiResponse(200, testimonial, 'Testimonial fetched successfully')
    );
  })
);

export default router;
