const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Admin User',
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);

