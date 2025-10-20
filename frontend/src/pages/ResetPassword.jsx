import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!otp) {
      toast.error('Invalid access. Please start from forgot password.');
      navigate('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      // Import authAPI dynamically to avoid circular dependencies
      const { authAPI } = await import('../services/api.js');
      
      // Call reset password API
      const response = await authAPI.resetPassword({
        email: email,
        otp: otp,
        newPassword: formData.newPassword
      });
      
      console.log('Reset password response:', response);
      toast.success('Password reset successful! You can now login with your new password.');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if no email or OTP provided
  React.useEffect(() => {
    if (!email || !otp) {
      toast.error('Invalid access. Please start from forgot password.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  return (
    <>
      <div style={styles.container}>
        <Navbar />
        <div style={styles.contentWrapper}>
          <div style={styles.loginCard}>
            <div style={styles.header}>
              <h1 style={styles.title}>Reset Password</h1>
              <p style={styles.subtitle}>
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password *</label>
                <div style={styles.inputContainer}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    required
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    style={styles.input}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <span style={styles.hint}>Must be at least 6 characters</span>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password *</label>
                <div style={styles.inputContainer}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    style={styles.input}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span>Resetting Password...</span>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <FiArrowRight style={styles.buttonIcon} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.footer}>
              <p style={styles.switchText}>
                Remember your password?
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={styles.switchButton}
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    paddingTop: '100px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '500px',
    padding: '0 20px',
  },
  loginCard: {
    backgroundColor: '#111',
    borderRadius: '15px',
    padding: '40px',
    boxShadow: '0 0 30px rgba(255, 71, 87, 0.2)',
    border: '1px solid #333',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#fff',
  },
  subtitle: {
    color: '#aaa',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 40px',
    backgroundColor: '#222',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#aaa',
    fontSize: '1.1rem',
    zIndex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0',
    zIndex: 1,
  },
  hint: {
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '-4px',
  },
  submitButton: {
    backgroundColor: '#ff4757',
    color: '#fff',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {
    fontSize: '1.1rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #333',
  },
  switchText: {
    color: '#aaa',
    fontSize: '0.9rem',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#ff4757',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '0.9rem',
    textDecoration: 'underline',
  },
};

// Add hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerHTML = `
    input:focus {
      border-color: #ff4757 !important;
      box-shadow: 0 0 0 2px rgba(255, 71, 87, 0.1) !important;
    }
    button[type="submit"]:hover:not(:disabled) {
      background-color: #ff3742 !important;
      transform: translateY(-2px);
    }
    @media (max-width: 768px) {
      .login-card {
        padding: 30px 20px !important;
      }
      h1 {
        font-size: 1.6rem !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ResetPassword;