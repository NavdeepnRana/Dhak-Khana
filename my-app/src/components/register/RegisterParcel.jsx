import React, { useState, useMemo } from 'react';
import { Send, Calculator, Clock, MapPin } from 'lucide-react';
import { calculatePrice, getServiceMeta } from '../../utils/priceCalculator';
import NearbyPostOfficeMap from '../maps/NearbyPostOfficeMap';
import LocationAutocomplete from '../maps/LocationAutocomplete';

const initialForm = {
  senderName: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: '',
  sourceCity: '',
  sourcePincode: '',
  destinationCity: '',
  destinationPincode: '',
  pickupDate: '',
  pickupSlot: '',
  serviceType: 'Speed Post',
  packageType: 'Document',
  weightKg: '',
  paymentMethod: 'Cash',
  codAmount: '',
  insurance: false,
  otpDelivery: false,
  notes: '',
};


const pickupSlots = [
  '9-11 AM',
  '11 AM-1 PM',
  '1-3 PM',
  '3-5 PM',
  '5-7 PM',
];

const serviceOptions = ['Speed Post', 'Registered Post', 'Parcel', 'Logistics', 'Money Order'];
const packageOptions = ['Document', 'Parcel', 'Fragile', 'High Value'];
const paymentOptions = ['Cash', 'UPI', 'Net Banking', 'Card'];

