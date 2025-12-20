const Parcel = require('../models/Parcel');

async function generateRequestId() {
  const lastParcel = await Parcel.findOne().sort({ createdAt: -1 }).lean();
  let lastNumber = 0;
  
  if (lastParcel && lastParcel.requestId) {
    // Extract numbers from request ID (e.g., REQ00023 -> 23)
    const match = lastParcel.requestId.match(/\d+/);
    if (match) {
      lastNumber = parseInt(match[0], 10) || 0;
    }
  }
  
  const nextNumber = lastNumber + 1;
  // Format: REQ00023 (REQ + 5 digits)
  return `REQ${String(nextNumber).padStart(5, '0')}`;
}

module.exports = generateRequestId;

