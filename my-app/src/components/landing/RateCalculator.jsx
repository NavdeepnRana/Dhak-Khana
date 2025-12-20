import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const zones = ['Local', 'Metro', 'Rest of India'];
const services = ['Speed Post', 'Registered Post', 'Parcel'];

export default function RateCalculator({ rateChart = [] }) {
  const [form, setForm] = useState({ serviceType: 'Speed Post', zone: 'Local', weight: 1 });
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const row = rateChart.find((r) => r.zone === form.zone) || rateChart[0];
    if (!row) return null;
    const weight = Math.max(0, Number(form.weight));
    const additional = Math.max(0, weight - 1);
    const cost = row.upto1kg + additional * row.additionalPerKg;
    return {
      cost,
      days: row.avgDays + (form.serviceType === 'Registered Post' ? 1 : 0),
    };
  }, [form, rateChart]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRequestPickup = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    if (user?.role === 'customer') {
      // Redirect to customer dashboard or register parcel page
      navigate('/dashboard/customer?action=book');
    } else {
      // For admin or other roles, show message
      alert('Please use the admin dashboard to book shipments.');
    }
  };

  return (
    <section className="py-5" id="book">
      <div className="container">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <h2 className="fw-bold d-flex align-items-center gap-2">
              <Calculator /> Estimate tariff & delivery
            </h2>
            <p className="text-muted">
              Plan your shipment cost instantly. Rates are indicative; final tariff depends on declared value and optional
              insurance.
            </p>
            <ul className="list-unstyled">
              <li>• Doorstep pickup available in 800+ cities</li>
              <li>• COD support for eCommerce merchants</li>
              <li>• Additional 5% rebate for India Post Business account users</li>
            </ul>
          </div>
          <div className="col-lg-6">
            <div className="card shadow border-0">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Service type</label>
                    <select name="serviceType" className="form-select" value={form.serviceType} onChange={handleChange}>
                      {services.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Zone</label>
                    <select name="zone" className="form-select" value={form.zone} onChange={handleChange}>
                      {zones.map((z) => (
                        <option key={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      name="weight"
                      className="form-control"
                      value={form.weight}
                      onChange={handleChange}
                    />
                  </div>
                  {summary && (
                    <div className="col-12">
                      <div className="alert alert-primary">
                        <div className="fw-bold fs-4">Approx. ₹{summary.cost}</div>
                        <div className="text-muted">Delivery in {summary.days} business days</div>
                      </div>
                    </div>
                  )}
                  <div className="col-12">
                    <button 
                      className="btn btn-danger w-100" 
                      onClick={handleRequestPickup}
                    >
                      {isAuthenticated ? 'Request Pickup Slot' : 'Login to Request Pickup Slot'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

