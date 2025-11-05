import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import '../../styles/authmodal.css';

export default function AuthModal({ showModal, setShowModal }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot-password'
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    program: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && otpSent) {
      setShowOTPInput(false);
      setOtpSent(false);
    }
  }, [otpTimer, otpSent]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Register OTP Functions
  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      const data = await api.auth.sendOTP(formData.email);
      if (data.success) {
        toast.success('OTP sent to your email!');
        setShowOTPInput(true);
        setOtpSent(true);
        setOtpTimer(600);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    try {
      const data = await api.auth.verifyOTP({ 
        email: formData.email, 
        otp: formData.otp 
      });
      
      if (data.success) {
        toast.success('Email verified! ✅');
        setOtpVerified(true);
        setShowOTPInput(false);
        setOtpSent(false);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('OTP verification failed');
    }
  };

  // Forgot Password Functions
  const handleForgotPasswordSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      const data = await api.auth.forgotPassword(formData.email);
      if (data.success) {
        toast.success('OTP sent to your email!');
        setResetStep(2);
        setOtpTimer(600);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const data = await api.auth.resetPassword(
        formData.email, 
        formData.otp, 
        formData.newPassword
      );

      if (data.success) {
        toast.success('Password reset successful! Please login.');
        setMode('login');
        setResetStep(1);
        resetForm();
      } else {
        toast.error(data.message || 'Password reset failed');
      }
    } catch (error) {
      toast.error('Password reset failed. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const data = await api.auth.login({
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        login(data.token, data.user);
        setShowModal(false);
        
        if (data.user.role === 'admin') {
          navigate('/admin');
          setTimeout(() => {
            toast.success('Welcome Admin! 🛡️', { duration: 2000 });
          }, 100);
        } else {
          toast.success('Login successful! 🎉', { duration: 2000 });
          navigate('/');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify your email first!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const data = await api.auth.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        program: formData.program
      });

      if (data.success) {
        toast.success('Registration successful! Please login.');
        setMode('login');
        resetForm();
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      email: '', 
      password: '', 
      phone: '', 
      program: '', 
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setOtpVerified(false);
    setShowOTPInput(false);
    setOtpSent(false);
    setResetStep(1);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay active" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
        
        <h2 className="modal-title">
          {mode === 'login' && '👋 Welcome Back!'}
          {mode === 'register' && '🚀 Join RKS Nexus'}
          {mode === 'forgot-password' && '🔐 Reset Password'}
        </h2>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <button 
              type="button" 
              className="forgot-password-link"
              onClick={() => switchMode('forgot-password')}
            >
              Forgot Password?
            </button>

            <button type="submit" className="submit-btn">
              🔓 Login
            </button>

            <p className="toggle-text">
              Don't have an account?
              <button onClick={() => switchMode('register')} className="toggle-btn">
                Register here
              </button>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-with-action">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={otpVerified}
                />
                {!otpVerified && !otpSent && (
                  <button 
                    type="button" 
                    className="action-btn"
                    onClick={handleSendOTP}
                  >
                    Send OTP
                  </button>
                )}
                {otpVerified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
            </div>

            {showOTPInput && (
              <div className="form-group otp-group">
                <label>Enter OTP</label>
                <div className="input-with-action">
                  <input
                    type="text"
                    name="otp"
                    placeholder="6-digit code"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength="6"
                    className="form-input"
                  />
                  <button 
                    type="button" 
                    className="action-btn"
                    onClick={handleVerifyOTP}
                  >
                    Verify
                  </button>
                </div>
                {otpTimer > 0 && (
                  <div className="otp-timer">
                    ⏱️ Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </div>
                )}
                <button 
                  type="button" 
                  className="resend-otp"
                  onClick={handleSendOTP}
                  disabled={otpTimer > 540}
                >
                  Resend OTP
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91 XXXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Preferred Program</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select a program</option>
                <option value="web-development">Web Development</option>
                <option value="java-development">Java Development</option>
                <option value="python-development">Python Development</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              ✨ Register
            </button>

            <p className="toggle-text">
              Already have an account?
              <button onClick={() => switchMode('login')} className="toggle-btn">
                Login here
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleResetPassword}>
            {/* Step 1: Enter Email */}
            {resetStep === 1 && (
              <>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your registered email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <button 
                  type="button" 
                  className="submit-btn"
                  onClick={handleForgotPasswordSendOTP}
                >
                  Send OTP
                </button>
              </>
            )}

            {/* Step 2 & 3: Enter OTP and New Password */}
            {resetStep === 2 && (
              <>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="6-digit code"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength="6"
                    required
                    className="form-input"
                  />
                  {otpTimer > 0 && (
                    <div className="otp-timer">
                      ⏱️ Time remaining: {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Min. 6 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" className="submit-btn">
                  🔐 Reset Password
                </button>

                <button 
                  type="button" 
                  className="resend-otp"
                  onClick={handleForgotPasswordSendOTP}
                  disabled={otpTimer > 540}
                >
                  Resend OTP
                </button>
              </>
            )}

            <p className="toggle-text">
              Remember your password?
              <button onClick={() => switchMode('login')} className="toggle-btn">
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
