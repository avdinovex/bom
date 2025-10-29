import express from 'express';
import TeamMember from '../../models/TeamMember.js';
import { validate, schemas } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getPagination, getPaginationResult, getSortOptions } from '../../utils/pagination.js';
import { uploadSingle, deleteFromCloudinary } from '../../services/uploadService.js';

const router = express.Router();

// @route   GET /api/admin/team
// @desc    Get all team members (admin)
// @access  Admin
router.get('/', validate(schemas.pagination, 'query'), asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, memberType, isActive, search, isLeadership } = req.query;
  const { skip, limit: limitNumber, page: pageNumber } = getPagination(page, limit);
  
  const filter = {};
  if (memberType) filter.memberType = memberType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (isLeadership !== undefined) filter.isLeadership = isLeadership === 'true';
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = getSortOptions(sortBy || 'displayOrder', sortOrder || 'asc');
  const [teamMembers, totalCount] = await Promise.all([
    TeamMember.find(filter).sort(sort).skip(skip).limit(limitNumber),
    TeamMember.countDocuments(filter)
  ]);

  const result = getPaginationResult(teamMembers, totalCount, pageNumber, limitNumber);
  res.json(new ApiResponse(200, result, 'Team members retrieved successfully'));
}));

// @route   POST /api/admin/team
// @desc    Create team member (admin)
// @access  Admin
router.post('/', uploadSingle('memberImage'), asyncHandler(async (req, res) => {
  const memberData = {
    name: req.body.name,
    role: req.body.role,
    memberType: req.body.memberType || 'rider',
    bio: req.body.bio,
    email: req.body.email,
    phone: req.body.phone,
    displayOrder: parseInt(req.body.displayOrder) || 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : true,
    isLeadership: req.body.isLeadership === 'true'
  };
  
  // Handle social media links
  if (req.body.instagram || req.body.youtube || req.body.facebook || req.body.twitter || req.body.linkedin) {
    memberData.social = {
      instagram: req.body.instagram,
      youtube: req.body.youtube,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      linkedin: req.body.linkedin
    };
  }
  
  // Add image URL if file was uploaded
  if (req.file && req.file.cloudinaryUrl) {
    memberData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const teamMember = await TeamMember.create(memberData);
  res.status(201).json(new ApiResponse(201, { teamMember }, 'Team member created successfully'));
}));

// @route   GET /api/admin/team/:id
// @desc    Get single team member (admin)
// @access  Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  res.json(new ApiResponse(200, { teamMember }, 'Team member retrieved successfully'));
}));

// @route   PUT /api/admin/team/:id
// @desc    Update team member (admin)
// @access  Admin
router.put('/:id', uploadSingle('memberImage'), asyncHandler(async (req, res) => {
  const existingMember = await TeamMember.findById(req.params.id);
  if (!existingMember) throw new ApiError(404, 'Team member not found');
  
  const updateData = {
    name: req.body.name,
    role: req.body.role,
    memberType: req.body.memberType,
    bio: req.body.bio,
    email: req.body.email,
    phone: req.body.phone,
    displayOrder: parseInt(req.body.displayOrder) || 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : existingMember.isActive,
    isLeadership: req.body.isLeadership === 'true'
  };
  
  // Handle social media links
  if (req.body.instagram || req.body.youtube || req.body.facebook || req.body.twitter || req.body.linkedin) {
    updateData.social = {
      instagram: req.body.instagram,
      youtube: req.body.youtube,
      facebook: req.body.facebook,
      twitter: req.body.twitter,
      linkedin: req.body.linkedin
    };
  }
  
  // Handle image update
  if (req.file && req.file.cloudinaryUrl) {
    // Delete old image if it exists and is from cloudinary
    if (existingMember.imgUrl && existingMember.imgUrl.includes('cloudinary')) {
      try {
        await deleteFromCloudinary(existingMember.imgUrl);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }
    updateData.imgUrl = req.file.cloudinaryUrl;
  }
  
  const teamMember = await TeamMember.findByIdAndUpdate(req.params.id, updateData, { 
    new: true, 
    runValidators: true 
  });
  
  res.json(new ApiResponse(200, { teamMember }, 'Team member updated successfully'));
}));

// @route   DELETE /api/admin/team/:id
// @desc    Delete team member (admin)
// @access  Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  
  // Delete image from cloudinary if it exists
  if (teamMember.imgUrl && teamMember.imgUrl.includes('cloudinary')) {
    try {
      await deleteFromCloudinary(teamMember.imgUrl);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  
  await teamMember.deleteOne();
  res.json(new ApiResponse(200, null, 'Team member deleted successfully'));
}));

// @route   PATCH /api/admin/team/:id/toggle
// @desc    Toggle team member active status (admin)
// @access  Admin
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);
  if (!teamMember) throw new ApiError(404, 'Team member not found');
  
  teamMember.isActive = !teamMember.isActive;
  await teamMember.save();
  
  res.json(new ApiResponse(200, { teamMember }, `Team member ${teamMember.isActive ? 'activated' : 'deactivated'} successfully`));
}));

export default router;