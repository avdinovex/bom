// Updated Registration.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from './Footer.jsx';
import reg from '../assets/regimg.jpg'

const Registration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    primaryBike: '',
    experienceLevel: 'Beginner',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Form submitted:', formData);
      
      // Import authAPI dynamically to avoid circular dependencies
      const { authAPI } = await import('../services/api.js');
      
      // Call register API
      const response = await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        primaryBike: formData.primaryBike,
        experienceLevel: formData.experienceLevel
      });
      
      console.log('Registration response:', response);
      
      // Show success message
      alert('Registration successful! Please check your email for OTP verification.');
      
      // Navigate to OTP verification page with email in state
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px'
  };

  const contentWrapperStyle = {
    display: 'flex',
    gap: '60px',
    alignItems: 'center',
    marginBottom: '60px'
  };

  const leftSectionStyle = {
    flex: '1',
    color: 'white'
  };

  const headingStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '30px',
    letterSpacing: '2px',
    color: 'white',
    textTransform: 'uppercase',
    lineHeight: '1.2'
  };

  const benefitItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#ccc'
  };

  const checkmarkStyle = {
    color: '#ff4757',
    marginRight: '15px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const imageContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginTop: '40px',
    boxShadow: '0 20px 60px rgba(255,71,87,0.3)'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const rightSectionStyle = {
    flex: '1',
    backgroundColor: '#1a1a1a',
    padding: '50px',
    borderRadius: '12px',
    border: '2px solid #ff4757',
    boxShadow: '0 20px 60px rgba(255,71,87,0.3)'
  };

  const formHeadingStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '40px',
    color: 'white',
    textAlign: 'center',
    letterSpacing: '2px',
    textTransform: 'uppercase'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '600',
    letterSpacing: '1px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    marginBottom: '25px',
    backgroundColor: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: '20px',
    paddingRight: '45px'
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    cursor: 'pointer'
  };

  const checkboxStyle = {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    cursor: 'pointer',
    accentColor: '#ff4757'
  };

  const checkboxLabelStyle = {
    color: '#ccc',
    fontSize: '0.95rem',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const linkStyle = {
    color: '#ff4757',
    textDecoration: 'none',
    fontWeight: '600'
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '18px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    letterSpacing: '2px',
    transition: 'all 0.3s',
    borderRadius: '6px',
    textTransform: 'uppercase'
  };

  return (
    <>
      <style>
        {`
          input:focus, select:focus {
            border-color: #ff4757 !important;
            box-shadow: 0 0 0 3px rgba(255,71,87,0.1);
          }
          
          button:hover {
            background-color: #ff3345 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255,71,87,0.4);
          }

          button:disabled {
            background-color: #666 !important;
            cursor: not-allowed;
            transform: none !important;
          }

          @media (max-width: 968px) {
            .content-wrapper {
              flex-direction: column !important;
              gap: 40px !important;
            }
            
            .container {
              padding: 0 25px !important;
            }
            
            .page-style {
              padding-top: 80px !important;
            }
            
            .left-section h1 {
              font-size: 2.5rem !important;
            }
            
            .right-section {
              padding: 40px !important;
            }
            
            .image-container {
              height: 350px !important;
            }
          }

          @media (max-width: 768px) {
            .left-section h1 {
              font-size: 2rem !important;
            }
            
            .image-container {
              height: 300px !important;
            }
            
            .form-heading {
              font-size: 1.6rem !important;
            }
          }

          @media (max-width: 480px) {
            .container {
              padding: 0 20px !important;
            }
            
            .page-style {
              padding-top: 60px !important;
            }
            
            .left-section h1 {
              font-size: 1.6rem !important;
              margin-bottom: 20px !important;
            }
            
            .benefit-item {
              font-size: 1rem !important;
              margin-bottom: 15px !important;
            }
            
            .right-section {
              padding: 30px 25px !important;
            }
            
            .form-heading {
              font-size: 1.4rem !important;
              margin-bottom: 30px !important;
            }
            
            .input-field {
              padding: 12px 15px !important;
              margin-bottom: 20px !important;
              font-size: 0.95rem !important;
            }
            
            .submit-button {
              padding: 15px !important;
              font-size: 0.9rem !important;
            }
            
            .image-container {
              height: 250px !important;
              margin-top: 30px !important;
            }
          }
        `}
      </style>

      <div style={pageStyle} className="page-style">
        <div style={containerStyle} className="container">
          <Navbar />

          <div style={contentWrapperStyle} className="content-wrapper">
            {/* Left Section */}
            <div style={leftSectionStyle} className="left-section">
              <h1 style={headingStyle}>Join Our Riding Community</h1>
              
              <div style={benefitItemStyle} className="benefit-item">
                <span style={checkmarkStyle}>✓</span>
                <span>Free access to scheduled group rides</span>
              </div>
              
              <div style={benefitItemStyle} className="benefit-item">
                <span style={checkmarkStyle}>✓</span>
                <span>Member discounts at local shops</span>
              </div>
              
              <div style={benefitItemStyle} className="benefit-item">
                <span style={checkmarkStyle}>✓</span>
                <span>Monthly newsletter with ride tips</span>
              </div>
              
              <div style={benefitItemStyle} className="benefit-item">
                <span style={checkmarkStyle}>✓</span>
                <span>Priority registration for special events</span>
              </div>

              <div style={imageContainerStyle} className="image-container">
                <img
                  src= {reg}
                  alt="Bikers Community"
                  style={imageStyle}
                />
              </div>
            </div>

            {/* Right Section - Form */}
            <div style={rightSectionStyle} className="right-section">
              <h2 style={formHeadingStyle} className="form-heading">Register Now</h2>
              
              <form onSubmit={handleSubmit}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={inputStyle}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={inputStyle}
                    className="input-field"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Primary Bike</label>
                  <input
                    type="text"
                    name="primaryBike"
                    value={formData.primaryBike}
                    onChange={handleChange}
                    style={inputStyle}
                    className="input-field"
                    placeholder="e.g., Royal Enfield Classic 350"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Riding Experience</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    style={selectStyle}
                    className="input-field"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div style={checkboxContainerStyle}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    style={checkboxStyle}
                    id="terms"
                    required
                  />
                  <label htmlFor="terms" style={checkboxLabelStyle}>
                    I agree to the{' '}
                    <a href="/terms" style={linkStyle}>
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    opacity: loading || !formData.agreeTerms ? 0.6 : 1,
                    cursor: loading || !formData.agreeTerms ? 'not-allowed' : 'pointer'
                  }}
                  className="submit-button"
                  disabled={loading || !formData.agreeTerms}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff4757',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Registration;