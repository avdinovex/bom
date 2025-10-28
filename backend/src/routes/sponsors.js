import express from 'express';
import Sponsor from '../models/Sponsor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/sponsors
 * @desc    Get all active sponsors
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category } = req.query;

    const query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const sponsors = await Sponsor.find(query).sort({ order: 1, createdAt: -1 });

    res.json(
      new ApiResponse(200, sponsors, 'Sponsors fetched successfully')
    );
  })
);

/**
 * @route   GET /api/sponsors/featured
 * @desc    Get featured sponsors for login/registration pages
 * @access  Public
 */
router.get(
  '/featured',
  asyncHandler(async (req, res) => {
    const sponsors = await Sponsor.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ order: 1, createdAt: -1 })
      .limit(2);

    res.json(
      new ApiResponse(200, sponsors, 'Featured sponsors fetched successfully')
    );
  })
);

/**
 * @route   GET /api/sponsors/:id
 * @desc    Get single sponsor by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Sponsor not found')
      );
    }

    res.json(
      new ApiResponse(200, sponsor, 'Sponsor fetched successfully')
    );
  })
);

export default router;
