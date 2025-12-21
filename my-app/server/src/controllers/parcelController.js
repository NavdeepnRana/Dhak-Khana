const { validationResult } = require('express-validator');
const Parcel = require('../models/Parcel');
const generateTrackingId = require('../utils/generateTrackingId');
const generateRequestId = require('../utils/generateRequestId');
const nodemailer = require('nodemailer');

const STATUS_OPTIONS = [
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
];

const serviceMeta = {
  'Speed Post': { eta: 2, base: 60, perKg: 40 },
  'Registered Post': { eta: 4, base: 45, perKg: 25 },
  Parcel: { eta: 6, base: 70, perKg: 50 },
  Logistics: { eta: 5, base: 90, perKg: 65 },
  'Money Order': { eta: 3, base: 30, perKg: 10 },
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
const calculateCost = (serviceType, weightKg, options = {}) => {
  const meta = serviceMeta[serviceType] || serviceMeta['Speed Post'];
  const weight = Number(weightKg || 0);
  
  if (weight <= 0) return 0;
  
  // Base price
  let total = meta.base;
  
  // Weight-based charge
  total += meta.perKg * weight;
  
  // Weight slab charge
  total += getWeightSlabCharge(weight);
  
  // Zone/distance charge
  const zone = calculateZone(options.sourcePincode, options.destinationPincode);
  total += zoneCharges[zone] || zoneCharges.sameState;
  
  // Optional services
  if (options.codAmount && Number(options.codAmount) > 0) {
    total += Number(options.codAmount) * optionalServicesCharges.cod;
  }
  
  if (options.insurance) {
    // Insurance is 1% of base + weight charge (simplified)
    const baseValue = meta.base + (meta.perKg * weight);
    total += baseValue * optionalServicesCharges.insurance;
  }
  
  if (options.otpDelivery) {
    total += optionalServicesCharges.otpDelivery;
  }
  
  return Math.round(total);
};

const getExpectedDeliveryLabel = (serviceType, pickupDate) => {
  const meta = serviceMeta[serviceType] || serviceMeta['Speed Post'];
  const etaDays = meta.eta;
  const base = pickupDate ? new Date(pickupDate) : new Date();
  base.setDate(base.getDate() + etaDays);
  return base.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

async function getParcels(req, res) {
  const parcels = await Parcel.find()
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(parcels);
}

async function getMyParcels(req, res) {
  const parcels = await Parcel.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(parcels);
}

async function getAssignedParcels(req, res) {
  // Delivery agents fetch only their assigned shipments; admins can filter by agent via query
  // For agents, use their fullName from the user object (set during agent login)
  const agentName = req.query.agent || req.user.name || req.user.fullName;
  const query = { assignedAgent: agentName };
  const today = req.query.today === 'true';

  if (today) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    query.pickupDate = { $gte: start, $lte: end };
  }

  const parcels = await Parcel.find(query).sort({ createdAt: -1 });
  res.json(parcels);
}

async function createParcel(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const requestId = await generateRequestId();
    const trackingId = await generateTrackingId(); // Admin bookings get tracking ID immediately
    const serviceType = req.body.serviceType || 'Speed Post';
    const pickupDate = req.body.pickupDate ? new Date(req.body.pickupDate) : undefined;
    const weightKg = Number(req.body.weightKg);

    // Calculate price using comprehensive formula
    const priceOptions = {
      sourcePincode: req.body.sourcePincode,
      destinationPincode: req.body.destinationPincode,
      codAmount: req.body.codAmount,
      insurance: req.body.insurance === true || req.body.insurance === 'true',
      otpDelivery: req.body.otpDelivery === true || req.body.otpDelivery === 'true',
    };
    const calculatedCost = req.body.costInr || calculateCost(serviceType, weightKg, priceOptions);

    const parcel = await Parcel.create({
      requestId,
      trackingId, // Admin creates with tracking ID immediately
      owner: req.body.ownerId || req.user?.id || null, // Link to customer if available
      serviceType,
      packageType: req.body.packageType || 'Document',
      pickupMode: req.body.pickupMode || 'Pickup',
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail,
      senderPhone: req.body.senderPhone,
      receiverName: req.body.receiverName,
      receiverPhone: req.body.receiverPhone,
      sourceCity: req.body.sourceCity,
      sourcePincode: req.body.sourcePincode,
      destinationCity: req.body.destinationCity,
      destinationPincode: req.body.destinationPincode,
      pickupDate,
      pickupSlot: req.body.pickupSlot,
      assignedAgent: req.body.assignedAgent,
      postOfficeCenter: req.body.postOfficeCenter,
      weightKg,
      costInr: calculatedCost,
      codAmount: req.body.codAmount ? Number(req.body.codAmount) : undefined,
      insurance: priceOptions.insurance,
      otpDelivery: priceOptions.otpDelivery,
      paymentMethod: req.body.paymentMethod || 'Cash',
      expectedDelivery: req.body.expectedDelivery || getExpectedDeliveryLabel(serviceType, pickupDate),
      status: req.user?.role === 'admin' ? 'Booked' : 'Pending Approval', // Admin creates as Booked, customers as Pending Approval
      notes: req.body.notes,
    });

    // Send email with tracking ID if admin created booking and email is provided
    if (req.user?.role === 'admin' && req.body.senderEmail) {
      try {
        await sendTrackingIdEmail(parcel);
      } catch (emailError) {
        console.error('Failed to send tracking ID email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({ 
      message: req.user?.role === 'admin' 
        ? 'Shipment booked successfully!' 
        : 'Booking request submitted! Waiting for admin approval.',
      parcel,
      trackingId: parcel.trackingId 
    });
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(500).json({ message: 'Failed to create shipment. Please try again.' });
  }
}

async function createBookingRequest(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const requestId = await generateRequestId();
    const serviceType = req.body.serviceType || 'Speed Post';
    const pickupDate = req.body.pickupDate ? new Date(req.body.pickupDate) : undefined;
    const weightKg = Number(req.body.weightKg);

    // Calculate price using comprehensive formula
    const priceOptions = {
      sourcePincode: req.body.sourcePincode,
      destinationPincode: req.body.destinationPincode,
      codAmount: req.body.codAmount,
      insurance: req.body.insurance === true || req.body.insurance === 'true',
      otpDelivery: req.body.otpDelivery === true || req.body.otpDelivery === 'true',
    };
    const calculatedCost = req.body.costInr || calculateCost(serviceType, weightKg, priceOptions);

    const parcel = await Parcel.create({
      requestId, // Generate Request ID immediately
      // trackingId will be null until admin approves
      owner: req.user.id, // Always link to the logged-in customer
      serviceType,
      packageType: req.body.packageType || 'Document',
      pickupMode: req.body.pickupMode || 'Pickup',
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail || req.user.email,
      senderPhone: req.body.senderPhone || req.user.phone,
      receiverName: req.body.receiverName,
      receiverPhone: req.body.receiverPhone,
      sourceCity: req.body.sourceCity,
      sourcePincode: req.body.sourcePincode,
      destinationCity: req.body.destinationCity,
      destinationPincode: req.body.destinationPincode,
      pickupDate,
      pickupSlot: req.body.pickupSlot, // e.g., "9-11 AM"
      assignedAgent: req.body.assignedAgent,
      postOfficeCenter: req.body.postOfficeCenter,
      weightKg,
      costInr: calculatedCost,
      codAmount: req.body.codAmount ? Number(req.body.codAmount) : undefined,
      insurance: priceOptions.insurance,
      otpDelivery: priceOptions.otpDelivery,
      paymentMethod: req.body.paymentMethod || 'Cash',
      expectedDelivery: req.body.expectedDelivery || getExpectedDeliveryLabel(serviceType, pickupDate),
      status: 'Pending Approval', // Customer requests always start as Pending Approval
      notes: req.body.notes,
    });

    res.status(201).json({ 
      message: 'Booking request submitted successfully! Your request is pending admin approval.',
      parcel,
      requestId: parcel.requestId 
    });
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({ message: 'Failed to submit booking request. Please try again.' });
  }
}

