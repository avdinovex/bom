import express from 'express';
import Blog from '../models/Blog.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../utils/pagination.js';

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs (public)
// @access  Public
router.get('/', optionalAuth, validate(schemas.blogQuery, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, category, search, featured } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  // Build filter
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.isFeatured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Get sort options
  const sort = getSortOptions(sortBy || 'publishedAt', sortOrder);

  // Execute queries
  const [blogs, totalCount] = await Promise.all([
    Blog.find(filter)
      .select('-content') // Exclude full content for list view
      .populate('author', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber),
    Blog.countDocuments(filter)
  ]);

  const result = getPaginationResult(blogs, totalCount, pageNumber, limitNumber);

  res.json(new ApiResponse(200, result, 'Blogs retrieved successfully'));
}));

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ 
    slug: req.params.slug, 
    isPublished: true 
  })
    .populate('author', 'fullName email')
    .populate('comments.user', 'fullName')
    .populate('likes', 'fullName');

  if (!blog) {
    return res.status(404).json({
      status: 'error',
      message: 'Blog not found'
    });
  }

  // Increment view count
  blog.views += 1;
  await blog.save();

  res.json(new ApiResponse(200, { blog }, 'Blog retrieved successfully'));
}));

// @route   GET /api/blogs/categories/list
// @desc    Get all blog categories
// @access  Public
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Blog.distinct('category', { isPublished: true });
  
  res.json(new ApiResponse(200, { categories }, 'Categories retrieved successfully'));
}));

// @route   GET /api/blogs/featured/list
// @desc    Get featured blogs
// @access  Public
router.get('/featured/list', asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ 
    isPublished: true,
    isFeatured: true
  })
    .select('-content')
    .populate('author', 'fullName')
    .sort({ publishedAt: -1 })
    .limit(6);

  res.json(new ApiResponse(200, { blogs }, 'Featured blogs retrieved successfully'));
}));

// @route   GET /api/blogs/popular/list
// @desc    Get popular blogs (by views)
// @access  Public
router.get('/popular/list', asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .select('-content')
    .populate('author', 'fullName')
    .sort({ views: -1 })
    .limit(6);

  res.json(new ApiResponse(200, { blogs }, 'Popular blogs retrieved successfully'));
}));

// @route   GET /api/blogs/recent/list
// @desc    Get recent blogs
// @access  Public
router.get('/recent/list', asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ isPublished: true })
    .select('-content')
    .populate('author', 'fullName')
    .sort({ publishedAt: -1 })
    .limit(6);

  res.json(new ApiResponse(200, { blogs }, 'Recent blogs retrieved successfully'));
}));

export default router;