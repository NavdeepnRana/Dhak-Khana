import React from 'react';
import { Package } from 'lucide-react';

export default function Header({ admin, onLogout }) {
  return (
    <header className="bg-primary text-white shadow-sm">
      <div className="container py-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <Package size={40} />
          <div>
            <h1 className="h3 mb-1">Dakkhana Post Office</h1>
            <p className="mb-0 small text-white-50">Parcel tracking & administration</p>
          </div>
        </div>
        {admin && (
          <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2">
            <div className="text-white">
              <div className="fw-semibold">{admin.name || 'Admin'}</div>
              <div className="small text-white-50">{admin.email}</div>
            </div>
            <button className="btn btn-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

