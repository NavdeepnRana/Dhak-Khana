import React from 'react';
import { MapPin, Phone } from 'lucide-react';

export default function OfficeLocator({ offices = [] }) {
  if (!offices.length) return null;
  return (
    <section id="offices" className="py-5 bg-light">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <p className="text-uppercase small text-muted mb-1">Visit us</p>
            <h2 className="fw-bold">Head post offices & booking centers</h2>
          </div>
          <button className="btn btn-outline-dark">View all 1.5 lakh branches</button>
        </div>
        <div className="row g-3">
          {offices.map((office) => (
            <div className="col-lg-3 col-md-6" key={office.id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="fw-semibold">{office.name}</h5>
                  <p className="text-muted small d-flex gap-2">
                    <MapPin size={16} className="text-danger mt-1" />
                    {office.address}
                  </p>
                  <p className="text-muted small d-flex gap-2">
                    <Phone size={16} className="text-danger mt-1" />
                    {office.contact}
                  </p>
                  <span className="badge bg-danger-subtle text-danger">{office.timings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

