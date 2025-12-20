const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: {
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
    phone: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['post_office', 'user_support', 'developer', 'feedback'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

