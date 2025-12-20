import React from 'react';
import { Package, Search, Send, Table } from 'lucide-react';

const tabConfig = [
  { id: 'track', label: 'Track Parcel', Icon: Search },
  { id: 'register', label: 'Register Parcel', Icon: Send },
  { id: 'list', label: 'Parcels List', Icon: Table },
];

export default function DashboardTabs({ activeTab, onChange }) {
  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-body p-2 d-flex gap-2 flex-wrap">
          {tabConfig.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${
                activeTab === id ? 'btn-primary' : 'btn-outline-primary'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

