import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, LogIn, User } from 'lucide-react';
import { loginAgent } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PickupBoyLoginPage() {
  const [form, setForm] = useState({ agentId: '', email: '', mobile: '', password: '' });
  const [loginType, setLoginType] = useState('agentId'); // agentId, email, mobile
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare payload based on login type
      const payload = {
        password: form.password,
      };
      
      if (loginType === 'agentId') {
        payload.agentId = form.agentId;
      } else if (loginType === 'email') {
        payload.email = form.email;
      } else if (loginType === 'mobile') {
        payload.mobile = form.mobile;
      }

      const data = await loginAgent(payload);
      login(data.token, data.user);
      navigate('/dashboard/agent', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-danger text-white rounded-circle d-inline-flex p-3 mb-3">
                    <Truck size={32} />
                  </div>
                  <h2 className="fw-bold mb-2">Pickup Boy / Delivery Agent Login</h2>
                  <p className="text-muted">Access your delivery dashboard</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Login Using</label>
                    <div className="btn-group w-100 mb-2" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="loginType"
                        id="loginAgentId"
                        checked={loginType === 'agentId'}
                        onChange={() => setLoginType('agentId')}
                      />
                      <label className="btn btn-outline-danger" htmlFor="loginAgentId">
                        Agent ID
                      </label>
                      <input
                        type="radio"
                        className="btn-check"
                        name="loginType"
                        id="loginEmail"
                        checked={loginType === 'email'}
                        onChange={() => setLoginType('email')}
                      />
                      <label className="btn btn-outline-danger" htmlFor="loginEmail">
                        Email
                      </label>
                      <input
                        type="radio"
                        className="btn-check"
                        name="loginType"
                        id="loginMobile"
                        checked={loginType === 'mobile'}
                        onChange={() => setLoginType('mobile')}
                      />
                      <label className="btn btn-outline-danger" htmlFor="loginMobile">
                        Mobile
                      </label>
                    </div>
                  </div>

                  {loginType === 'agentId' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Agent ID</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          name="agentId"
                          value={form.agentId}
                          onChange={handleChange}
                          placeholder="e.g. AG123456"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {loginType === 'email' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="agent@dakkhana.in"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {loginType === 'mobile' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Mobile Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <Truck size={18} />
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger w-100 btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} className="me-2" />
                        Login as Agent
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    Forgot password? Contact system administrator
                  </p>
                  <a href="/login" className="text-danger small text-decoration-none mt-2 d-block">
                    Customer Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

