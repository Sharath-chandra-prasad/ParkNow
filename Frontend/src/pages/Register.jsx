import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaCar, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState(1); // 1=form, 2=enter OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const { register, API_URL } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast.error('Only @gmail.com email addresses are allowed');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must be at least 8 characters long, with uppercase, lowercase, number, and special character');
      return;
    }

    setOtpSending(true);
    try {
      await axios.post(`${API_URL}/otp/send`, { email });
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post(`${API_URL}/otp/verify`, { email, otp });
      
      if (verifyRes.data.verified) {
        // Step 2: Register user
        await register(name, email, password);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page theme-auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <FaCar className="auth-icon" />
            <h2>Create Account</h2>
            <p>Join ParkNow for hassle-free parking</p>
          </div>

          {step === 1 ? (
            /* Step 1: Registration Form */
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">
                  <FaUser /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password (min 8 chars)"
                  required
                />
                <div className="password-instructions">
                  <FaShieldAlt /> Password must be at least 8 characters with upper, lower, number & special char.
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={otpSending}>
                {otpSending ? 'Sending OTP...' : 'Send OTP & Continue'}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyAndRegister} className="auth-form">
              <div className="otp-info">
                <FaShieldAlt className="otp-info-icon" />
                <p>We've sent a 6-digit OTP to <strong>{email}</strong></p>
              </div>
              <div className="form-group">
                <label htmlFor="otp">
                  <FaShieldAlt /> Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  className="otp-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setStep(1)}
                style={{ marginTop: '12px' }}
              >
                ← Back to Form
              </button>
              <button
                type="button"
                className="btn-text"
                onClick={handleSendOTP}
                disabled={otpSending}
                style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}
              >
                {otpSending ? 'Resending...' : 'Resend OTP'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
