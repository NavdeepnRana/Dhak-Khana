const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    serviceArea: {
      type: String,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Center', centerSchema);