async function cancelBookingRequest(req, res) {
  const { id } = req.params;
  
  try {
    const parcel = await Parcel.findById(id);
    if (!parcel) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Only allow cancellation if status is Pending Approval and user owns it
    if (parcel.status !== 'Pending Approval') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled' });
    }

    if (parcel.owner?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own requests' });
    }

    const updatedParcel = await Parcel.findByIdAndUpdate(
      id,
      { status: 'Cancelled by User' },
      { new: true }
    );

    res.json({ 
      message: 'Booking request cancelled successfully',
      parcel: updatedParcel 
    });
  } catch (error) {
    console.error('Error cancelling booking request:', error);
    res.status(500).json({ message: 'Failed to cancel booking request' });
  }
}

async function trackParcel(req, res) {
  const { trackingId } = req.params;
  const parcel = await Parcel.findOne({ trackingId: trackingId.toUpperCase() }).populate('owner', 'name email');
  if (!parcel) {
    return res.status(404).json({ message: 'Parcel not found' });
  }
  res.json({ parcel });
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, notes, proofUrl } = req.body;
  
  if (!STATUS_OPTIONS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updateData = { status };
  if (notes) {
    updateData.notes = notes;
  }
  if (proofUrl) {
    updateData.proofUrl = proofUrl;
  }

  // If admin is approving (changing from Pending Approval to Booked), generate tracking ID
  const parcel = await Parcel.findById(id);
  if (!parcel) {
    return res.status(404).json({ message: 'Parcel not found' });
  }

  // Restrict agent transitions to delivery lifecycle steps
  if (req.user.role === 'agent') {
    const agentAllowed = [
      'Picked Up',
      'Arrived at Hub',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Failed Attempt',
      'Returned',
    ];
    if (!agentAllowed.includes(status)) {
      return res.status(403).json({ message: 'Agents cannot set this status' });
    }
  }

  if (parcel.status === 'Pending Approval' && status === 'Booked' && !parcel.trackingId) {
    const trackingId = await generateTrackingId();
    updateData.trackingId = trackingId;
    
    // Send email with tracking ID
    if (parcel.senderEmail) {
      try {
        await sendTrackingIdEmail({ ...parcel.toObject(), trackingId });
      } catch (emailError) {
        console.error('Failed to send tracking ID email:', emailError);
      }
    }
  }

  const updatedParcel = await Parcel.findByIdAndUpdate(id, updateData, { new: true });
  res.json({ message: 'Shipment status updated successfully', parcel: updatedParcel });
}

