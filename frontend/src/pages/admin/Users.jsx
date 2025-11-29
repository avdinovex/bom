import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true
  });

  // Fetch users
  const fetchUsers = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // Add optional filters
      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/admin/users?${params.toString()}`);
      const result = response.data.data;

      setUsers(result.data || []);
      setPagination(result.pagination || null);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (searchTerm !== '' || filterRole !== 'all') {
      setCurrentPage(1); // Reset to page 1 when filters change
      fetchUsers(1, itemsPerPage);
    }
  }, [searchTerm, filterRole]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUsers(newPage, itemsPerPage);
  };

  // Filter users based on search and role - NO LONGER NEEDED, backend handles this
  // But we keep it for display purposes if needed
  const filteredUsers = users;

  // Table columns configuration
  const columns = [
    {
      key: 'fullName',
      title: 'Name',
      render: (user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      className: 'text-gray-600'
    },
    {
      key: 'role',
      title: 'Role',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-blue-100 text-blue-800'
          }`}>
          {user.role}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
          }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (user) => (
        <span className="text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingUser) {
        // Update user
        await api.put(`/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        // Create user
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      try {
        await api.delete(`/admin/users/${user._id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'user',
      isActive: true
    });
    setEditingUser(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Export users (fetch all from backend export endpoint)
  const handleExport = async () => {
    try {
      // Build query params for filters if needed
      const params = new URLSearchParams();
      if (filterRole !== 'all') {
        params.append('role', filterRole);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      // Fetch all users from export endpoint
      const response = await api.get(`/admin/users/export?${params.toString()}`);
      const allUsers = response.data.data || [];

      const csvContent = "data:text/csv;charset=utf-8," +
        "Name,Email,Phone,Role,Status,Joined\n" +
        allUsers.map(user =>
          `${user.fullName},${user.email},${user.phone},${user.role},${user.isActive ? 'Active' : 'Inactive'},${new Date(user.createdAt).toLocaleDateString()}`
        ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pagination?.totalItems || users.length}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Users (Current Page)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Administrators (Current Page)</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No users found"
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active User
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {formLoading && <LoadingSpinner size="sm" />}
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;