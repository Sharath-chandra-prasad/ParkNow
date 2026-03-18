import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaShieldAlt, FaCar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success('Reset code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 8 characters long, with uppercase, lowercase, number, and special character');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset code</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="otp-info">
                <FaShieldAlt className="otp-info-icon" />
                <p>We've sent a 6-digit code to <strong>{email}</strong></p>
              </div>
              
              <div className="form-group">
                <label htmlFor="otp">
                  <FaShieldAlt /> Reset Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                  className="otp-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">
                  <FaLock /> New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password (min 8 chars)"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock /> Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setStep(1)}
                style={{ marginTop: '12px' }}
              >
                ← Back
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
