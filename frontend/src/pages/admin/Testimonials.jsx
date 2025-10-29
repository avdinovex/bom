import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, GripVertical } from 'lucide-react';
import api from '../../services/api';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const [formData, setFormData] = useState({
    name: '',
    review: '',
    rating: 5,
    role: '',
    image: null,
    isActive: true,
    displayOrder: 0
  });

  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTestimonials();
  }, [pagination.page, searchTerm, filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        search: searchTerm || undefined,
        isActive: filter === 'all' ? undefined : filter === 'active'
      };

      const response = await api.get('/admin/testimonials', { params });
      setTestimonials(response.data.data.testimonials);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      alert(error.response?.data?.message || 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.review.trim()) newErrors.review = 'Review is required';
    if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';
    if (!editingTestimonial && !formData.image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('review', formData.review);
      submitData.append('rating', formData.rating);
      submitData.append('role', formData.role || '');
      submitData.append('isActive', formData.isActive);
      submitData.append('displayOrder', formData.displayOrder);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingTestimonial) {
        await api.put(`/admin/testimonials/${editingTestimonial._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Testimonial updated successfully');
      } else {
        await api.post('/admin/testimonials', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Testimonial created successfully');
      }

      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert(error.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      review: testimonial.review,
      rating: testimonial.rating,
      role: testimonial.role || '',
      image: null,
      isActive: testimonial.isActive,
      displayOrder: testimonial.displayOrder
    });
    setImagePreview(testimonial.image);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await api.delete(`/admin/testimonials/${id}`);
      alert('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert(error.response?.data?.message || 'Failed to delete testimonial');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/testimonials/${id}/toggle-status`);
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      review: '',
      rating: 5,
      role: '',
      image: null,
      isActive: true,
      displayOrder: 0
    });
    setImagePreview('');
    setEditingTestimonial(null);
    setShowModal(false);
    setErrors({});
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Testimonials Management</h1>
        <p className="text-gray-600">Manage customer testimonials and reviews</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Testimonials Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading testimonials...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimonials.map((testimonial) => (
                  <tr key={testimonial._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GripVertical size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{testimonial.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                      {testimonial.role && (
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {testimonial.review}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-yellow-500">
                        {'★'.repeat(testimonial.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(testimonial._id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          testimonial.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role (Optional)
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Participant, Regular Rider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review *
                  </label>
                  <textarea
                    name="review"
                    value={formData.review}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.review ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter testimonial review"
                  />
                  {errors.review && <p className="text-red-500 text-sm mt-1">{errors.review}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating *
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.rating ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                  {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image * (Max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active (Display on website)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
