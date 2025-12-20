import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteNavbar from '../components/layout/SiteNavbar';
import SiteFooter from '../components/layout/SiteFooter';
import CustomerAuthCard from '../components/auth/CustomerAuthCard';
import { loginCustomer, loginAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer'); // 'customer' or 'admin'
  const [loading, setLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  const handleCustomerLogin = async (payload) => {
    setLoading(true);
    try {
      const data = await loginCustomer(payload);
      login(data.token, data.user);
      navigate('/dashboard/customer', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid customer credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginAdmin(adminForm);
      login(data.token, data.user);
      navigate('/dashboard/admin', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <SiteNavbar />
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <p className="text-uppercase small text-danger mb-2">Welcome back</p>
              <h1 className="fw-bold mb-3">Sign in to Dhakkhana</h1>
              <p className="text-muted">
                Track parcels, manage bookings, download receipts, and unlock exclusive citizen services from a single
                screen. Your Dhakkhana ID powers every interaction with us.
              </p>
              <ul className="list-unstyled text-muted mt-4">
                <li>• Real-time shipment updates</li>
                <li>• Smart alerts for pickups & deliveries</li>
                <li>• Connected experience across web & mobile</li>
              </ul>
              <div className="mt-4">
                <p className="small text-muted mb-1">Need an account?</p>
                <Link to="/register" className="btn btn-outline-danger btn-sm">
                  Create Dhakkhana ID
                </Link>
              </div>
            </div>
            <div className="col-lg-7">
              {/* User Type Selector */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn flex-grow-1 ${userType === 'customer' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => setUserType('customer')}
                    >
                      <User size={18} className="me-2" />
                      Customer Login
                    </button>
                    <button
                      type="button"
                      className={`btn flex-grow-1 ${userType === 'admin' ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => setUserType('admin')}
                    >
                      <Shield size={18} className="me-2" />
                      Admin Login
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Login Form */}
              {userType === 'customer' && (
                <CustomerAuthCard onSubmit={handleCustomerLogin} isLoading={loading} />
              )}

              {/* Admin Login Form */}
              {userType === 'admin' && (
                <div className="card shadow border-0">
                  <div className="card-body p-4">
                    <div className="text-center mb-4">
                      <div className="bg-danger text-white rounded-circle d-inline-flex p-2 mb-2">
                        <Shield size={24} />
                      </div>
                      <h3 className="h5 mb-2">Admin Login</h3>
                      <p className="text-muted small">Access the admin dashboard</p>
                    </div>
                    <form onSubmit={handleAdminLogin}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          placeholder="admin@dhakkhana.in"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-danger w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Logging in...
                          </>
                        ) : (
                          'Login as Admin'
                        )}
                      </button>
                    </form>
                    <div className="text-center mt-3">
                      <p className="text-muted small mb-0">
                        Forgot password? Contact system administrator
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

