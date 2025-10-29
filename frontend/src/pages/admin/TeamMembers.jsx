import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiUsers, FiUserCheck, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import api from '../../services/api';

export default function TeamMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'core', 'rider'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50 // Reduced from 100 to improve performance
      };
      
      if (filter !== 'all') {
        params.memberType = filter;
      }

      const response = await api.get('/admin/team', { params });
      setMembers(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch team members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this member?`)) {
      return;
    }

    try {
      await api.patch(`/admin/team/${id}/toggle`);
      toast.success('Member status updated successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error toggling member status:', error);
      toast.error('Failed to update member status');
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to delete "${member.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/team/${member._id}`);
      toast.success('Member deleted successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleEdit = (member) => {
    navigate(`/admin/team/edit/${member._id}`);
  };

  // Filter members based on search (client-side filtering)
  const filteredMembers = members.filter(member => {
    if (!member || typeof member !== 'object') return false;
    
    if (!searchTerm) return true; // Show all if no search term
    
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'member',
      title: 'Member',
      render: (member) => (
        <div className="flex items-center">
          {member?.imgUrl ? (
            <img 
              src={member.imgUrl} 
              alt={member.name || 'Member'}
              className="h-12 w-12 rounded-full object-cover mr-3"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3"
            style={{ display: member?.imgUrl ? 'none' : 'flex' }}
          >
            <span className="text-gray-500 font-semibold">
              {member?.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              {member?.name || 'Unknown'}
            </div>
            <div className="text-sm text-gray-500">
              {member?.role || 'No role specified'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'memberType',
      title: 'Type',
      render: (member) => {
        const typeColors = {
          core: 'bg-purple-100 text-purple-800',
          rider: 'bg-blue-100 text-blue-800'
        };
        const type = member?.memberType;
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'leadership',
      title: 'Leadership',
      render: (member) => (
        member?.isLeadership ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            ★ Leadership
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      )
    },
    {
      key: 'social',
      title: 'Social Links',
      render: (member) => (
        <div className="flex gap-2">
          {member?.social?.instagram && (
            <a 
              href={member.social.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}
          {member?.social?.youtube && (
            <a 
              href={member.social.youtube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}
          {!member?.social?.instagram && !member?.social?.youtube && (
            <span className="text-gray-400 text-xs">No links</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (member) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            member?.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {member?.isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(member._id, member.isActive);
            }}
            className={`text-xs px-2 py-1 rounded ${
              member?.isActive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {member?.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    },
    {
      key: 'displayOrder',
      title: 'Order',
      render: (member) => (
        <span className="text-sm text-gray-600">
          {member?.displayOrder || '-'}
        </span>
      )
    }
  ];

  // Get stats
  const totalMembers = members.length;
  const coreMembers = members.filter(m => m.memberType === 'core').length;
  const riders = members.filter(m => m.memberType === 'rider').length;
  const leadershipMembers = members.filter(m => m.isLeadership).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Members Management</h1>
        <p className="text-gray-600 mt-1">Manage core team members and riders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              <p className="text-gray-600 text-sm">Total Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{coreMembers}</p>
              <p className="text-gray-600 text-sm">Core Team</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{riders}</p>
              <p className="text-gray-600 text-sm">Riders</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiUserCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{leadershipMembers}</p>
              <p className="text-gray-600 text-sm">Leadership</p>
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
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Members</option>
                <option value="core">Core Team</option>
                <option value="rider">Riders</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/team/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredMembers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No team members found"
      />
    </div>
  );
}
