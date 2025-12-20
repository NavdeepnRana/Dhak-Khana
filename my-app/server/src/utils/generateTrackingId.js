const Parcel = require('../models/Parcel');

async function generateTrackingId() {
  const lastParcel = await Parcel.findOne().sort({ createdAt: -1 }).lean();
  let lastNumber = 0;
  
  if (lastParcel && lastParcel.trackingId) {
    // Extract numbers from tracking ID (e.g., POST12345678 -> 12345678)
    const match = lastParcel.trackingId.match(/\d+/);
    if (match) {
      lastNumber = parseInt(match[0], 10) || 0;
    }
  }
  
  const nextNumber = lastNumber + 1;
  // Format: POST12345678 (POST + 8 digits)
  return `POST${String(nextNumber).padStart(8, '0')}`;
}

module.exports = generateTrackingId;

