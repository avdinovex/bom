import express from 'express';
import SponsorCategory from '../../models/SponsorCategory.js';
import Sponsor from '../../models/Sponsor.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPaginationResult } from '../../utils/pagination.js';

const router = express.Router();

/**
 * @route   GET /api/admin/sponsor-categories
 * @desc    Get all sponsor categories with pagination
 * @access  Private/Admin
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, isActive, search } = req.query;

    const query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { value: { $regex: search, $options: 'i' } },
      ];
    }

    const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);

    const categories = await SponsorCategory.find(query)
      .sort({ order: 1, name: 1 })
      .limit(limitNumber)
      .skip(skip);

    const total = await SponsorCategory.countDocuments(query);

    const result = getPaginationResult(categories, total, pageNumber, limitNumber);

    res.json(
      new ApiResponse(
        200,
        result,
        'Categories fetched successfully'
      )
    );
  })
);

/**
 * @route   GET /api/admin/sponsor-categories/:id
 * @desc    Get single sponsor category by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await SponsorCategory.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    res.json(
      new ApiResponse(200, category, 'Category fetched successfully')
    );
  })
);

/**
 * @route   POST /api/admin/sponsor-categories
 * @desc    Create a new sponsor category
 * @access  Private/Admin
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, value, icon, isActive, order } = req.body;

    // Validate required fields
    if (!name || !value || !icon) {
      throw new ApiError(400, 'Please provide name, value, and icon');
    }

    // Check for duplicate value
    const existingCategory = await SponsorCategory.findOne({ 
      $or: [{ value: value.toLowerCase() }, { name }] 
    });
    
    if (existingCategory) {
      throw new ApiError(400, 'Category with this name or value already exists');
    }

    const category = await SponsorCategory.create({
      name,
      value: value.toLowerCase(),
      icon,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json(
      new ApiResponse(201, category, 'Category created successfully')
    );
  })
);

/**
 * @route   PUT /api/admin/sponsor-categories/:id
 * @desc    Update a sponsor category
 * @access  Private/Admin
 */
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, value, icon, isActive, order } = req.body;

    const category = await SponsorCategory.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check for duplicate if name or value is being changed
    if (name || value) {
      const duplicateQuery = { _id: { $ne: req.params.id } };
      if (name && name !== category.name) {
        duplicateQuery.name = name;
      }
      if (value && value.toLowerCase() !== category.value) {
        duplicateQuery.value = value.toLowerCase();
      }

      const existingCategory = await SponsorCategory.findOne(duplicateQuery);
      if (existingCategory) {
        throw new ApiError(400, 'Category with this name or value already exists');
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (value !== undefined) category.value = value.toLowerCase();
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();

    res.json(
      new ApiResponse(200, category, 'Category updated successfully')
    );
  })
);

/**
 * @route   DELETE /api/admin/sponsor-categories/:id
 * @desc    Delete a sponsor category
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await SponsorCategory.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check if any sponsors use this category
    const sponsorCount = await Sponsor.countDocuments({ category: category.value });
    
    if (sponsorCount > 0) {
      throw new ApiError(
        400, 
        `Cannot delete category. ${sponsorCount} sponsor(s) are using this category. Please reassign or delete those sponsors first.`
      );
    }

    await category.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Category deleted successfully')
    );
  })
);

/**
 * @route   PATCH /api/admin/sponsor-categories/:id/toggle
 * @desc    Toggle sponsor category active status
 * @access  Private/Admin
 */
router.patch(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const category = await SponsorCategory.findById(req.params.id);

    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json(
      new ApiResponse(
        200,
        category,
        `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`
      )
    );
  })
);

export default router;
