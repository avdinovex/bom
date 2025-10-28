import express from 'express';
import SponsorCategory from '../models/SponsorCategory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/sponsor-categories
 * @desc    Get all active sponsor categories
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await SponsorCategory.find({ isActive: true }).sort({ order: 1, name: 1 });

    res.json(
      new ApiResponse(200, categories, 'Categories fetched successfully')
    );
  })
);

/**
 * @route   GET /api/sponsor-categories/:id
 * @desc    Get single sponsor category by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await SponsorCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Category not found')
      );
    }

    res.json(
      new ApiResponse(200, category, 'Category fetched successfully')
    );
  })
);

export default router;
