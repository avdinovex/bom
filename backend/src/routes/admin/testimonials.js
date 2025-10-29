import express from 'express';
import Testimonial from '../../models/Testimonial.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';

const router = express.Router();

// @route   GET /api/admin/testimonials
// @desc    Get all testimonials with pagination
// @access  Private/Admin
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Testimonial.countDocuments(query);
    const testimonials = await Testimonial.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json(
      new ApiResponse(
        200,
        {
          testimonials,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
          }
        },
        'Testimonials fetched successfully'
      )
    );
  })
);

// @route   GET /api/admin/testimonials/:id
// @desc    Get single testimonial
// @access  Private/Admin
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

// @route   POST /api/admin/testimonials
// @desc    Create new testimonial
// @access  Private/Admin
router.post(
  '/',
  uploadSingle('image'),
  asyncHandler(async (req, res) => {
    const { name, review, rating, role, isActive, displayOrder } = req.body;

    if (!req.file || !req.file.cloudinaryUrl) {
      throw new ApiError(400, 'Image is required');
    }

    const testimonial = await Testimonial.create({
      name,
      review,
      rating: rating || 5,
      role,
      image: req.file.cloudinaryUrl,
      imagePublicId: req.file.cloudinaryPublicId,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    res.status(201).json(
      new ApiResponse(201, testimonial, 'Testimonial created successfully')
    );
  })
);

// @route   PUT /api/admin/testimonials/:id
// @desc    Update testimonial
// @access  Private/Admin
router.put(
  '/:id',
  uploadSingle('image'),
  asyncHandler(async (req, res) => {
    const { name, review, rating, role, isActive, displayOrder } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new ApiError(404, 'Testimonial not found');
    }

    // Update fields
    if (name) testimonial.name = name;
    if (review) testimonial.review = review;
    if (rating) testimonial.rating = rating;
    if (role !== undefined) testimonial.role = role;
    if (isActive !== undefined) testimonial.isActive = isActive;
    if (displayOrder !== undefined) testimonial.displayOrder = displayOrder;

    // If new image is uploaded
    if (req.file && req.file.cloudinaryUrl) {
      // Delete old image from cloudinary
      if (testimonial.imagePublicId) {
        await deleteFromCloudinary(testimonial.imagePublicId);
      }

      testimonial.image = req.file.cloudinaryUrl;
      testimonial.imagePublicId = req.file.cloudinaryPublicId;
    }

    await testimonial.save();

    res.json(
      new ApiResponse(200, testimonial, 'Testimonial updated successfully')
    );
  })
);

// @route   DELETE /api/admin/testimonials/:id
// @desc    Delete testimonial
// @access  Private/Admin
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new ApiError(404, 'Testimonial not found');
    }

    // Delete image from cloudinary
    if (testimonial.imagePublicId) {
      await deleteFromCloudinary(testimonial.imagePublicId);
    }

    await testimonial.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Testimonial deleted successfully')
    );
  })
);

// @route   PATCH /api/admin/testimonials/:id/toggle-status
// @desc    Toggle testimonial active status
// @access  Private/Admin
router.patch(
  '/:id/toggle-status',
  asyncHandler(async (req, res) => {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      throw new ApiError(404, 'Testimonial not found');
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();

    res.json(
      new ApiResponse(200, testimonial, 'Testimonial status updated successfully')
    );
  })
);

// @route   PATCH /api/admin/testimonials/reorder
// @desc    Reorder testimonials
// @access  Private/Admin
router.patch(
  '/reorder',
  asyncHandler(async (req, res) => {
    const { testimonialOrders } = req.body;

    if (!Array.isArray(testimonialOrders)) {
      throw new ApiError(400, 'testimonialOrders must be an array');
    }

    // Update display order for each testimonial
    const updatePromises = testimonialOrders.map(({ id, displayOrder }) =>
      Testimonial.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json(
      new ApiResponse(200, null, 'Testimonials reordered successfully')
    );
  })
);

export default router;
