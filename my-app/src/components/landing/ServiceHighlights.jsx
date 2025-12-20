import React from 'react';
import { Package, Shield, ShoppingBag, Sparkles, Stamp, Umbrella, Wallet, Zap } from 'lucide-react';

const fallbackIcons = [Shield, ShoppingBag, Sparkles];

export default function ServiceHighlights({ services = [] }) {
  return (
    <section id="services" className="py-5 bg-light">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">Citizen-first services</p>
            <h2 className="fw-bold">Everything a modern post office should offer</h2>
          </div>
          <a href="#offices" className="btn btn-outline-danger">
            Visit nearest office
          </a>
        </div>
        <div className="row g-4">
          {services.map((service, idx) => (
            <div className="col-md-4" key={service.id}>
              <ServiceCard service={service} iconIndex={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, iconIndex }) {
  const Icon = iconMap[service.icon] || fallbackIcons[iconIndex % fallbackIcons.length];
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="bg-danger-subtle text-danger rounded-circle p-3">
            <Icon size={24} />
          </div>
          <div>
            <h5 className="mb-1">{service.title}</h5>
            <small className="text-muted">Avg TAT: {service.turnaround}</small>
          </div>
        </div>
        <p className="text-muted">{service.description}</p>
        <button className="btn btn-link p-0 text-decoration-none">Explore plans →</button>
      </div>
    </div>
  );
}

const iconMap = {
  zap: Zap,
  shield: Shield,
  package: Package,
  wallet: Wallet,
  umbrella: Umbrella,
  stamp: Stamp,
};

