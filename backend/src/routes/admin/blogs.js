import express from 'express';
import Blog from '../../models/Blog.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';

const router = express.Router();

// @route   GET /api/admin/blogs
// @desc    Get all blogs (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, category, isPublished, search } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (category) filter.category = category;
  if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'createdAt', sortOrder);
  const [blogs, totalCount] = await Promise.all([
    Blog.find(filter).populate('author', 'fullName').sort(sort).skip(skip).limit(limitNumber),
    Blog.countDocuments(filter)
  ]);

  const result = getPaginationResult(blogs, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Blogs retrieved successfully'));
}));

// @route   POST /api/admin/blogs
// @desc    Create blog (admin)
// @access  Admin
router.post('/', uploadSingle('blogImage'), asyncHandler(async (req, res) => {
  const blogData = { 
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt,
    category: req.body.category,
    isPublished: req.body.isPublished === 'true',
    author: req.user._id 
  };
  
  // Handle tags array (FormData sends arrays as multiple values)
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      blogData.tags = req.body.tags;
    } else {
      blogData.tags = [req.body.tags];
    }
  }
  
  // Add image URL if file was uploaded
  if (req.file && req.file.cloudinaryUrl) {
    blogData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const blog = await Blog.create(blogData);
  await blog.populate('author', 'fullName');
  res.status(201).json(new ApiResponse(201, { blog }, 'Blog created successfully'));
}));

// @route   GET /api/admin/blogs/:id
// @desc    Get single blog (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'fullName email')
    .populate('comments.user', 'fullName email');
  
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.json(new ApiResponse(200, { blog }, 'Blog retrieved successfully'));
}));

// @route   PUT /api/admin/blogs/:id
// @desc    Update blog (admin)
// @access  Admin
router.put('/:id', uploadSingle('blogImage'), asyncHandler(async (req, res) => {
  const existingBlog = await Blog.findById(req.params.id);
  if (!existingBlog) throw new ApiError(404, 'Blog not found');
  
  const updateData = {
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt,
    category: req.body.category,
    isPublished: req.body.isPublished === 'true'
  };
  
  // Handle tags array
  if (req.body.tags) {
    if (Array.isArray(req.body.tags)) {
      updateData.tags = req.body.tags;
    } else {
      updateData.tags = [req.body.tags];
    }
  }
  
  // Handle image update
  if (req.file && req.file.cloudinaryUrl) {
    // Delete old image if it exists and is from cloudinary
    if (existingBlog.imgUrl && existingBlog.imgUrl.includes('cloudinary')) {
      try {
        await deleteFromCloudinary(existingBlog.imgUrl);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    updateData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { 
    new: true, 
    runValidators: true 
  }).populate('author', 'fullName');
  
  res.json(new ApiResponse(200, { blog }, 'Blog updated successfully'));
}));

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete blog (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  
  // Delete image from cloudinary if it exists
  if (blog.imgUrl && blog.imgUrl.includes('cloudinary')) {
    try {
      await deleteFromCloudinary(blog.imgUrl);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  
  await blog.deleteOne();
  res.json(new ApiResponse(200, null, 'Blog deleted successfully'));
}));

// @route   POST /api/admin/blogs/:id/publish
// @desc    Publish blog (admin)
// @access  Admin
router.post('/:id/publish', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  
  blog.isPublished = true;
  blog.publishedAt = new Date();
  await blog.save();
  
  res.json(new ApiResponse(200, { blog }, 'Blog published successfully'));
}));

export default router;