// Service metadata
const serviceMeta = {
  'Speed Post': { base: 60, perKg: 40, eta: 2 },
  'Registered Post': { base: 45, perKg: 25, eta: 4 },
  'Parcel': { base: 70, perKg: 50, eta: 6 },
  'Logistics': { base: 90, perKg: 65, eta: 5 },
  'Money Order': { base: 30, perKg: 10, eta: 3 },
};

// Zone charges based on distance (same city, same state, different state)
const zoneCharges = {
  sameCity: 0,      // Same pincode area
  sameState: 50,     // Different city, same state
  differentState: 150, // Different state
};

// Optional services charges
const optionalServicesCharges = {
  cod: 0.02,        // 2% of COD amount
  insurance: 0.01,  // 1% of declared value (if applicable)
  otpDelivery: 20,  // Fixed charge
};

// Weight slab charges (additional charges for heavier parcels)
const getWeightSlabCharge = (weight) => {
  if (weight <= 0.5) return 0;
  if (weight <= 1) return 10;
  if (weight <= 2) return 25;
  if (weight <= 5) return 50;
  return 100; // Above 5kg
};

// Calculate zone based on pincodes
const calculateZone = (sourcePincode, destinationPincode) => {
  if (!sourcePincode || !destinationPincode) return 'sameState'; // Default
  
  // Extract first 2 digits for state code (simplified logic)
  const sourceState = String(sourcePincode).substring(0, 2);
  const destState = String(destinationPincode).substring(0, 2);
  
  if (String(sourcePincode) === String(destinationPincode)) return 'sameCity';
  if (sourceState === destState) return 'sameState';
  return 'differentState';
};

// Comprehensive price calculation
export const calculatePrice = (formData) => {
  if (!formData.weightKg || formData.weightKg <= 0) return null;
  
  const meta = serviceMeta[formData.serviceType] || serviceMeta['Speed Post'];
  const weight = Number(formData.weightKg);
  
  // Base price
  let total = meta.base;
  
  // Weight-based charge
  total += meta.perKg * weight;
  
  // Weight slab charge
  total += getWeightSlabCharge(weight);
  
  // Zone/distance charge
  const zone = calculateZone(formData.sourcePincode, formData.destinationPincode);
  total += zoneCharges[zone] || zoneCharges.sameState;
  
  // Optional services
  if (formData.codAmount && Number(formData.codAmount) > 0) {
    total += Number(formData.codAmount) * optionalServicesCharges.cod;
  }
  
  if (formData.insurance) {
    // Insurance is 1% of base + weight charge (simplified)
    const baseValue = meta.base + (meta.perKg * weight);
    total += baseValue * optionalServicesCharges.insurance;
  }
  
  if (formData.otpDelivery) {
    total += optionalServicesCharges.otpDelivery;
  }
  
  return Math.round(total);
};

export const getServiceMeta = (serviceType) => {
  return serviceMeta[serviceType] || serviceMeta['Speed Post'];
};

