const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    agentId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    assignedCity: {
      type: String,
      trim: true,
    },
    assignedArea: {
      type: String,
      trim: true,
    },
    postOffice: {
      type: String,
      trim: true,
    },
    hub: {
      type: String,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Cycle', 'Van', 'Car', 'Other'],
      default: 'Bike',
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    shiftTime: {
      type: String,
      enum: ['Morning', 'Evening', 'Full Day'],
      default: 'Full Day',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    role: {
      type: String,
      enum: ['agent', 'pickup_boy'],
      default: 'agent',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for faster lookups
agentSchema.index({ agentId: 1 });
agentSchema.index({ email: 1 });
agentSchema.index({ mobile: 1 });
agentSchema.index({ status: 1 });

module.exports = mongoose.model('Agent', agentSchema);

