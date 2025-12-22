import React, { useState } from 'react';
import { Search } from 'lucide-react';
import TrackResult from './TrackResult';

export default function TrackParcel({ onTrack, result, isLoading, error, variant = 'card' }) {
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingId) return;
    onTrack(trackingId.trim().toUpperCase());
  };

  return (
    <div className={variant === 'card' ? 'card shadow-sm border-0' : ''} id="track">
      <div className={variant === 'card' ? 'card-body p-4' : ''}>
        <h2 className="h4 mb-4">Track Your Consignment</h2>
        <form onSubmit={handleSubmit} className="row g-2 g-md-3 align-items-center">
          <div className="col-md-8">
            <input
              className="form-control form-control-lg"
              placeholder="Enter Tracking ID (e.g. PKG001234)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-grid">
            <button type="submit" className="btn danger btn-lg" disabled={isLoading}>
              <Search size={18} className="me-2" />
              {isLoading ? 'Searching...' : 'Track Parcel'}
            </button>
          </div>
        </form>
        {error && <p className="text-danger mt-3">{error}</p>}
        {result && !error && <TrackResult parcel={result} />}
      </div>
    </div>
  );
}

