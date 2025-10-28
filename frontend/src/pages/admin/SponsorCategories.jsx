import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiTag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';

const SponsorCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    value: '',
    icon: 'FiTag',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      };

      const response = await api.get('/admin/sponsor-categories', { params });
      setCategories(response.data.data.data);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await api.put(`/admin/sponsor-categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/sponsor-categories', formData);
        toast.success('Category created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      value: category.value,
      icon: category.icon,
      isActive: category.isActive,
      order: category.order,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This will fail if any sponsors are using this category.')) {
      try {
        await api.delete(`/admin/sponsor-categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await api.patch(`/admin/sponsor-categories/${category._id}/toggle`);
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to toggle category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      icon: 'FiTag',
      isActive: true,
      order: 0,
    });
    setEditMode(false);
    setCurrentCategory(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const columns = [
    {
      key: 'name',
      title: 'Category',
      render: (category) => (
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <FiTag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">Value: {category.value}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (category) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            category.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'order',
      title: 'Order',
      render: (category) => <span className="text-sm text-gray-600">{category.order}</span>,
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (category) => (
        <span className="text-sm text-gray-600">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  // Get stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.isActive === true).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sponsor Categories</h1>
        <p className="text-gray-600 mt-1">Manage sponsor categories for filtering and organization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiTag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
              <p className="text-gray-600 text-sm">Total Categories</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiTag className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeCategories}</p>
              <p className="text-gray-600 text-sm">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Data Table */}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggleActive}
        loading={loading}
        emptyMessage="No categories found"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editMode ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Fuel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Display name shown to users</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Value *</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              placeholder="e.g., fuel"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

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
              Active (visible to users)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editMode ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SponsorCategories;
