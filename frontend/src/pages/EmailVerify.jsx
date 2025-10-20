import React, { useState } from 'react';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const EmailVerify = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Import authAPI dynamically to avoid circular dependencies
    const { authAPI } = await import('../services/api.js');
    
    // Call forgot password API
    const response = await authAPI.forgotPassword({ email });
    
    console.log('Forgot password response:', response);
    toast.success('OTP sent to your email!');
    
    // Navigate to OTP Forgot page with email
    navigate('/verify-otp-forgot', { state: { email } });
  } catch (error) {
    console.error('Forgot password error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to send OTP';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div style={styles.container}>
        <Navbar />
        <div style={styles.contentWrapper}>
          <div style={styles.loginCard}>
            <div style={styles.header}>
              <h1 style={styles.title}>Forgot Password?</h1>
              <p style={styles.subtitle}>
                Enter your email address and we'll send you an OTP to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address *</label>
                <div style={styles.inputContainer}>
                  <FiMail style={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={styles.input}
                  />
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
                  <span>Sending OTP...</span>
                ) : (
                  <>
                    <span>Send OTP</span>
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

export default EmailVerify;