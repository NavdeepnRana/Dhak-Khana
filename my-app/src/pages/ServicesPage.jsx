import React from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNavbar from '../components/layout/SiteNavbar';
import SiteFooter from '../components/layout/SiteFooter';
import { Package, Zap, Shield, Clock, Weight, DollarSign, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const services = [
  {
    id: 'speed-post',
    title: 'Speed Post',
    description: 'Nationwide express service with end-to-end online tracking and doorstep pickup.',
    icon: Zap,
    turnaround: '1-3 days',
    basePrice: 60,
    pricePerKg: 40,
    maxWeight: 35,
    weightUnit: 'kg',
  },
  {
    id: 'registered-post',
    title: 'Registered Post',
    description: 'Secure delivery with recipient signature, legal admissibility, and indemnity coverage.',
    icon: Shield,
    turnaround: '3-5 days',
    basePrice: 45,
    pricePerKg: 25,
    maxWeight: 4,
    weightUnit: 'kg',
  },
  {
    id: 'parcel',
    title: 'Insured Parcel',
    description: 'Ship gifts, merchandise, or samples with optional insurance up to ₹5 lakh.',
    icon: Package,
    turnaround: '4-7 days',
    basePrice: 70,
    pricePerKg: 50,
    maxWeight: 20,
    weightUnit: 'kg',
  },
];

export default function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBookNow = (serviceId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/dashboard/customer?action=book');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <SiteNavbar />
      <main className="flex-grow-1">
        <section className="bg-danger text-white py-5">
          <div className="container">
            <h1 className="display-5 fw-bold mb-3">Shipping Services</h1>
            <p className="lead">Choose the perfect shipping service for your needs</p>
          </div>
        </section>

        <section className="container py-5">
          <div className="row g-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="bg-danger-subtle text-danger rounded-circle p-3">
                          <Icon size={24} />
                        </div>
                        <div>
                          <h5 className="mb-1 fw-bold">{service.title}</h5>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <Clock size={14} />
                            {service.turnaround}
                          </small>
                        </div>
                      </div>
                      <p className="text-muted mb-3">{service.description}</p>
                      
                      <div className="border-top pt-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <DollarSign size={14} />
                            Base Price:
                          </span>
                          <strong>₹{service.basePrice}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <DollarSign size={14} />
                            Per {service.weightUnit}:
                          </span>
                          <strong>₹{service.pricePerKg}</strong>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted small d-flex align-items-center gap-1">
                            <Weight size={14} />
                            Max Weight:
                          </span>
                          <strong>{service.maxWeight} {service.weightUnit}</strong>
                        </div>
                      </div>

                      <button
                        className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleBookNow(service.id)}
                      >
                        Book Now <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-light py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h2 className="fw-bold mb-4">How to Book a Shipment</h2>
                <ol className="list-group list-group-numbered">
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>View Services:</strong> Browse all available shipping services with pricing, delivery times, and weight limits above.
                  </li>
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>Book Online:</strong> Click "Book Now" on any service to create a shipping request. Fill in sender and receiver details, source & destination, service type, weight, declared value, payment method, and special instructions.
                  </li>
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>Status:</strong> Your booking request will be in "Pending Approval" status until admin verifies and approves it.
                  </li>
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>Payment:</strong> Pay online via UPI/Card or pay at counter. Admin will mark payment status manually.
                  </li>
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>Track:</strong> Once approved, use your tracking ID to track your shipment in real-time.
                  </li>
                  <li className="list-group-item border-0 bg-transparent px-0">
                    <strong>History:</strong> View all your booking requests and their status in your dashboard.
                  </li>
                </ol>
              </div>
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h5 className="fw-semibold mb-3">Need Help?</h5>
                    <p className="text-muted mb-3">
                      Our customer support team is available 24/7 to assist you with booking, tracking, and any queries.
                    </p>
                    <div className="d-flex gap-2">
                      <a href="/contact" className="btn btn-outline-danger">
                        Contact Support
                      </a>
                      <a href="/#track" className="btn btn-outline-primary">
                        Track Shipment
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


