import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiX, FiUpload, FiGift, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    logoPublicId: '',
    tagline: '',
    discount: '',
    description: '',
    benefits: [''],
    category: '',
    validUntil: '',
    color: '#dc2626',
    isActive: true,
    isFeatured: false,
    order: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchSponsors();
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [searchTerm, filterCategory, filterStatus]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/sponsor-categories');
      const fetchedCategories = response.data.data;
      setCategories(fetchedCategories);

      // Set default category if not set
      if (!formData.category && fetchedCategories.length > 0) {
        setFormData((prev) => ({ ...prev, category: fetchedCategories[0].value }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
      };

      if (filterCategory && filterCategory !== 'all') {
        params.category = filterCategory;
      }

      if (filterStatus !== 'all') {
        params.isActive = filterStatus === 'active';
      }

      const response = await api.get('/admin/sponsors', { params });
      setSponsors(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch sponsors');
      console.error(error);
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ''],
    }));
  };

  const removeBenefit = (index) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, benefits: newBenefits }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('logo', selectedFile);

      const response = await api.post('/admin/sponsors/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.data.url,
        publicId: response.data.data.publicId,
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter((b) => b.trim() !== '');

    if (filteredBenefits.length === 0) {
      toast.error('Please add at least one benefit');
      return;
    }

    try {
      setFormLoading(true);

      let logoUrl = formData.logoUrl;
      let logoPublicId = formData.logoPublicId;

      // Upload image if a new file is selected
      if (selectedFile) {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          logoUrl = uploadResult.url;
          logoPublicId = uploadResult.publicId;
        }
      }

      if (!logoUrl) {
        toast.error('Please upload a logo image');
        setFormLoading(false);
        return;
      }

      const dataToSubmit = {
        ...formData,
        logoUrl,
        logoPublicId,
        benefits: filteredBenefits,
      };

      if (editingId) {
        await api.put(`/admin/sponsors/${editingId}`, dataToSubmit);
        toast.success('Sponsor updated successfully');
      } else {
        await api.post('/admin/sponsors', dataToSubmit);
        toast.success('Sponsor created successfully');
      }

      resetForm();
      setIsModalOpen(false);
      fetchSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast.error(error.response?.data?.message || 'Failed to save sponsor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (sponsor) => {
    setEditingId(sponsor._id);
    
    // Convert validUntil to YYYY-MM-DD format for date input
    let formattedDate = sponsor.validUntil;
    if (sponsor.validUntil) {
      try {
        const date = new Date(sponsor.validUntil);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }
    
    setFormData({
      name: sponsor.name,
      logoUrl: sponsor.logoUrl,
      logoPublicId: sponsor.logoPublicId || '',
      tagline: sponsor.tagline,
      discount: sponsor.discount,
      description: sponsor.description,
      benefits: sponsor.benefits,
      category: sponsor.category,
      validUntil: formattedDate,
      color: sponsor.color,
      isActive: sponsor.isActive,
      isFeatured: sponsor.isFeatured || false,
      order: sponsor.order,
    });
    setImagePreview(sponsor.logoUrl);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await api.delete(`/admin/sponsors/${id}`);
        toast.success('Sponsor deleted successfully');
        fetchSponsors();
      } catch (error) {
        console.error('Error deleting sponsor:', error);
        toast.error('Failed to delete sponsor');
      }
    }
  };

  const handleToggleActive = async (sponsor) => {
    try {
      await api.patch(`/admin/sponsors/${sponsor._id}/toggle`);
      toast.success(`Sponsor ${!sponsor.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchSponsors();
    } catch (error) {
      console.error('Error toggling sponsor status:', error);
      toast.error('Failed to toggle sponsor status');
    }
  };

  const resetForm = () => {
    const defaultCategory = categories.length > 0 ? categories[0].value : '';
    setFormData({
      name: '',
      logoUrl: '',
      logoPublicId: '',
      tagline: '',
      discount: '',
      description: '',
      benefits: [''],
      category: defaultCategory,
      validUntil: '',
      color: '#dc2626',
      isActive: true,
      isFeatured: false,
      order: 0,
    });
    setEditingId(null);
    setSelectedFile(null);
    setImagePreview('');
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Filter sponsors
  const filteredSponsors = sponsors.filter((sponsor) => {
    if (!sponsor || typeof sponsor !== 'object') return false;
    return true; // Already filtered by backend
  });

  // Get stats
  const totalSponsors = sponsors.length;
  const activeSponsors = sponsors.filter(s => s.isActive === true).length;
  const featuredSponsors = sponsors.filter(s => s.isFeatured === true).length;

  // Table columns configuration
  const columns = [
    {
      key: 'logo',
      title: 'Sponsor',
      render: (sponsor) => (
        <div className="flex items-center">
          {sponsor?.logoUrl && (
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name || 'Sponsor'}
              className="h-12 w-12 rounded-lg object-cover mr-3"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {sponsor?.name || 'Unnamed'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {sponsor?.tagline || 'No tagline'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      title: 'Discount',
      render: (sponsor) => (
        sponsor?.discount ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            {sponsor.discount}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (sponsor) => {
        const categoryColors = {
          fuel: 'bg-blue-100 text-blue-800',
          maintenance: 'bg-green-100 text-green-800',
          insurance: 'bg-purple-100 text-purple-800',
          food: 'bg-orange-100 text-orange-800',
          accessories: 'bg-pink-100 text-pink-800',
          other: 'bg-gray-100 text-gray-800',
        };
        const category = sponsor?.category;
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              categoryColors[category] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'validUntil',
      title: 'Valid Until',
      render: (sponsor) => (
        <span className="text-sm text-gray-600">{sponsor?.validUntil || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (sponsor) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              sponsor?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {sponsor?.isActive ? 'Active' : 'Inactive'}
          </span>
          {sponsor?.isFeatured && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      title: 'Order',
      render: (sponsor) => <span className="text-sm text-gray-600">{sponsor?.order || 0}</span>,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sponsor Management</h1>
        <p className="text-gray-600 mt-1">Manage sponsor partnerships and offerings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiGift className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalSponsors}</p>
              <p className="text-gray-600 text-sm">Total Sponsors</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiGift className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeSponsors}</p>
              <p className="text-gray-600 text-sm">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{featuredSponsors}</p>
              <p className="text-gray-600 text-sm">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Sponsor
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredSponsors}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggleActive}
        loading={loading}
        emptyMessage="No sponsors found"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? 'Edit Sponsor' : 'Add New Sponsor'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Image * {uploadingImage && <span className="text-blue-600">(Uploading...)</span>}
            </label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setSelectedFile(null);
                      setFormData((prev) => ({ ...prev, logoUrl: '', logoPublicId: '' }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center py-3">
                    <FiUpload className="w-6 h-6 mb-1 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter sponsor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tagline"
              />
            </div>
          </div>

          {/* Discount & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="e.g. 15% OFF, Flat ₹500 OFF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if no discount available</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valid Until & Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until *</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color *</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the sponsor offering"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits *</label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="Enter benefit"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefit}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <FiPlus /> Add Benefit
            </button>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Featured (Show on Login/Register pages)
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || uploadingImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {formLoading && <LoadingSpinner size="sm" />}
              {editingId ? 'Update Sponsor' : 'Create Sponsor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sponsors;
