import React from 'react';
import { STATUS_OPTIONS, getStatusBadge, getStatusIcon } from '../../utils/statusHelpers';

export default function ParcelsTable({ parcels, onStatusChange, isUpdating, mode = 'admin', onCancel }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 mb-0">{mode === 'admin' ? 'All Parcels' : 'My Shipments'}</h2>
          <span className="badge bg-secondary">{parcels.length} records</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Request ID</th>
                <th>Tracking ID</th>
                <th>Service</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Route</th>
                {mode === 'admin' && <th>Customer</th>}
                <th>Weight (kg)</th>
                <th>Charges</th>
                <th>Pickup Slot</th>
                <th>Expected Delivery</th>
                <th>Status</th>
                {mode === 'customer' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <ParcelRow
                  key={parcel.id}
                  parcel={parcel}
                  onStatusChange={onStatusChange}
                  isUpdating={isUpdating}
                  allowStatusChange={mode === 'admin'}
                  onCancel={onCancel}
                  mode={mode}
                />
              ))}
            </tbody>
          </table>
          {!parcels.length && <p className="text-center text-muted py-4">No parcels registered yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ParcelRow({ parcel, onStatusChange, isUpdating, allowStatusChange, onCancel, mode }) {
  const StatusIcon = getStatusIcon(parcel.status);

  return (
    <tr>
      <td className="fw-semibold text-info">{parcel.requestId || 'N/A'}</td>
      <td className="fw-semibold text-primary">
        {parcel.trackingId || <span className="text-muted">— (Pending)</span>}
      </td>
      <td>
        <div className="fw-semibold">{parcel.serviceType}</div>
        <small className="text-muted">{parcel.packageType}</small>
      </td>
      <td>{parcel.senderName}</td>
      <td>{parcel.receiverName}</td>
      <td>
        {parcel.sourceCity} → {parcel.destinationCity}
      </td>
      {allowStatusChange && (
        <td>
          {parcel.owner?.name ? (
            <>
              <div>{parcel.owner.name}</div>
              <small className="text-muted">{parcel.owner.email}</small>
            </>
          ) : (
            <span className="text-muted">Counter booking</span>
          )}
        </td>
      )}
      <td>{parcel.weightKg}</td>
      <td>
        ₹{parcel.costInr}
        <br />
        <small className="text-muted">{parcel.paymentMethod}</small>
      </td>
      <td>
        {parcel.pickupSlot && parcel.pickupDate ? (
          <>
            {parcel.pickupSlot}
            <br />
            <small className="text-muted">
              {new Date(parcel.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </small>
          </>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>{parcel.expectedDelivery}</td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge bg-${getStatusBadge(parcel.status)} d-flex align-items-center gap-1`}>
            <StatusIcon size={14} />
            {parcel.status}
          </span>
          {allowStatusChange && (
            <select
              className="form-select form-select-sm"
              value={parcel.status}
              disabled={isUpdating}
              onChange={(e) => onStatusChange(parcel.id, e.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
        </div>
      </td>
      {mode === 'customer' && (
        <td>
          {parcel.status === 'Pending Approval' && (
            <button
              className="btn btn-sm primary"
              onClick={() => onCancel && onCancel(parcel.id)}
              disabled={isUpdating}
            >
              Cancel Request
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