export default function RegisterParcel({ onSubmit, isLoading, title = 'Book a Postal Article' }) {
  const [form, setForm] = useState(initialForm);
  const [showPostOfficeMap, setShowPostOfficeMap] = useState(false);
  const [selectedPostOffice, setSelectedPostOffice] = useState(null);

  const priceEstimate = useMemo(() => {
    const calculatedPrice = calculatePrice(form);
    if (!calculatedPrice) return null;
    const meta = getServiceMeta(form.serviceType);
    return { cost: calculatedPrice, eta: meta.eta };
  }, [form.serviceType, form.weightKg, form.sourcePincode, form.destinationPincode, form.codAmount, form.insurance, form.otpDelivery]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate final price before submission
    const finalPrice = calculatePrice(form);
    if (!finalPrice) {
      alert('Please enter weight to calculate price');
      return;
    }
    
    // Add calculated price and selected post office to form data
    const formDataWithPrice = {
      ...form,
      costInr: finalPrice,
      postOfficeCenter: selectedPostOffice?.code || form.postOfficeCenter || '',
    };
    
    onSubmit(formDataWithPrice, () => {
      setForm(initialForm);
      setSelectedPostOffice(null);
    });
  };

  const handleSelectOffice = (office) => {
    setSelectedPostOffice(office);
    setForm(prev => ({ ...prev, postOfficeCenter: office.code }));
  };

  return (
    <div className="card shadow-sm border-0" id="book">
      <div className="card-body p-4">
        <h2 className="h4 mb-1">{title}</h2>
        <p className="text-muted small mb-4">Get instant tracking ID & pay securely at the counter or via digital modes.</p>
        <form onSubmit={handleSubmit} className="row g-3">
          <Input label="Sender Name" name="senderName" value={form.senderName} onChange={handleChange} />
          <Input label="Sender Phone" name="senderPhone" value={form.senderPhone} onChange={handleChange} />
          <Input label="Receiver Name" name="receiverName" value={form.receiverName} onChange={handleChange} />
          <Input label="Receiver Phone" name="receiverPhone" value={form.receiverPhone} onChange={handleChange} />
          <div className="col-md-6">
            <label className="form-label">Source City</label>
            <LocationAutocomplete
              name="sourceCity"
              value={form.sourceCity}
              onChange={handleChange}
              placeholder="Enter source city"
              className="form-control"
              required
            />
          </div>
          <Input label="Source Pincode" name="sourcePincode" value={form.sourcePincode} onChange={handleChange} placeholder="e.g. 110001" />
          <div className="col-md-6">
            <label className="form-label">Destination City</label>
            <LocationAutocomplete
              name="destinationCity"
              value={form.destinationCity}
              onChange={handleChange}
              placeholder="Enter destination city"
              className="form-control"
              required
            />
          </div>
          <Input label="Destination Pincode" name="destinationPincode" value={form.destinationPincode} onChange={handleChange} placeholder="e.g. 400001" />
          <Select label="Service Type" name="serviceType" value={form.serviceType} onChange={handleChange} options={serviceOptions} />
          <Select label="Package Type" name="packageType" value={form.packageType} onChange={handleChange} options={packageOptions} />
          <Input
            label="Pickup / Drop Date"
            name="pickupDate"
            type="date"
            value={form.pickupDate}
            onChange={handleChange}
          />
          <div className="col-md-6">
            <label className="form-label">Pickup Slot (Optional)</label>
            <select
              className="form-select"
              name="pickupSlot"
              value={form.pickupSlot}
              onChange={handleChange}
            >
              <option value="">Select time slot</option>
              {pickupSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <Input label="Weight (kg)" name="weightKg" value={form.weightKg} onChange={handleChange} type="number" step="0.1" min="0.1" />
          
          {/* Optional Services */}
          {/* <div className="col-md-6">
            <label className="form-label">COD Amount (₹) - Optional</label>
            <input
              type="number"
              className="form-control"
              name="codAmount"
              value={form.codAmount}
              onChange={handleChange}
              placeholder="Enter COD amount if applicable"
              min="0"
            />
            <small className="text-muted">2% COD charge will be added</small>
          </div> */}
          
          <div className="col-md-6">
            <label className="form-label">Optional Services</label>
            <div className="d-flex flex-column gap-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="insurance"
                  id="insurance"
                  checked={form.insurance}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="insurance">
                  Insurance (1% of parcel value)
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="otpDelivery"
                  id="otpDelivery"
                  checked={form.otpDelivery}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="otpDelivery">
                  OTP Delivery (₹20 extra)
                </label>
              </div>
            </div>
          </div>
          
          {/* Price Display - Read Only */}
          {priceEstimate && (
            <div className="col-12">
              <div className="card bg-primary text-white border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Calculator size={20} />
                    <strong className="fs-5">Total Price</strong>
                  </div>
                  <div className="fw-bold fs-2 mb-2">₹{priceEstimate.cost}</div>
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={14} />
                    <small>Estimated delivery in ~{priceEstimate.eta} days</small>
                  </div>
                  <div className="mt-3 pt-3 border-top border-white border-opacity-25">
                    <small className="opacity-75">
                      Price includes: Base charge + Weight charge + Zone charge + Optional services
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Select
            label="Payment Method"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            options={paymentOptions}
          />
          
          {/* Post Office Selection */}
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label">Select Post Office (Optional)</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowPostOfficeMap(!showPostOfficeMap)}
              >
                <MapPin size={14} className="me-1" />
                {showPostOfficeMap ? 'Hide Map' : 'Find Nearby Post Offices'}
              </button>
            </div>
            {selectedPostOffice && (
              <div className="alert alert-info mb-2">
                <strong>Selected:</strong> {selectedPostOffice.name} ({selectedPostOffice.code}) - {selectedPostOffice.distance.toFixed(2)} km away
              </div>
            )}
            {showPostOfficeMap && (
              <div className="mb-3" style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                overflow: 'hidden',
                width: '100%',
                maxWidth: '100%'
              }}>
                <NearbyPostOfficeMap 
                  onSelectOffice={handleSelectOffice}
                  selectedOffice={selectedPostOffice}
                />
              </div>
            )}
          </div>

          <div className="col-12">
            <label className="form-label">Special Instructions</label>
            <textarea
              className="form-control"
              rows={3}
              name="notes"
              placeholder="e.g. Deliver after office hours, handle with care"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn primary d-flex align-items-center gap-2" disabled={isLoading}>
              <Send size={18} />
              {isLoading ? 'Booking...' : 'Generate Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = 'text', step }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        type={type}
        step={step}
        className="form-control"
        name={name}
        value={value}
        onChange={onChange}
        required={!['notes', 'pickupDate'].includes(name)}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <select className="form-select" name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}


