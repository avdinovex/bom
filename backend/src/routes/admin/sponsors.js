import express from 'express';
import Sponsor from '../../models/Sponsor.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPaginationResult } from '../../utils/pagination.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';

const router = express.Router();

/**
 * @route   POST /api/admin/sponsors/upload
 * @desc    Upload sponsor logo
 * @access  Private/Admin
 */
router.post(
  '/upload',
  uploadSingle('logo'),
  asyncHandler(async (req, res) => {
    if (!req.uploadedFile) {
      throw new ApiError(400, 'Please upload an image file');
    }

    res.json(
      new ApiResponse(
        200,
        {
          url: req.uploadedFile.url,
          publicId: req.uploadedFile.publicId,
        },
        'Logo uploaded successfully'
      )
    );
  })
);

/**
 * @route   GET /api/admin/sponsors
 * @desc    Get all sponsors (including inactive) with pagination
 * @access  Private/Admin
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, isActive, search } = req.query;

    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);

    const sponsors = await Sponsor.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(limitNumber)
      .skip(skip);

    const total = await Sponsor.countDocuments(query);

    const result = getPaginationResult(sponsors, total, pageNumber, limitNumber);

    res.json(
      new ApiResponse(
        200,
        result,
        'Sponsors fetched successfully'
      )
    );
  })
);

/**
 * @route   GET /api/admin/sponsors/:id
 * @desc    Get single sponsor by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      throw new ApiError(404, 'Sponsor not found');
    }

    res.json(
      new ApiResponse(200, sponsor, 'Sponsor fetched successfully')
    );
  })
);

/**
 * @route   POST /api/admin/sponsors
 * @desc    Create a new sponsor
 * @access  Private/Admin
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      name,
      logoUrl,
      logoPublicId,
      tagline,
      discount,
      description,
      benefits,
      category,
      validUntil,
      color,
      isActive,
      isFeatured,
      order,
    } = req.body;

    // Validate required fields
    if (!name || !logoUrl || !tagline || !discount || !description || !benefits || !category || !validUntil) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    if (!Array.isArray(benefits) || benefits.length === 0) {
      throw new ApiError(400, 'Please provide at least one benefit');
    }

    const sponsor = await Sponsor.create({
      name,
      logoUrl,
      logoPublicId,
      tagline,
      discount,
      description,
      benefits,
      category,
      validUntil,
      color: color || '#dc2626',
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      order: order || 0,
    });

    res.status(201).json(
      new ApiResponse(201, sponsor, 'Sponsor created successfully')
    );
  })
);

/**
 * @route   PUT /api/admin/sponsors/:id
 * @desc    Update a sponsor
 * @access  Private/Admin
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const {
      name,
      logoUrl,
      logoPublicId,
      tagline,
      discount,
      description,
      benefits,
      category,
      validUntil,
      color,
      isActive,
      isFeatured,
      order,
    } = req.body;

    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      throw new ApiError(404, 'Sponsor not found');
    }

    // Validate benefits if provided
    if (benefits !== undefined) {
      if (!Array.isArray(benefits) || benefits.length === 0) {
        throw new ApiError(400, 'Please provide at least one benefit');
      }
    }

    // If logo is being changed and old logo exists, delete it from cloudinary
    if (logoUrl && sponsor.logoPublicId && logoUrl !== sponsor.logoUrl) {
      try {
        await deleteFromCloudinary(sponsor.logoPublicId);
      } catch (error) {
        console.error('Error deleting old logo:', error);
        // Continue with update even if deletion fails
      }
    }

    // Update fields
    if (name !== undefined) sponsor.name = name;
    if (logoUrl !== undefined) sponsor.logoUrl = logoUrl;
    if (logoPublicId !== undefined) sponsor.logoPublicId = logoPublicId;
    if (tagline !== undefined) sponsor.tagline = tagline;
    if (discount !== undefined) sponsor.discount = discount;
    if (description !== undefined) sponsor.description = description;
    if (benefits !== undefined) sponsor.benefits = benefits;
    if (category !== undefined) sponsor.category = category;
    if (validUntil !== undefined) sponsor.validUntil = validUntil;
    if (color !== undefined) sponsor.color = color;
    if (isActive !== undefined) sponsor.isActive = isActive;
    if (isFeatured !== undefined) sponsor.isFeatured = isFeatured;
    if (order !== undefined) sponsor.order = order;

    await sponsor.save();

    res.json(
      new ApiResponse(200, sponsor, 'Sponsor updated successfully')
    );
  })
);

/**
 * @route   DELETE /api/admin/sponsors/:id
 * @desc    Delete a sponsor
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      throw new ApiError(404, 'Sponsor not found');
    }

    // Delete logo from cloudinary if it exists
    if (sponsor.logoPublicId) {
      try {
        await deleteFromCloudinary(sponsor.logoPublicId);
      } catch (error) {
        console.error('Error deleting logo from cloudinary:', error);
        // Continue with deletion even if cloudinary deletion fails
      }
    }

    await sponsor.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Sponsor deleted successfully')
    );
  })
);

/**
 * @route   PATCH /api/admin/sponsors/:id/toggle
 * @desc    Toggle sponsor active status
 * @access  Private/Admin
 */
router.patch(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      throw new ApiError(404, 'Sponsor not found');
    }

    sponsor.isActive = !sponsor.isActive;
    await sponsor.save();

    res.json(
      new ApiResponse(
        200,
        sponsor,
        `Sponsor ${sponsor.isActive ? 'activated' : 'deactivated'} successfully`
      )
    );
  })
);

export default router;
