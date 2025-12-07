import React, { useState, useEffect } from 'react';
import { registrationEntitiesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';

const RegistrationEntities = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntity, setEditingEntity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await registrationEntitiesAPI.adminGetAll();
      setEntities(response.data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast.error('Failed to load registration entities');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will create default configurations for Audience and Participant. Continue?')) {
      return;
    }

    try {
      await registrationEntitiesAPI.seed();
      toast.success('Default configurations created successfully');
      fetchEntities();
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error(error.response?.data?.message || 'Failed to seed data');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await registrationEntitiesAPI.toggleStatus(id);
      toast.success('Status updated successfully');
      fetchEntities();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity({ ...entity });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await registrationEntitiesAPI.update(editingEntity._id, {
        displayName: editingEntity.displayName,
        icon: editingEntity.icon,
        description: editingEntity.description,
        features: editingEntity.features,
        termsAndConditions: editingEntity.termsAndConditions,
        config: editingEntity.config
      });
      toast.success('Entity updated successfully');
      setShowEditModal(false);
      setEditingEntity(null);
      fetchEntities();
    } catch (error) {
      console.error('Error updating entity:', error);
      toast.error('Failed to update entity');
    }
  };

  const handleAddFeature = () => {
    setEditingEntity({
      ...editingEntity,
      features: [...editingEntity.features, { title: '', order: editingEntity.features.length + 1 }]
    });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = editingEntity.features.filter((_, i) => i !== index);
    setEditingEntity({ ...editingEntity, features: newFeatures });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editingEntity.features];
    newFeatures[index].title = value;
    setEditingEntity({ ...editingEntity, features: newFeatures });
  };

  const handleAddTerm = () => {
    setEditingEntity({
      ...editingEntity,
      termsAndConditions: [...editingEntity.termsAndConditions, { content: '', order: editingEntity.termsAndConditions.length + 1 }]
    });
  };

  const handleRemoveTerm = (index) => {
    const newTerms = editingEntity.termsAndConditions.filter((_, i) => i !== index);
    setEditingEntity({ ...editingEntity, termsAndConditions: newTerms });
  };

  const handleTermChange = (index, value) => {
    const newTerms = [...editingEntity.termsAndConditions];
    newTerms[index].content = value;
    setEditingEntity({ ...editingEntity, termsAndConditions: newTerms });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registration Entity Configuration</h1>
        <p className="text-gray-600 mt-1">Manage audience and participant registration settings</p>
      </div>

      {/* Action Bar */}
      {entities.length === 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">No entities found</h3>
              <p className="text-sm text-gray-600 mt-1">Create default configurations to get started</p>
            </div>
            <button
              onClick={handleSeedData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Seed Default Data
            </button>
          </div>
        </div>
      )}

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{entities.map((entity) => (
          <div key={entity._id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{entity.displayName}</h2>
                <p className="text-sm text-gray-500 mt-1">Entity Type: {entity.entityType}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                entity.config?.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {entity.config?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4">
              <p className="text-gray-700 text-sm mb-4">{entity.description}</p>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Features ({entity.features?.length || 0})
                </h3>
                <ul className="space-y-1">
                  {entity.features?.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature.title}
                    </li>
                  ))}
                  {entity.features?.length > 3 && (
                    <li className="text-sm text-gray-500 italic">
                      ...and {entity.features.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Terms & Conditions ({entity.termsAndConditions?.length || 0})
                </h3>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleEdit(entity)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <FiEdit2 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleStatus(entity._id)}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                  entity.config?.isActive
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {entity.config?.isActive ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                {entity.config?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit {editingEntity.displayName}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editingEntity.displayName}
                    onChange={(e) => setEditingEntity({ ...editingEntity, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (Eye, Bike, FiUsers)
                  </label>
                  <input
                    type="text"
                    value={editingEntity.icon}
                    onChange={(e) => setEditingEntity({ ...editingEntity, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingEntity.description}
                    onChange={(e) => setEditingEntity({ ...editingEntity, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Features
                    </label>
                    <button
                      onClick={handleAddFeature}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                    >
                      <FiPlus className="h-3 w-3" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editingEntity.features?.map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Feature title"
                        />
                        <button
                          onClick={() => handleRemoveFeature(idx)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Terms & Conditions
                    </label>
                    <button
                      onClick={handleAddTerm}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                    >
                      <FiPlus className="h-3 w-3" />
                      Add Term
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editingEntity.termsAndConditions?.map((term, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          value={term.content}
                          onChange={(e) => handleTermChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Term content"
                          rows={2}
                        />
                        <button
                          onClick={() => handleRemoveTerm(idx)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FiSave className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationEntities;
