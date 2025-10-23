
import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      }, false); // Pass false to indicate this is not an admin login

      if (result.success) {
        toast.success('Login successful!');
        navigate('/upcoming-rides');
      } else {
        // Show specific error message from backend
        const errorMessage = result.error || 'Login failed';
        
        // Handle different error cases with specific messages
        if (errorMessage.includes('verify your email')) {
          toast.error('Please verify your email before logging in. Check your inbox for the OTP.');
        } else if (errorMessage.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (errorMessage.includes('deactivated')) {
          toast.error('Your account has been deactivated. Please contact support.');
        } else if (errorMessage.includes('Server') || errorMessage.includes('Network')) {
          toast.error('Unable to connect to server. Please check your internet connection and try again.');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      // Handle unexpected errors (network issues, server down, etc.)
      console.error('Login error:', error);
      
      if (error.message === 'Network Error' || !error.response) {
        toast.error('Server is currently unavailable. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
      }
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
              <h1 style={styles.title}>Welcome Back</h1>
              <p style={styles.subtitle}>
                Sign in to your account to book rides
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
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password *</label>
                <div style={styles.inputContainer}>
                  <FiLock style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div style={styles.forgotPasswordContainer}>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  style={styles.forgotPasswordButton}
                >
                  Forgot Password?
                </button>
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
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight style={styles.buttonIcon} />
                  </>
                )}
              </button>
            </form>

            <div style={styles.footer}>
              <p style={styles.switchText}>
                Don't have an account?
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={styles.switchButton}
                >
                  Sign Up
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
    fontSize: '1rem',
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
  forgotPasswordContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-10px',
  },
  forgotPasswordButton: {
    background: 'none',
    border: 'none',
    color: '#ff4757',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '500',
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

export default Login;