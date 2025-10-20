// OTPForgot.jsx - Updated with redirect to EmailVerify

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar.jsx';
import Footer from './Footer.jsx';

const OTPForgot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const email = location.state?.email || '';

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      toast.error('Invalid access. Please start from forgot password.');
      navigate('/forgot-password');
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Please paste numbers only');
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Import authAPI dynamically to avoid circular dependencies
      const { authAPI } = await import('../services/api.js');
      
      // Call verify forgot password OTP API
      const response = await authAPI.verifyForgotPasswordOTP({
        email: email,
        otp: otpValue
      });
      
      console.log('Verification response:', response);
      toast.success('OTP Verified Successfully!');
      
      // Navigate to reset password page with email and otp
      navigate('/reset-password', { state: { email, otp: otpValue } });
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      // Import authAPI dynamically to avoid circular dependencies
      const { authAPI } = await import('../services/api.js');
      
      // Call resend OTP API
      await authAPI.resendOTP({
        email: email,
        type: 'forgot-password'
      });
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('OTP has been resent to your email');
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      toast.error(errorMessage);
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    paddingTop: '100px',
    paddingBottom: '80px'
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 40px'
  };

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    padding: '50px',
    borderRadius: '12px',
    border: '2px solid #ff4757',
    boxShadow: '0 20px 60px rgba(255,71,87,0.3)'
  };

  const headingStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '15px',
    color: 'white',
    textAlign: 'center',
    letterSpacing: '2px',
    textTransform: 'uppercase'
  };

  const subheadingStyle = {
    fontSize: '0.95rem',
    color: '#ccc',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.6'
  };

  const emailStyle = {
    color: '#ff4757',
    fontWeight: '600'
  };

  const otpContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '40px'
  };

  const otpInputStyle = {
    width: '55px',
    height: '65px',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    transition: 'all 0.3s'
  };

  const actionButtonStyle = {
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
    borderRadius: '8px',
    textTransform: 'uppercase',
    marginBottom: '20px'
  };

  const resendStyle = {
    textAlign: 'center',
    color: '#ccc',
    fontSize: '0.95rem'
  };

  const resendLinkStyle = {
    color: '#ff4757',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '5px'
  };

  return (
    <>
      <style>
        {`
          input:focus {
            border-color: #ff4757 !important;
            box-shadow: 0 0 0 3px rgba(255,71,87,0.2);
            transform: scale(1.05);
          }
          
          button:hover:not(:disabled) {
            background-color: #ff3345 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255,71,87,0.4);
          }

          button:disabled {
            background-color: #666 !important;
            cursor: not-allowed;
            transform: none !important;
            opacity: 0.6;
          }

          .resend-link:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .container {
              padding: 0 25px !important;
            }
            
            .card {
              padding: 40px 30px !important;
            }
            
            .heading {
              font-size: 1.6rem !important;
            }
            
            .otp-input {
              width: 45px !important;
              height: 55px !important;
              font-size: 1.5rem !important;
            }
            
            .otp-container {
              gap: 8px !important;
            }
          }

          @media (max-width: 480px) {
            .page-style {
              padding-top: 60px !important;
            }
            
            .card {
              padding: 30px 20px !important;
            }
            
            .heading {
              font-size: 1.4rem !important;
            }
            
            .subheading {
              font-size: 0.9rem !important;
              margin-bottom: 30px !important;
            }
            
            .otp-input {
              width: 40px !important;
              height: 50px !important;
              font-size: 1.3rem !important;
            }
            
            .otp-container {
              gap: 6px !important;
            }
            
            .action-button {
              padding: 15px !important;
              font-size: 0.9rem !important;
            }
          }
        `}
      </style>

      <div style={pageStyle} className="page-style">
        <div style={containerStyle} className="container">
          <Navbar />

          <div style={cardStyle} className="card">
            <h1 style={headingStyle} className="heading">Verify OTP</h1>
            <p style={subheadingStyle} className="subheading">
              We've sent a 6-digit verification code to<br />
              <span style={emailStyle}>{email || 'your email'}</span>
            </p>

            {/* OTP Input Boxes */}
            <div style={otpContainerStyle} className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  style={otpInputStyle}
                  className="otp-input"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              style={actionButtonStyle}
              className="action-button"
              disabled={otp.join('').length !== 6 || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend Link */}
            <p style={resendStyle}>
              Didn't receive the code?
              <span onClick={handleResend} style={resendLinkStyle} className="resend-link">
                Resend OTP
              </span>
            </p>
          </div>

          
        </div>
     
      </div>
         <Footer />
    </>
  );
};

export default OTPForgot;