import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, Lock, LogIn, Mail, Phone } from 'lucide-react';

export default function CustomerAuthCard({ onSubmit, isLoading }) {
  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  
  // Password login state
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // OTP login state
  const [otpForm, setOtpForm] = useState({ name: '', phone: '', email: '' });
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

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleOtpFormChange = (e) => setOtpForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Password login
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, loginType: 'password' });
  };

  // OTP login
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpState.verified) {
      alert('Please verify the OTP before logging in.');
      return;
    }
    onSubmit({ 
      ...otpForm, 
      loginType: 'otp',
      otp: otpInput 
    });
  };

  const handleSendOtp = async () => {
    if (!otpForm.phone && !otpForm.email && !otpForm.name) {
      setOtpState({
        code: '',
        sent: false,
        verified: false,
        message: 'Please enter your name and mobile number or email before requesting an OTP.',
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
    <div className="card shadow border-0 h-100">
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <LogIn size={32} className="text-danger mb-2" />
          <h3 className="h5">Sign in to your Dhakkhana ID</h3>
          <p className="text-muted small">Fast, secure access to all things Dhakkhana.</p>
        </div>

        {/* Login Mode Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom">
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-2 ${mode === 'password' ? 'border-bottom border-danger border-2' : 'text-muted'}`}
            onClick={() => setMode('password')}
          >
            Email & Password
          </button>
          <button
            type="button"
            className={`btn btn-link text-decoration-none p-2 ${mode === 'otp' ? 'border-bottom border-danger border-2' : 'text-muted'}`}
            onClick={() => setMode('otp')}
          >
            OTP Login
          </button>
        </div>

        {/* Password Login */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="mb-3">
            <label className="form-label">Email address</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <AtSign size={16} />
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <label className="form-label d-flex justify-content-between">
              <span>Password</span>
              <a href="mailto:support@dhakkhana.in?subject=Forgot%20Password" className="small text-decoration-none">
                Forgot password?
              </a>
            </label>
            <div className="input-group mb-4">
              <span className="input-group-text bg-light">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button className="btn btn-danger w-100 mb-2" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={handleGoogleAuth}>
              Continue with Google
            </button>
          </form>
        )}

        {/* OTP Login */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="mb-3">
            <label className="form-label">Name</label>
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <AtSign size={16} />
              </span>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Your full name"
                value={otpForm.name}
                onChange={handleOtpFormChange}
                required
              />
            </div>
            <label className="form-label">Mobile number or Email</label>
            <div className="input-group mb-2">
              <span className="input-group-text bg-light">
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
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
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
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">OTP</span>
              <input
                className="form-control"
                placeholder="Enter 6-digit code"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
              />
              <button type="button" className="btn btn-outline-secondary" onClick={handleSendOtp}>
                Send OTP
              </button>
              <button type="button" className="btn btn-outline-success" onClick={handleVerifyOtp}>
                Verify
              </button>
            </div>
            {otpState.message && (
              <div className={`small mb-3 ${otpState.isError ? 'text-danger' : 'text-success'}`}>
                {otpState.message}
              </div>
            )}
            <button className="btn btn-danger w-100 mb-2" disabled={isLoading || !otpState.verified}>
              {isLoading ? 'Signing in...' : 'Login with OTP'}
            </button>
            <button type="button" className="btn btn-outline-secondary w-100" onClick={handleGoogleAuth}>
              Continue with Google
            </button>
          </form>
        )}

        <div className="text-center border-top pt-3">
          <p className="small text-muted mb-1">Don&apos;t have an account?</p>
          <Link to="/register" className="btn btn-link text-decoration-none p-0 fw-semibold">
            Create a Dhakkhana ID
          </Link>
          <p className="text-muted small mt-3 d-flex align-items-center justify-content-center gap-1">
            <Mail size={14} /> Need help? <a href="mailto:hello@dhakkhana.in">hello@dhakkhana.in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
