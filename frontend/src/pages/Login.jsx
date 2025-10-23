import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { X, ExternalLink } from 'lucide-react';


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSponsor1, setShowSponsor1] = useState(true);
const [showSponsor2, setShowSponsor2] = useState(true);
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
 const navigateToSponsors = () => {
    // alert('Navigating to /sponsors');
    navigate('/sponsors')
  };
  return (
    <>
      <div style={styles.container}>
        <Navbar />
        <div style={styles.contentWrapper}>
{showSponsor1 && (
          <div style={styles.sponsorCard1} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor1(false)}
              style={styles.closeBtn}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={styles.sponsorBadge}>FEATURED</div>
            <div style={styles.sponsorImgWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=300&fit=crop" 
                alt="Premium Rides"
                style={styles.sponsorImg}
              />
              <div style={styles.sponsorOverlay}></div>
            </div>
            <div style={styles.sponsorInfo}>
              <h3 style={styles.sponsorTitle}>Premium Rides</h3>
              <p style={styles.sponsorDesc}>Luxury travel experiences with exclusive partners</p>
              <button 
                onClick={navigateToSponsors}
                style={styles.sponsorBtn}
                className="sponsor-btn"
              >
                <span>Discover More</span>
                <ExternalLink size={16} style={styles.btnIcon} />
              </button>
            </div>
          </div>
        )}

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
        {showSponsor2 && (
          <div style={styles.sponsorCard2} className="sponsor-card">
            <button 
              onClick={() => setShowSponsor2(false)}
              style={styles.closeBtn}
              className="close-btn"
            >
              <X size={18} />
            </button>
            <div style={{...styles.sponsorBadge, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>PARTNER</div>
            <div style={styles.sponsorImgWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop" 
                alt="Travel Partners"
                style={styles.sponsorImg}
              />
              <div style={styles.sponsorOverlay}></div>
            </div>
            <div style={styles.sponsorInfo}>
              <h3 style={styles.sponsorTitle}>Travel Partners</h3>
              <p style={styles.sponsorDesc}>Amazing deals from trusted travel sponsors</p>
              <button 
                onClick={navigateToSponsors}
                style={{...styles.sponsorBtn, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                className="sponsor-btn"
              >
                <span>Explore Deals</span>
                <ExternalLink size={16} style={styles.btnIcon} />
              </button>
            </div>
          </div>
        )}
        </div>

<style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .sponsor-card {
          animation: fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .input-field:focus {
          border-color: #ff4757 !important;
          box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1) !important;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff3742 0%, #ff1744 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4) !important;
        }

        .sponsor-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4);
        }

        .close-btn:hover {
          background: rgba(255, 71, 87, 0.9) !important;
          transform: rotate(90deg);
        }

        @media (min-width: 1024px) {
          .sponsor-card:hover {
            transform: translateY(-5px);
          }
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .sponsor-card {
            position: relative !important;
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto 20px auto !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
          }
        }

        @media (max-width: 768px) {
          .sponsor-card {
            position: relative !important;
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto 20px auto !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
          }
        }

        @media (max-width: 480px) {
          .sponsor-card {
            width: 100% !important;
          }
        }
      `}</style>
      </div>
      </>
  );
};

const styles = {
  container: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '20px',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderBottom: '1px solid #333',
    zIndex: 1000,
    padding: '15px 0',
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '500px',
    zIndex: 1,
    marginTop: '60px',
  },
  loginCard: {
    backgroundColor: '#111',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid #222',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#888',
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
    color: '#ddd',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 40px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #222',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#666',
    zIndex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '5px',
    zIndex: 1,
    transition: 'color 0.2s',
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
    fontWeight: '500',
    transition: 'opacity 0.2s',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    color: '#fff',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
  },
  buttonIcon: {
    fontSize: '1.2rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #222',
  },
  switchText: {
    color: '#888',
    fontSize: '0.9rem',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#ff4757',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s',
  },
  sponsorCard1: {
    position: 'fixed',
    top: '120px',
    left: '40px',
    width: '320px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid #2a2a2a',
    zIndex: 999,
    transition: 'all 0.3s ease',
  },
  sponsorCard2: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    width: '320px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
    border: '1px solid #2a2a2a',
    zIndex: 999,
    transition: 'all 0.3s ease',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },
  sponsorBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    zIndex: 10,
    boxShadow: '0 2px 10px rgba(255, 71, 87, 0.4)',
  },
  sponsorImgWrapper: {
    position: 'relative',
    width: '100%',
    height: '160px',
    overflow: 'hidden',
  },
  sponsorImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sponsorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, #1a1a1a 0%, transparent 100%)',
  },
  sponsorInfo: {
    padding: '20px',
  },
  sponsorTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    marginTop: 0,
  },
  sponsorDesc: {
    fontSize: '0.85rem',
    color: '#999',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  sponsorBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b7a 100%)',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)',
  },
  btnIcon: {
    fontSize: '1rem',
  },
};



export default Login;

