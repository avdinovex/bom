import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import GuidelinesPopup from './PopUp';
import { audienceRegistrationsAPI } from '../services/api';

const AudienceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [showGuidelines, setShowGuidelines] = useState(true); // Show guidelines on mount
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (orderData) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    const options = {
      key: orderData.payment.razorpayKeyId,
      amount: orderData.payment.amount * 100,
      currency: orderData.payment.currency,
      name: event?.title || 'Event Registration',
      description: 'Audience Registration',
      order_id: orderData.payment.orderId,
      handler: async function (response) {
        try {
          setLoading(true);
          const verifyData = {
            registrationId: orderData.registration._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };

          const result = await audienceRegistrationsAPI.verifyPayment(verifyData);

          if (result.success) {
            toast.success(
              `🎉 Registration Successful!`,
              { duration: 3000 }
            );
            
            // Reset form
            setFormData({
              name: '',
              address: '',
              phoneNumber: '',
              email: ''
            });
            
            // Navigate back to event page or home after a short delay
            setTimeout(() => {
              navigate(-1);
            }, 3000);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error(error.response?.data?.message || 'Payment verification failed');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phoneNumber
      },
      theme: {
        color: '#ff4757'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
          toast.error('Payment cancelled');
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event || !event._id) {
      toast.error('Event information is missing');
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        eventId: event._id,
        personalInfo: {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address
        }
      };

      const response = await audienceRegistrationsAPI.createOrder(registrationData);

      console.log('Registration API Response:', response);

      if (response.success) {
        console.log('Payment required:', response.data.payment.required);
        console.log('Payment amount:', response.data.payment.amount);
        
        if (response.data.payment.required) {
          // Handle payment
          setLoading(false); // Stop loading before opening payment modal
          await handlePayment(response.data);
        } else {
          // Free registration - show success message
          toast.success(
            `🎉 Registration Successful!\n\nTicket #${response.data.registration.ticketNumber}\n\nA confirmation email has been sent to ${formData.email}`,
            { duration: 6000 }
          );
          
          // Reset form
          setFormData({
            name: '',
            address: '',
            phoneNumber: '',
            email: ''
          });
          
          // Navigate back after a short delay
          setTimeout(() => {
            navigate(-1);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuidelinesAccept = () => {
    setShowGuidelines(false);
    toast.success('Guidelines accepted. Please complete the registration form.');
  };

  const handleGuidelinesClose = () => {
    // If user closes without accepting, go back
    navigate(-1);
  };

  // Show guidelines popup first
  if (showGuidelines) {
    return (
      <GuidelinesPopup 
        onClose={handleGuidelinesClose}
        onAccept={handleGuidelinesAccept}
      />
    );
  }

  // Show form after guidelines are accepted
  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>Audience Registration</h2>
            <button onClick={() => navigate(-1)} style={styles.closeBtn}>×</button>
          </div>

          <div style={styles.content}>
            <div style={styles.formSection}>
              <div style={styles.iconHeader}>
                <div style={styles.iconCircle}>
                  <FiUser size={32} />
                </div>
                <p style={styles.subtitle}>Register as an audience member for {event?.title || 'this event'}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FiUser size={16} style={styles.labelIcon} />
                    Full Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    className="audience-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FiMail size={16} style={styles.labelIcon} />
                    Email Address <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    className="audience-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FiPhone size={16} style={styles.labelIcon} />
                    Phone Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    className="audience-input"
                    placeholder="+91 98698 35356"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FiMapPin size={16} style={styles.labelIcon} />
                    Address <span style={styles.required}>*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    className="audience-input"
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={styles.registerButton}
                  className="register-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .audience-input:focus {
            border-color: #ff4757 !important;
            box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
            outline: none;
          }
          
          .register-btn:hover {
            background-color: #ff3545 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
          }
          
          .audience-form-close:hover {
            background-color: #1a1a1a;
            color: #fff;
          }

          @media (max-width: 768px) {
            .modal {
              margin: 20px;
              max-width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    backgroundColor: '#0a0a0a',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    border: '1px solid #222',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #222'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#aaa',
    cursor: 'pointer',
    padding: '0',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  content: {
    padding: '30px'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  iconHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px'
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    border: '2px solid #ff4757',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ff4757'
  },
  subtitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#aaa',
    textAlign: 'center',
    lineHeight: '1.5'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  labelIcon: {
    color: '#ff4757'
  },
  required: {
    color: '#ff4757'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
  },
  textarea: {
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease'
  },
  registerButton: {
    width: '100%',
    padding: '16px 32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};

export default AudienceForm;