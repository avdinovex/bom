import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import api from '../../services/api';

const CouponModal = ({ coupon, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
    applicableFor: 'all',
    minGroupSize: '',
    maxGroupSize: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscount: coupon.maxDiscount || '',
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit || '',
        applicableFor: coupon.applicableFor || 'all',
        minGroupSize: coupon.minGroupSize || '',
        maxGroupSize: coupon.maxGroupSize || '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (formData.code.length < 3) {
      toast.error('Code must be at least 3 characters');
      return;
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast.error('Percentage cannot exceed 100%');
      return;
    }

    if (!formData.expiryDate) {
      toast.error('Expiry date is required');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date()) {
      toast.error('Expiry date must be in the future');
      return;
    }

    if (!formData.usageLimit || formData.usageLimit < 1) {
      toast.error('Usage limit must be at least 1');
      return;
    }

    // Validate group size fields for group coupons
    if (formData.applicableFor === 'group') {
      if (formData.minGroupSize && formData.minGroupSize < 2) {
        toast.error('Minimum group size must be at least 2');
        return;
      }
      if (formData.maxGroupSize && formData.minGroupSize && Number(formData.maxGroupSize) < Number(formData.minGroupSize)) {
        toast.error('Maximum group size must be greater than or equal to minimum group size');
        return;
      }
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: Number(formData.usageLimit),
        minGroupSize: formData.minGroupSize ? Number(formData.minGroupSize) : null,
        maxGroupSize: formData.maxGroupSize ? Number(formData.maxGroupSize) : null
      };

      if (coupon) {
        await api.put(`/admin/coupons/${coupon._id}`, submitData);
        toast.success('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', submitData);
        toast.success('Coupon created successfully');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={true}
      onClose={onClose} 
      title={coupon ? 'Edit Coupon' : 'Create New Coupon'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="e.g., SUMMER2024"
              disabled={coupon && coupon.usedCount > 0}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable For <span className="text-red-500">*</span>
            </label>
            <select
              name="applicableFor"
              value={formData.applicableFor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="all">All Bookings</option>
              <option value="individual">Individual Only</option>
              <option value="group">Group Only</option>
            </select>
          </div>
        </div>

        {/* Group Size Requirements - Only show for group coupons */}
        {(formData.applicableFor === 'group' || formData.applicableFor === 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Group Size
              </label>
              <input
                type="number"
                name="minGroupSize"
                value={formData.minGroupSize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5"
                min="2"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum members required (min: 2)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Group Size
              </label>
              <input
                type="number"
                name="maxGroupSize"
                value={formData.maxGroupSize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 10 (leave empty for no limit)"
                min={formData.minGroupSize || "2"}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum members allowed (optional)</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the coupon..."
            rows="2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.discountType === 'percentage' ? '10' : '500'}
              min="0"
              step={formData.discountType === 'percentage' ? '1' : '10'}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Order Amount (₹)
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              step="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Discount (₹)
            </label>
            <input
              type="number"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="No limit"
              min="0"
              step="10"
            />
            <p className="text-xs text-gray-500 mt-1">Only for percentage discounts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
              min="1"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {coupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponModal;
