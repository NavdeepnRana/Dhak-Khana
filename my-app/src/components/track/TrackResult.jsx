import React from 'react';
import { Calendar, DollarSign, MapPin, Package as PackageIcon, Phone, User } from 'lucide-react';
import { getStatusBadge, getStatusIcon } from '../../utils/statusHelpers';
import ParcelTrackingMap from '../maps/ParcelTrackingMap';

export default function TrackResult({ parcel }) {
  const StatusIcon = getStatusIcon(parcel.status);

  return (
    <div className="card bg-light mt-4 border-0">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>
            <div className="text-muted small">Tracking ID</div>
            <div className="h5 mb-0">{parcel.trackingId}</div>
            <small className="text-muted">Service: {parcel.serviceType}</small>
          </div>
          <span className={`badge bg-${getStatusBadge(parcel.status)} d-flex align-items-center gap-1 fs-6`}>
            <StatusIcon size={16} />
            {parcel.status}
          </span>
        </div>
        <div className="row g-4">
          <InfoCard label="Sender" value={`${parcel.senderName} (${parcel.senderPhone || 'NA'})`} icon={User} />
          <InfoCard label="Receiver" value={`${parcel.receiverName} (${parcel.receiverPhone || 'NA'})`} icon={Phone} />
          <InfoCard label="From" value={parcel.sourceCity} icon={MapPin} />
          <InfoCard label="To" value={parcel.destinationCity} icon={MapPin} />
          <InfoCard label="Weight" value={`${parcel.weightKg} kg`} icon={PackageIcon} />
          <InfoCard label="Payment" value={`${parcel.paymentMethod} • ₹${parcel.costInr}`} icon={DollarSign} />
          <InfoCard label="Booked on" value={new Date(parcel.createdAt).toLocaleString()} icon={Calendar} />
          <InfoCard label="Expected delivery" value={parcel.expectedDelivery} icon={Calendar} />
        </div>
        
        {/* Parcel Tracking Map */}
        <div className="mt-4">
          <h5 className="mb-3">📍 Parcel Location Tracking</h5>
          <ParcelTrackingMap parcel={parcel} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="d-flex align-items-center gap-3">
        <div className="bg-white rounded-circle p-2 shadow-sm">
          <Icon size={20} className="text-danger" />
        </div>
        <div>
          <div className="text-muted small">{label}</div>
          <div className="fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}


