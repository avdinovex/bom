import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiTag, FiPercent, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DataTable from './DataTable';
import CouponModal from './CouponModal';
import Modal from './Modal';
import api from '../../services/api';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/coupons');
      
      // API structure: response.data.data = { data: [...], pagination: {...} }
      const couponsData = response.data.data?.data || response.data.data;
      
      // Ensure it's always an array
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      console.error('Fetch error:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/coupons/stats');
      setStats(response.data.data?.stats || response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats if fetch fails
      setStats({
        totalCoupons: 0,
        activeCoupons: 0,
        usedCoupons: 0,
        expiredCoupons: 0
      });
    }
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (coupon) => {
    if (coupon.usedCount > 0) {
      toast.error('Cannot delete a coupon that has been used');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/coupons/${coupon._id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await api.patch(`/admin/coupons/${coupon._id}/toggle`);
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCoupons();
      fetchStats();
    } catch (error) {
      toast.error('Failed to toggle coupon status');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCoupon(null);
  };

  const handleSuccess = () => {
    fetchCoupons();
    fetchStats();
    handleModalClose();
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    if (!coupon) return false;
    
    const matchesSearch = 
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'active') {
      const isExpired = new Date(coupon.expiryDate) < new Date();
      const isLimitReached = coupon.usedCount >= coupon.usageLimit;
      matchesStatus = coupon.isActive && !isExpired && !isLimitReached;
    } else if (filterStatus === 'inactive') {
      matchesStatus = !coupon.isActive;
    } else if (filterStatus === 'expired') {
      matchesStatus = new Date(coupon.expiryDate) < new Date();
    }
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'code',
      title: 'Coupon Code',
      render: (coupon) => (
        <div>
          <div className="font-mono text-sm font-bold text-blue-600">
            {coupon.code}
          </div>
          {coupon.description && (
            <div className="text-xs text-gray-500 mt-1">
              {coupon.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'discount',
      title: 'Discount',
      render: (coupon) => (
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {coupon.discountType === 'percentage' 
              ? `${coupon.discountValue}%` 
              : `₹${coupon.discountValue}`}
          </div>
          {coupon.maxDiscount && (
            <div className="text-xs text-gray-500">
              Max: ₹{coupon.maxDiscount}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'minOrderAmount',
      title: 'Min Amount',
      render: (coupon) => (
        <span className="text-sm text-gray-900">
          ₹{coupon.minOrderAmount || 0}
        </span>
      )
    },
    {
      key: 'applicableFor',
      title: 'Applicable For',
      render: (coupon) => {
        const colors = {
          all: 'bg-green-100 text-green-800',
          group: 'bg-blue-100 text-blue-800',
          individual: 'bg-orange-100 text-orange-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[coupon.applicableFor] || 'bg-gray-100 text-gray-800'}`}>
            {coupon.applicableFor?.charAt(0).toUpperCase() + coupon.applicableFor?.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'usage',
      title: 'Usage',
      render: (coupon) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {coupon.usedCount} / {coupon.usageLimit}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'expiryDate',
      title: 'Expires',
      render: (coupon) => (
        <div className="text-sm text-gray-900">
          {new Date(coupon.expiryDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (coupon) => {
        const isExpired = new Date(coupon.expiryDate) < new Date();
        const isLimitReached = coupon.usedCount >= coupon.usageLimit;
        
        let status = 'Active';
        let colorClass = 'bg-green-100 text-green-800';
        
        if (!coupon.isActive) {
          status = 'Inactive';
          colorClass = 'bg-gray-100 text-gray-800';
        } else if (isExpired) {
          status = 'Expired';
          colorClass = 'bg-red-100 text-red-800';
        } else if (isLimitReached) {
          status = 'Limit Reached';
          colorClass = 'bg-orange-100 text-orange-800';
        }
        
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
              {status}
            </span>
            <button
              onClick={() => handleToggle(coupon)}
              className="text-xs text-orange-600 hover:text-orange-900 font-medium"
              title={coupon.isActive ? 'Deactivate' : 'Activate'}
            >
              {coupon.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        );
      }
    }
  ];

  // Get stats
  const totalCoupons = stats?.totalCoupons || 0;
  const activeCoupons = stats?.activeCoupons || 0;
  const usedCoupons = stats?.usedCoupons || 0;
  const expiredCoupons = stats?.expiredCoupons || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
        <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiTag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalCoupons}</p>
              <p className="text-gray-600 text-sm">Total Coupons</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiTag className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeCoupons}</p>
              <p className="text-gray-600 text-sm">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiPercent className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{usedCoupons}</p>
              <p className="text-gray-600 text-sm">Used</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiTag className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{expiredCoupons}</p>
              <p className="text-gray-600 text-sm">Expired</p>
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
                placeholder="Search coupons..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Coupon
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredCoupons}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No coupons found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <CouponModal
          coupon={selectedCoupon}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default CouponList;