async function updateParcel(req, res) {
  const { id } = req.params;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updateData = { ...req.body };
    
    // Convert date strings to Date objects
    if (updateData.pickupDate) {
      updateData.pickupDate = new Date(updateData.pickupDate);
    }
    
    // Convert weight to number
    if (updateData.weightKg) {
      updateData.weightKg = Number(updateData.weightKg);
    }
    
    // Recalculate cost if relevant fields changed
    const existingParcel = await Parcel.findById(id);
    if (!existingParcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    const shouldRecalculate = updateData.serviceType || updateData.weightKg || 
                               updateData.sourcePincode || updateData.destinationPincode ||
                               updateData.codAmount !== undefined || updateData.insurance !== undefined || 
                               updateData.otpDelivery !== undefined;
    
    if (shouldRecalculate) {
      const serviceType = updateData.serviceType || existingParcel.serviceType;
      const weightKg = updateData.weightKg || existingParcel.weightKg;
      const priceOptions = {
        sourcePincode: updateData.sourcePincode || existingParcel.sourcePincode,
        destinationPincode: updateData.destinationPincode || existingParcel.destinationPincode,
        codAmount: updateData.codAmount !== undefined ? updateData.codAmount : existingParcel.codAmount,
        insurance: updateData.insurance !== undefined ? updateData.insurance : existingParcel.insurance,
        otpDelivery: updateData.otpDelivery !== undefined ? updateData.otpDelivery : existingParcel.otpDelivery,
      };
      updateData.costInr = calculateCost(serviceType, weightKg, priceOptions);
    }

    const parcel = await Parcel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    res.json({ message: 'Shipment updated successfully', parcel });
  } catch (error) {
    console.error('Error updating parcel:', error);
    res.status(500).json({ message: 'Failed to update shipment' });
  }
}

async function sendTrackingIdEmail(parcel) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured. Tracking ID email not sent.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track?q=${parcel.trackingId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parcel.senderEmail,
    subject: `Your Dak Khana Shipment Tracking ID: ${parcel.trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Shipment Booked Successfully!</h2>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; border-top: none;">
          <p>Dear ${parcel.senderName},</p>
          <p>Your shipment has been booked successfully. Please find the details below:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">Tracking ID: ${parcel.trackingId}</h3>
            <p style="margin: 5px 0;"><strong>Service Type:</strong> ${parcel.serviceType}</p>
            <p style="margin: 5px 0;"><strong>From:</strong> ${parcel.sourceCity}</p>
            <p style="margin: 5px 0;"><strong>To:</strong> ${parcel.destinationCity}</p>
            <p style="margin: 5px 0;"><strong>Receiver:</strong> ${parcel.receiverName}</p>
            <p style="margin: 5px 0;"><strong>Weight:</strong> ${parcel.weightKg} kg</p>
            <p style="margin: 5px 0;"><strong>Estimated Cost:</strong> ₹${parcel.costInr}</p>
            <p style="margin: 5px 0;"><strong>Expected Delivery:</strong> ${parcel.expectedDelivery || 'TBD'}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${parcel.status}</p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${trackingUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Shipment
            </a>
          </div>

          <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
            You can track your shipment anytime using the tracking ID above or by visiting our website.
          </p>
        </div>
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6; border-top: none; text-align: center;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">
            This is an automated notification from Dak Khana Postal Services
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Tracking ID email sent to ${parcel.senderEmail} for tracking ID: ${parcel.trackingId}`);
}

async function deleteParcel(req, res) {
  const { id } = req.params;
  try {
    const parcel = await Parcel.findByIdAndDelete(id);
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting parcel:', error);
    res.status(500).json({ message: 'Failed to delete shipment' });
  }
}

module.exports = {
  getParcels,
  getMyParcels,
  getAssignedParcels,
  createParcel,
  createBookingRequest,
  trackParcel,
  updateStatus,
  updateParcel,
  cancelBookingRequest,
  deleteParcel,
};


