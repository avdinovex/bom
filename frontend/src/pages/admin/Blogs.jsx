import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiFileText, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import api from '../../services/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    image: '',
    category: 'other',
    tags: '',
    published: false
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/blogs');
      setBlogs(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
      console.error(error);
      setBlogs([]); // Ensure blogs is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs based on search and status
  const filteredBlogs = blogs.filter(blog => {
    // Filter out invalid blog items
    if (!blog || typeof blog !== 'object') return false;
    
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'published') {
      matchesStatus = blog.isPublished === true;
    } else if (filterStatus === 'draft') {
      matchesStatus = blog.isPublished === false;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'title',
      title: 'Article',
      render: (blog) => (
        <div className="flex items-center">
          {blog?.imgUrl && (
            <img 
              src={blog.imgUrl} 
              alt={blog.title || 'Blog post'}
              className="h-12 w-12 rounded-lg object-cover mr-3"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {blog?.title || 'Untitled'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {blog?.excerpt || 'No excerpt'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              By {blog?.author?.fullName || blog?.author || 'Unknown'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (blog) => {
        const categoryColors = {
          rides: 'bg-blue-100 text-blue-800',
          tips: 'bg-green-100 text-green-800',
          gear: 'bg-purple-100 text-purple-800',
          maintenance: 'bg-orange-100 text-orange-800',
          safety: 'bg-red-100 text-red-800',
          news: 'bg-yellow-100 text-yellow-800',
          other: 'bg-gray-100 text-gray-800'
        };
        const category = blog?.category;
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'tags',
      title: 'Tags',
      render: (blog) => (
        <div className="flex flex-wrap gap-1">
          {blog.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
          {blog.tags?.length > 3 && (
            <span className="text-xs text-gray-400">
              +{blog.tags?.length - 3} more
            </span>
          )}
        </div>
      )
    },

    {
      key: 'published',
      title: 'Status',
      render: (blog) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          blog?.isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {blog?.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (blog) => {
        const createdAt = blog?.createdAt;
        if (!createdAt) return <span className="text-gray-500">No date</span>;
        
        return (
          <div className="text-sm">
            <div className="flex items-center text-gray-900">
              <FiCalendar className="h-3 w-3 mr-1" />
              {new Date(createdAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        );
      }
    }
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const submitData = new FormData();
      
      // Append form fields
      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      submitData.append('isPublished', formData.published);
      
      // Handle tags
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        tagsArray.forEach(tag => submitData.append('tags', tag));
      }
      
      // Append file if selected
      if (selectedFile) {
        submitData.append('blogImage', selectedFile);
      }

      if (editingBlog) {
        // Update blog
        await api.put(`/admin/blogs/${editingBlog._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Blog updated successfully');
      } else {
        // Create blog
        await api.post('/admin/blogs', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Blog created successfully');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author: blog.author?.fullName || blog.author || '',
      image: blog.imgUrl || '',
      category: blog.category || 'other',
      tags: blog.tags ? blog.tags.join(', ') : '',
      published: blog.isPublished || false
    });
    setSelectedFile(null);
    setImagePreview(blog.imgUrl || '');
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (blog) => {
    if (window.confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      try {
        await api.delete(`/admin/blogs/${blog._id}`);
        toast.success('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file');
        e.target.value = '';
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      image: '',
      category: 'other',
      tags: '',
      published: false
    });
    setSelectedFile(null);
    setImagePreview('');
    setEditingBlog(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Get stats
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(b => b.isPublished === true).length;
  const draftBlogs = blogs.filter(b => b.isPublished === false).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-gray-600 mt-1">Manage blog posts and articles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalBlogs}</p>
              <p className="text-gray-600 text-sm">Total Articles</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{publishedBlogs}</p>
              <p className="text-gray-600 text-sm">Published</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiFileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{draftBlogs}</p>
              <p className="text-gray-600 text-sm">Drafts</p>
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
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Article
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredBlogs}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No articles found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingBlog ? 'Edit Article' : 'Add New Article'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt *
            </label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your article content here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rides">Rides</option>
                <option value="tips">Tips</option>
                <option value="gear">Gear</option>
                <option value="maintenance">Maintenance</option>
                <option value="safety">Safety</option>
                <option value="news">News</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="travel, bus, tourism (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Enter tags separated by commas</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({...formData, published: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Publish immediately
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
              {editingBlog ? 'Update Article' : 'Create Article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Blogs;