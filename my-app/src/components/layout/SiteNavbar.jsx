import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Home', hash: '#hero', route: null },
  { label: 'About Us', hash: '#about', route: null },
  { label: 'Services', hash: '#services', route: '/services' },
  { label: 'Contact', hash: '#contact', route: '/contact' },
];

export default function SiteNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnchorClick = (item) => {
    // If item has a route, navigate to it
    if (item.route) {
      navigate(item.route);
      return;
    }
    // Otherwise, handle hash navigation
    if (pathname !== '/') {
      navigate(`/${item.hash}`);
      return;
    }
    const el = document.querySelector(item.hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="shadow-sm bg-white position-sticky top-0 z-3">
      <nav className="container py-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div className="bg-danger text-white rounded-circle p-2">
            <Package size={26} />
          </div>
          <div>
            <div className="fw-bold text-dark text-uppercase">Dak Khana</div>
            <div className="small text-muted">Modern postal experience</div>
          </div>
        </Link>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.hash || item.route}
              type="button"
              className="btn btn-link text-decoration-none text-muted fw-medium p-0"
              onClick={() => handleAnchorClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-muted small text-end">
                Logged in as <br />
                <strong>{user?.name}</strong>
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
              <Link to="/dashboard/customer" className="btn btn-primary btn-sm">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

