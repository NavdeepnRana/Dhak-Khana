const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true,
    },
    trackingId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values, but enforce uniqueness when present
    },
    pickupMode: {
      type: String,
      enum: ['Pickup', 'Dropoff'],
      default: 'Pickup',
    },
    pickupSlot: {
      type: String, // e.g., "9-11 AM"
    },
    assignedAgent: {
      type: String,
      trim: true,
    },
    postOfficeCenter: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    serviceType: {
      type: String,
      enum: ['Speed Post', 'Registered Post', 'Parcel', 'Logistics', 'Money Order'],
      default: 'Speed Post',
    },
    packageType: {
      type: String,
      default: 'Document',
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    senderPhone: {
      type: String,
      trim: true,
    },
    receiverName: {
      type: String,
      required: true,
      trim: true,
    },
    receiverPhone: {
      type: String,
      trim: true,
    },
    sourceCity: {
      type: String,
      required: true,
      trim: true,
    },
    sourcePincode: {
      type: String,
      trim: true,
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
    },
    destinationPincode: {
      type: String,
      trim: true,
    },
    pickupDate: {
      type: Date,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0.1,
    },
    costInr: {
      type: Number,
      required: true,
      min: 0,
    },
    codAmount: {
      type: Number,
      min: 0,
    },
    insurance: {
      type: Boolean,
      default: false,
    },
    otpDelivery: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Net Banking', 'Card'],
      default: 'Cash',
    },
    expectedDelivery: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'Pending Approval',
        'Booked',
        'Picked Up',
        'Arrived at Hub',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Returned',
        'Failed Attempt',
        'On Hold',
        'Cancelled',
        'Cancelled by User',
      ],
      default: 'Pending Approval',
    },
    notes: String,
    proofUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parcel', parcelSchema);


