import React from 'react';
import { Github, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const SOCIAL_LINKS = [
  { label: 'Instagram', Icon: Instagram, url: 'https://www.instagram.com/navdeeprana1129/' },
  { label: 'GitHub', Icon: Github, url: 'https://github.com/NavdeepnRana' },
  { label: 'LinkedIn', Icon: Linkedin, url: 'https://www.linkedin.com/in/navdeeprana123/' },
];

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
];

const CONTACT_POINTS = [
  { label: 'Head Office', value: 'Dak Bhavan, Sansad Marg, New Delhi - 110001', Icon: MapPin },
  { label: 'Mobile', value: '+91 98765 43210', Icon: Phone },
  { label: 'Email', value: 'hello@dakkhana.in', Icon: Mail },
];

export default function SiteFooter() {
  return (
    <footer className="bg-dark text-light mt-auto" id="contact">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <p className="text-uppercase small text-white-50 mb-2">Dak Khana</p>
            <h5 className="fw-bold text-white">Delivering trust across Bharat</h5>
            <p className="text-white-50 small mb-4">
              A contemporary digital avatar of Dak Seva. Track parcels, manage bookings, and stay close to government
              services from one dashboard.
            </p>
            <div className="d-flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ label, Icon, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light btn-sm rounded-pill d-flex align-items-center gap-2"
                >
                  <Icon size={16} />
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div className="col-md-4 col-lg-3 ms-lg-auto">
            <h6 className="text-uppercase small text-white-50">Quick links</h6>
            <ul className="list-unstyled mt-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href} className="mb-2">
                  <a href={link.href} className="text-decoration-none text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-5 col-lg-4">
            <h6 className="text-uppercase small text-white-50">Contact</h6>
            <ul className="list-unstyled mt-3">
              {CONTACT_POINTS.map(({ label, value, Icon }) => (
                <li key={label} className="d-flex gap-3 align-items-start mb-2">
                  <span className="bg-light bg-opacity-10 rounded-circle p-2 text-white">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="mb-0 small text-uppercase text-white-50">{label}</p>
                    <p className="mb-0 text-white">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-black text-center py-3 small text-white-50">
        © {new Date().getFullYear()} Dak Khana • Made for the Dak Khana community
      </div>
    </footer>
  );
}

