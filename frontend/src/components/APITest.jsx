// Test Component for API Connections
// This component can be temporarily added to test API endpoints

import React, { useState } from 'react';
import { authAPI } from '../services/api.js';
import { toast } from 'react-hot-toast';

const APITest = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');

  const testRegister = async () => {
    try {
      const response = await authAPI.register({
        fullName: 'Test User',
        email: email,
        password: 'test123',
        primaryBike: 'Test Bike',
        experienceLevel: 'Beginner'
      });
      console.log('Register response:', response);
      toast.success('Registration OTP sent!');
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const testVerifyOTP = async () => {
    try {
      const response = await authAPI.verifyRegistrationOTP({
        email: email,
        otp: otp
      });
      console.log('Verify OTP response:', response);
      toast.success('OTP verified!');
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed');
    }
  };

  const testForgotPassword = async () => {
    try {
      const response = await authAPI.forgotPassword({ email: email });
      console.log('Forgot password response:', response);
      toast.success('Password reset OTP sent!');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Forgot password failed');
    }
  };

  const testResetPassword = async () => {
    try {
      const response = await authAPI.resetPassword({
        email: email,
        otp: otp,
        newPassword: password
      });
      console.log('Reset password response:', response);
      toast.success('Password reset successful!');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
  };

  const styles = {
    container: { padding: '20px', maxWidth: '500px', margin: '0 auto' },
    input: { 
      width: '100%', 
      padding: '10px', 
      margin: '10px 0', 
      border: '1px solid #ddd',
      borderRadius: '5px'
    },
    button: { 
      padding: '10px 20px', 
      margin: '10px 5px', 
      backgroundColor: '#ff4757',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <h2>API Test Component</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="text"
        placeholder="OTP (6 digits)"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      
      <div>
        <button style={styles.button} onClick={testRegister}>
          Test Register
        </button>
        <button style={styles.button} onClick={testVerifyOTP}>
          Test Verify OTP
        </button>
      </div>
      
      <div>
        <button style={styles.button} onClick={testForgotPassword}>
          Test Forgot Password
        </button>
        <button style={styles.button} onClick={testResetPassword}>
          Test Reset Password
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
        Check browser console and Network tab for detailed responses.
        Remove this component before production.
      </p>
    </div>
  );
};

export default APITest;