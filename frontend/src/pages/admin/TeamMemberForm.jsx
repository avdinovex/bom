import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TeamMemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    memberType: 'rider',
    bio: '',
    email: '',
    phone: '',
    instagram: '',
    youtube: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    displayOrder: 0,
    isActive: true,
    isLeadership: false,
    memberImage: null
  });

  useEffect(() => {
    if (isEditMode) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/team/${id}`);
      const member = response.data.data.teamMember;
      
      setFormData({
        name: member.name || '',
        role: member.role || '',
        memberType: member.memberType || 'rider',
        bio: member.bio || '',
        email: member.email || '',
        phone: member.phone || '',
        instagram: member.social?.instagram || '',
        youtube: member.social?.youtube || '',
        facebook: member.social?.facebook || '',
        twitter: member.social?.twitter || '',
        linkedin: member.social?.linkedin || '',
        displayOrder: member.displayOrder || 0,
        isActive: member.isActive,
        isLeadership: member.isLeadership,
        memberImage: null
      });
      
      if (member.imgUrl) {
        setImagePreview(member.imgUrl);
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      alert('Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, memberImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('memberType', formData.memberType);
      submitData.append('displayOrder', formData.displayOrder);
      submitData.append('isActive', formData.isActive);
      submitData.append('isLeadership', formData.isLeadership);
      
      // Optional fields
      if (formData.role) submitData.append('role', formData.role);
      if (formData.bio) submitData.append('bio', formData.bio);
      if (formData.email) submitData.append('email', formData.email);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.instagram) submitData.append('instagram', formData.instagram);
      if (formData.youtube) submitData.append('youtube', formData.youtube);
      if (formData.facebook) submitData.append('facebook', formData.facebook);
      if (formData.twitter) submitData.append('twitter', formData.twitter);
      if (formData.linkedin) submitData.append('linkedin', formData.linkedin);
      
      // Append image if selected
      if (formData.memberImage) {
        submitData.append('memberImage', formData.memberImage);
      }

      if (isEditMode) {
        await api.put(`/admin/team/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Team member updated successfully');
      } else {
        await api.post('/admin/team', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Team member created successfully');
      }
      
      navigate('/admin/team');
    } catch (error) {
      console.error('Error saving member:', error);
      alert(error.response?.data?.message || 'Failed to save team member');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? 'Edit Team Member' : 'Add New Team Member'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Image</label>
            <div className="flex items-center space-x-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Member Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Member Type *</label>
            <select
              name="memberType"
              value={formData.memberType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rider">Rider</option>
              <option value="core">Core Team</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Founder, Secretary, Core Member"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">YouTube</label>
                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium mb-2">Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active (visible on website)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isLeadership"
                checked={formData.isLeadership}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Leadership Team
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/team')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
