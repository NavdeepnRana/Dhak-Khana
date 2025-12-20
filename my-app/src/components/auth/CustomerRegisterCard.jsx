import React, { useMemo, useState } from 'react';
import { Mail, Phone, ShieldCheck, UserPlus } from 'lucide-react';

export default function CustomerRegisterCard({ onSubmit, isLoading }) {
  const [mode, setMode] = useState('form'); // 'form', 'otp', 'google'
  
  // Form registration state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male',
  });

  // OTP registration state
  const [otpForm, setOtpForm] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [otpInput, setOtpInput] = useState('');
  const [otpState, setOtpState] = useState({ 
    code: '', 
    sent: false, 
    verified: false, 
    message: '', 
    isError: false 
  });

  const googleAuthUrl = useMemo(() => {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${base}/auth/customers/google`;
  }, []);

  const handleFormChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleOtpFormChange = (e) => setOtpForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Regular form registration
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, registrationType: 'form' });
  };

  // OTP registration
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpState.verified) {
      alert('Please verify the OTP before creating an account.');
      return;
    }
    onSubmit({ 
      ...otpForm, 
      registrationType: 'otp',
      otp: otpInput 
    });
  };

  const handleSendOtp = async () => {
    if (!otpForm.phone && !otpForm.email) {
      setOtpState({
        code: '',
        sent: false,
        verified: false,
        message: 'Please enter your mobile number or email before requesting an OTP.',
        isError: true,
      });
      return;
    }
    
    try {
      setOtpState(prev => ({ ...prev, message: 'Sending OTP...', isError: false }));
      const { sendOTP } = await import('../../services/api');
      const contact = otpForm.phone || otpForm.email;
      const response = await sendOTP({ 
        phone: otpForm.phone || undefined, 
        email: otpForm.email || undefined 
      });
      
      setOtpState({
        code: '',
        sent: true,
        verified: false,
        message: response.message || `OTP sent to ${contact}. Please check your ${otpForm.email ? 'email' : 'phone'}.`,
        isError: false,
      });
      setOtpInput('');
    } catch (error) {
      setOtpState({
        code: '',
        sent: false,
        verified: false,
        message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        isError: true,
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpState.sent) {
      setOtpState((prev) => ({ ...prev, message: 'Please send OTP first.', isError: true }));
      return;
    }
    
    if (!otpInput || otpInput.length !== 6) {
      setOtpState((prev) => ({ ...prev, message: 'Please enter a valid 6-digit OTP.', isError: true }));
      return;
    }
    
    try {
      const { verifyOTP } = await import('../../services/api');
      const response = await verifyOTP({ 
        phone: otpForm.phone || undefined, 
        email: otpForm.email || undefined,
        otp: otpInput 
      });
      
      setOtpState((prev) => ({
        ...prev,
        verified: response.verified,
        message: response.message || (response.verified ? 'OTP verified successfully.' : 'OTP did not match. Try again.'),
        isError: !response.verified,
      }));
    } catch (error) {
      setOtpState((prev) => ({
        ...prev,
        verified: false,
        message: error.response?.data?.message || 'Failed to verify OTP. Please try again.',
        isError: true,
      }));
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch(googleAuthUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to initiate Google login' }));
        alert(errorData.message || 'Failed to initiate Google login. Please try again.');
        return;
      }
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || 'Google OAuth is not configured. Please contact support.');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Failed to initiate Google login. Please check your connection and try again.');
    }
  };

  return (
    <div className="card shadow border-0">
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <UserPlus size={32} className="text-danger mb-2" />
          <h3 className="h5">Create your Dhakkhana ID</h3>
          <p className="text-muted small">One profile for bookings, tracking, and citizen services.</p>
        </div>

        {/* Registration Mode Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom">
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-2 ${mode === 'form' ? 'border-bottom border-danger border-2' : 'text-muted'}`}
            onClick={() => setMode('form')}
          >
            Register with Details
          </button>
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-2 ${mode === 'otp' ? 'border-bottom border-danger border-2' : 'text-muted'}`}
            onClick={() => setMode('otp')}
          >
            OTP Login
          </button>
        </div>

        {/* Regular Form Registration */}
        {mode === 'form' && (
          <form onSubmit={handleFormSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input 
                className="form-control" 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select 
                className="form-select" 
                name="gender" 
                value={form.gender} 
                onChange={handleFormChange} 
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not_say">Prefer not to say</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Mobile number</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Phone size={16} />
                </span>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                minLength={6}
                required
              />
            </div>
            <div className="col-12">
              <button className="btn btn-danger w-100" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
            <div className="col-12">
              <button type="button" className="btn btn-outline-secondary w-100" onClick={handleGoogleAuth}>
                Sign up with Google
              </button>
            </div>
          </form>
        )}

        {/* OTP Registration */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Full Name</label>
              <input 
                className="form-control" 
                name="name" 
                value={otpForm.name} 
                onChange={handleOtpFormChange} 
                required 
              />
            </div>
            <div className="col-12">
              <label className="form-label">Mobile number or Email</label>
              <div className="input-group mb-2">
                <span className="input-group-text">
                  <Phone size={16} />
                </span>
                <input
                  className="form-control"
                  name="phone"
                  value={otpForm.phone}
                  onChange={handleOtpFormChange}
                  placeholder="Mobile number (e.g., +91 98765 43210)"
                />
              </div>
              <div className="text-center text-muted small mb-2">OR</div>
              <div className="input-group">
                <span className="input-group-text">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={otpForm.email}
                  onChange={handleOtpFormChange}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="col-md-7">
              <label className="form-label">OTP</label>
              <input
                className="form-control"
                placeholder="Enter 6-digit code"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="col-md-5 d-flex align-items-end gap-2">
              <button type="button" className="btn btn-outline-secondary w-100" onClick={handleSendOtp}>
                Send OTP
              </button>
              <button type="button" className="btn btn-outline-success w-100" onClick={handleVerifyOtp}>
                Verify
              </button>
            </div>
            {otpState.message && (
              <div className={`col-12 small ${otpState.isError ? 'text-danger' : 'text-success'}`}>
                {otpState.message}
              </div>
            )}
            <div className="col-12 d-flex align-items-center gap-2">
              <ShieldCheck size={20} className="text-success" />
              <p className="small text-muted mb-0">
                We use OTP verification to keep your Dhakkhana account safe and compliant with DIGI-locker norms.
              </p>
            </div>
            <div className="col-12">
              <button className="btn btn-danger w-100" disabled={isLoading || !otpState.verified}>
                {isLoading ? 'Creating...' : 'Create Account with OTP'}
              </button>
            </div>
            <div className="col-12">
              <button type="button" className="btn btn-outline-secondary w-100" onClick={handleGoogleAuth}>
                Sign up with Google
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
