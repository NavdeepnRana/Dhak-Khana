import React from 'react';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="py-5 bg-gradient"
      style={{ background: 'linear-gradient(120deg, #b71c1c, #f57f17)' }}
    >
      <div className="container text-dark">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="badge bg-dark text-white text-uppercase mb-3">Trusted Since 1854</span>
            <h1 className="display-5 fw-bold text-dark">Delivering Letters, Dreams & Digital Bharat</h1>
            <p className="lead mt-3 mb-4 text-dark">
              From Speed Post to Savings, Dak Khana Post brings every government service, financial product, and eCommerce
              parcel to your doorstep.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                Open Savings Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Track & Manage Parcels
              </Link>
            </div>
            <div className="d-flex gap-4 mt-4 flex-wrap">
              <HeroStat icon={Truck} label="PIN codes covered" value="1.56 Lakh+" />
              <HeroStat icon={ShieldCheck} label="open saving account track and manage parcel" value="36 Crore+" />
            </div>
          </div>
          <div className="col-lg-5">
            <div className="bg-white text-dark rounded-4 shadow-lg p-4">
              <h3 className="fw-semibold">Why citizens trust us</h3>
              <ul className="list-unstyled mt-3 mb-0">
                <li className="d-flex gap-3 py-2">
                  <span className="badge bg-danger rounded-pill mt-1">1</span>
                  Doorstep banking, insurance & citizen services through 1.5 lakh+ Gramin Dak Sevaks.
                </li>
                <li className="d-flex gap-3 py-2">
                  <span className="badge bg-warning rounded-pill mt-1">2</span>
                  Fast & insured logistics network for businesses, startups, & MSMEs.
                </li>
                <li className="d-flex gap-3 py-2">
                  <span className="badge bg-success rounded-pill mt-1">3</span>
                  Secure digital identity, Aadhaar, and trusted third-party verification hub.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div>
      {value && <div className="fw-bold fs-3 text-dark">{value}</div>}
      <div className="text-dark d-flex align-items-center gap-2">
        {Icon && <Icon size={16} />}
        {label}
      </div>
    </div>
  );
}

