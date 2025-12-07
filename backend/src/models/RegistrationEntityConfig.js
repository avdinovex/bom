import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const registrationEntityConfigSchema = new Schema({
  // Entity Type: 'audience' or 'participant'
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: ['audience', 'participant'],
    unique: true
  },

  // Display Information
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },

  icon: {
    type: String,
    trim: true,
    default: 'FiUsers' // Icon identifier (e.g., 'Eye', 'Bike', 'FiUsers')
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Features/Benefits List
  features: [{
    title: {
      type: String,
      required: [true, 'Feature title is required'],
      trim: true,
      maxlength: [200, 'Feature title cannot exceed 200 characters']
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Terms and Conditions
  termsAndConditions: [{
    content: {
      type: String,
      required: [true, 'Terms content is required'],
      trim: true,
      maxlength: [500, 'Terms content cannot exceed 500 characters']
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Additional Configuration
  config: {
    // Display order on selection page
    displayOrder: {
      type: Number,
      default: 0
    },
    
    // Whether this entity is currently active/available
    isActive: {
      type: Boolean,
      default: true
    },

    // Color theme for UI
    themeColor: {
      type: String,
      default: '#ff4757'
    },

    // Custom labels
    customLabels: {
      buttonText: {
        type: String,
        default: 'Continue'
      },
      cardTitle: {
        type: String,
        trim: true
      }
    }
  },

  // Event-specific overrides (optional)
  eventOverrides: [{
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    features: [{
      title: String,
      order: Number
    }],
    termsAndConditions: [{
      content: String,
      order: Number
    }],
    description: String,
    isActive: Boolean
  }],

  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
registrationEntityConfigSchema.index({ entityType: 1 });
registrationEntityConfigSchema.index({ 'config.isActive': 1, 'config.displayOrder': 1 });

// Methods
registrationEntityConfigSchema.methods.getConfigForEvent = function(eventId) {
  if (!eventId) {
    return {
      entityType: this.entityType,
      displayName: this.displayName,
      icon: this.icon,
      description: this.description,
      features: this.features.sort((a, b) => a.order - b.order),
      termsAndConditions: this.termsAndConditions.sort((a, b) => a.order - b.order),
      config: this.config
    };
  }

  // Check for event-specific overrides
  const override = this.eventOverrides.find(
    o => o.eventId.toString() === eventId.toString()
  );

  if (override) {
    return {
      entityType: this.entityType,
      displayName: this.displayName,
      icon: this.icon,
      description: override.description || this.description,
      features: override.features && override.features.length > 0 
        ? override.features.sort((a, b) => a.order - b.order)
        : this.features.sort((a, b) => a.order - b.order),
      termsAndConditions: override.termsAndConditions && override.termsAndConditions.length > 0
        ? override.termsAndConditions.sort((a, b) => a.order - b.order)
        : this.termsAndConditions.sort((a, b) => a.order - b.order),
      config: {
        ...this.config,
        isActive: override.isActive !== undefined ? override.isActive : this.config.isActive
      }
    };
  }

  return this.getConfigForEvent(null);
};

const RegistrationEntityConfig = model('RegistrationEntityConfig', registrationEntityConfigSchema);

export default RegistrationEntityConfig;
