const Parcel = require('../models/Parcel');

async function generateTrackingId() {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Find the parcel with the highest tracking ID number
    const parcelsWithTrackingId = await Parcel.find({ 
      trackingId: { $exists: true, $ne: null } 
    })
      .sort({ trackingId: -1 })
      .limit(1)
      .lean();
    
    let lastNumber = 0;
    
    if (parcelsWithTrackingId.length > 0 && parcelsWithTrackingId[0].trackingId) {
      // Extract numbers from tracking ID (e.g., POST12345678 -> 12345678)
      const match = parcelsWithTrackingId[0].trackingId.match(/\d+/);
      if (match) {
        lastNumber = parseInt(match[0], 10) || 0;
      }
    }
    
    const nextNumber = lastNumber + 1;
    // Format: POST12345678 (POST + 8 digits)
    const newTrackingId = `POST${String(nextNumber).padStart(8, '0')}`;
    
    // Check if this tracking ID already exists
    const existingParcel = await Parcel.findOne({ trackingId: newTrackingId }).lean();
    
    if (!existingParcel) {
      // Tracking ID is unique, return it
      return newTrackingId;
    }
    
    // If it exists, increment and try again
    attempts++;
    console.warn(`Tracking ID ${newTrackingId} already exists, trying next number...`);
  }
  
  // Fallback: use timestamp-based ID if we can't find a unique sequential ID
  const timestamp = Date.now();
  const fallbackId = `POST${String(timestamp).slice(-8)}`;
  console.warn(`Using fallback tracking ID: ${fallbackId}`);
  return fallbackId;
}

module.exports = generateTrackingId;


