import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, User } from 'lucide-react';
import { loginAdmin, loginAgent } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'staff'
  const [staffLoginMethod, setStaffLoginMethod] = useState('email'); // 'email' or 'agentId'
  const [form, setForm] = useState({ email: '', agentId: '', password: '' });
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
      if (loginType === 'admin') {
        // Admin login
        const data = await loginAdmin({ email: form.email, password: form.password });
        login(data.token, data.user);
        navigate('/dashboard/admin', { replace: true });
      } else {
        // Staff/Agent login
        const payload = {
          password: form.password,
        };
        
        if (staffLoginMethod === 'email') {
          payload.email = form.email;
        } else {
          payload.agentId = form.agentId;
        }

        const data = await loginAgent(payload);
        login(data.token, data.user);
        navigate('/dashboard/agent', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || `Invalid ${loginType === 'admin' ? 'admin' : 'staff'} credentials`);
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
                    <LogIn size={32} />
                  </div>
                  <h2 className="fw-bold mb-2">Admin & Staff Login</h2>
                  <p className="text-muted">Access your dashboard</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Login As</label>
                    <div className="btn-group w-100 mb-2" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="loginType"
                        id="loginAdmin"
                        checked={loginType === 'admin'}
                        onChange={() => setLoginType('admin')}
                      />
                      <label className="btn btn-outline-danger" htmlFor="loginAdmin">
                        Admin
                      </label>
                      <input
                        type="radio"
                        className="btn-check"
                        name="loginType"
                        id="loginStaff"
                        checked={loginType === 'staff'}
                        onChange={() => setLoginType('staff')}
                      />
                      <label className="btn btn-outline-danger" htmlFor="loginStaff">
                        Staff / Agent
                      </label>
                    </div>
                  </div>

                  {loginType === 'staff' && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Login Using</label>
                      <div className="btn-group w-100 mb-2" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="staffLoginMethod"
                          id="staffEmail"
                          checked={staffLoginMethod === 'email'}
                          onChange={() => setStaffLoginMethod('email')}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="staffEmail">
                          Email
                        </label>
                        <input
                          type="radio"
                          className="btn-check"
                          name="staffLoginMethod"
                          id="staffAgentId"
                          checked={staffLoginMethod === 'agentId'}
                          onChange={() => setStaffLoginMethod('agentId')}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="staffAgentId">
                          Agent ID
                        </label>
                      </div>
                    </div>
                  )}

                  {loginType === 'admin' && (
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
                          placeholder="admin@dakkhana.in"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {loginType === 'staff' && staffLoginMethod === 'email' && (
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

                  {loginType === 'staff' && staffLoginMethod === 'agentId' && (
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
                      'Login'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    Forgot password? Contact system administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

