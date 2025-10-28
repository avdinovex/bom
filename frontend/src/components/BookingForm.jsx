import React, { useState } from 'react';
import { FiUser, FiCreditCard, FiCheck, FiArrowLeft, FiArrowRight, FiUsers, FiX, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BookingForm = ({ ride, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    motorcycleModelName: '',
    motorcycleNumber: '',
    emergencyContactPersonName: '',
    emergencyContactNumber: '',
    medicalHistory: '',
    groupName: '',
    groupMembers: [],
    foodAndRefreshments: false,
    informationAccuracy: false,
    noContrabands: false,
    rulesAndRegulations: false
  });

  const steps = [
    { number: 1, title: bookingType === 'group' ? 'Group Details' : 'Personal Details', icon: bookingType === 'group' ? FiUsers : FiUser },
    { number: 2, title: 'Payment', icon: FiCreditCard },
    { number: 3, title: 'Confirmation', icon: FiCheck }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    setAppliedCoupon(null);
    setCouponCode('');
    if (type === 'group' && formData.groupMembers.length === 0) {
      setFormData(prev => ({
        ...prev,
        groupMembers: [
          { name: '', contactNumber: '', motorcycleNumber: '', motorcycleModel: '' },
          { name: '', contactNumber: '', motorcycleNumber: '', motorcycleModel: '' }
        ]
      }));
    }
  };

  const handleGroupMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addGroupMember = () => {
    if (formData.groupMembers.length >= 20) {
      toast.error('Maximum 20 members allowed per group');
      return;
    }
    setFormData(prev => ({
      ...prev,
      groupMembers: [...prev.groupMembers, { name: '', contactNumber: '', motorcycleNumber: '', motorcycleModel: '' }]
    }));
  };

  const removeGroupMember = (index) => {
    if (formData.groupMembers.length <= 2) {
      toast.error('Group must have at least 2 members');
      return;
    }
    setFormData(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((_, i) => i !== index)
    }));
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const groupSize = bookingType === 'group' ? formData.groupMembers.length : 1;
      const response = await api.post('/bookings/validate-coupon', {
        couponCode: couponCode.trim(),
        rideId: ride._id,
        bookingType,
        groupSize
      });

      setAppliedCoupon(response.data.data);
      toast.success(`Coupon applied! You save ₹${response.data.data.discountAmount}`);
    } catch (error) {
      setAppliedCoupon(null);
      
      // Handle specific error cases with appropriate toast messages
      const errorMessage = error.response?.data?.message || 'Failed to validate coupon';
      const statusCode = error.response?.status;
      
      if (statusCode === 404 || errorMessage.toLowerCase().includes('invalid coupon')) {
        toast.error('Coupon not found. Please check the code and try again.');
      } else if (errorMessage.toLowerCase().includes('expired')) {
        toast.error('This coupon has expired.');
      } else if (errorMessage.toLowerCase().includes('not active')) {
        toast.error('This coupon is currently not active.');
      } else if (errorMessage.toLowerCase().includes('usage limit')) {
        toast.error('This coupon has reached its usage limit.');
      } else if (errorMessage.toLowerCase().includes('already used')) {
        toast.error('You have already used this coupon.');
      } else if (errorMessage.toLowerCase().includes('minimum order amount')) {
        toast.error(errorMessage);
      } else if (errorMessage.toLowerCase().includes('minimum group size')) {
        toast.error(errorMessage);
      } else if (errorMessage.toLowerCase().includes('maximum group size')) {
        toast.error(errorMessage);
      } else if (errorMessage.toLowerCase().includes('only applicable for')) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const validateStep1 = () => {
    const requiredFields = [
      'email', 'fullName', 'address', 'contactNumber', 'gender', 
      'dateOfBirth', 'bloodGroup', 'motorcycleModelName', 'motorcycleNumber',
      'emergencyContactPersonName', 'emergencyContactNumber', 'medicalHistory'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (bookingType === 'group') {
      if (!formData.groupName.trim()) {
        toast.error('Please enter group name');
        return false;
      }
      
      if (formData.groupMembers.length < 2) {
        toast.error('Group must have at least 2 members');
        return false;
      }

      for (let i = 0; i < formData.groupMembers.length; i++) {
        const member = formData.groupMembers[i];
        if (!member.name || !member.contactNumber || !member.motorcycleNumber || !member.motorcycleModel) {
          toast.error(`Please fill all details for member ${i + 1}`);
          return false;
        }
      }
    }
    
    const requiredAgreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
    const uncheckedAgreements = requiredAgreements.filter(field => !formData[field]);
    
    if (uncheckedAgreements.length > 0) {
      toast.error('Please agree to all terms and conditions');
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2) {
      handlePayment();
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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

  const calculateTotal = () => {
    const groupSize = bookingType === 'group' ? formData.groupMembers.length : 1;
    const subtotal = ride.price * groupSize;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const bookingData = {
        rideId: ride._id,
        bookingType,
        personalInfo: {
          email: formData.email,
          fullName: formData.fullName,
          address: formData.address,
          contactNumber: formData.contactNumber,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          bloodGroup: formData.bloodGroup
        },
        motorcycleInfo: {
          modelName: formData.motorcycleModelName,
          motorcycleNumber: formData.motorcycleNumber
        },
        emergencyContact: {
          personName: formData.emergencyContactPersonName,
          number: formData.emergencyContactNumber
        },
        medicalHistory: formData.medicalHistory,
        agreements: {
          foodAndRefreshments: formData.foodAndRefreshments,
          informationAccuracy: formData.informationAccuracy,
          noContrabands: formData.noContrabands,
          rulesAndRegulations: formData.rulesAndRegulations
        }
      };

      if (bookingType === 'group') {
        bookingData.groupInfo = {
          groupName: formData.groupName,
          members: formData.groupMembers
        };
      }

      if (appliedCoupon) {
        // appliedCoupon structure: { coupon: { code, ... }, originalAmount, discountAmount, finalAmount }
        const couponCodeToSend = appliedCoupon.coupon?.code || couponCode.trim().toUpperCase();
        bookingData.couponCode = couponCodeToSend;
      }

      const orderResponse = await api.post('/bookings/create-order', bookingData);
      const { booking, razorpayOrder, ride: rideData } = orderResponse.data.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'BOM - Bikers Of Mumbai',
        description: `${bookingType === 'group' ? 'Group ' : ''}Booking for ${rideData.title}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const verificationResponse = await api.post('/bookings/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful! Booking confirmed.');
            setCurrentStep(3);
            onSuccess && onSuccess(verificationResponse.data);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment verification error:', error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.contactNumber
        },
        notes: {
          rideId: ride._id,
          rideTitle: rideData.title,
          bookingType,
          groupSize: bookingType === 'group' ? formData.groupMembers.length : 1
        },
        theme: {
          color: '#ff4757',
          backdrop_color: '#000000'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setLoading(false);
          },
          confirm_close: true,
          escape: false,
          animation: true
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBookingTypeSelector = () => (
    <div style={styles.bookingTypeContainer}>
      <h3 style={styles.sectionTitle}>Select Booking Type</h3>
      <div style={styles.bookingTypeButtons}>
        <button
          type="button"
          onClick={() => handleBookingTypeChange('individual')}
          style={{
            ...styles.bookingTypeButton,
            ...(bookingType === 'individual' ? styles.bookingTypeButtonActive : {})
          }}
        >
          <FiUser size={24} />
          <span style={styles.bookingTypeButtonText}>Individual</span>
          <span style={styles.bookingTypeDesc}>Solo rider</span>
        </button>
        <button
          type="button"
          onClick={() => handleBookingTypeChange('group')}
          style={{
            ...styles.bookingTypeButton,
            ...(bookingType === 'group' ? styles.bookingTypeButtonActive : {})
          }}
        >
          <FiUsers size={24} />
          <span style={styles.bookingTypeButtonText}>Group</span>
          <span style={styles.bookingTypeDesc}>2+ members</span>
        </button>
      </div>
    </div>
  );

  const renderGroupMembersSection = () => (
    <div style={styles.groupSection}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Group Name <span style={styles.required}>*</span></label>
        <input
          type="text"
          name="groupName"
          value={formData.groupName}
          onChange={handleInputChange}
          style={styles.input}
          placeholder="Enter group name"
        />
      </div>

      <h4 style={styles.subSectionTitle}>Group Members ({formData.groupMembers.length})</h4>
      {formData.groupMembers.map((member, index) => (
        <div key={index} style={styles.memberCard}>
          <div style={styles.memberHeader}>
            <h5 style={styles.memberTitle}>Member {index + 1}</h5>
            {formData.groupMembers.length > 2 && (
              <button
                type="button"
                onClick={() => removeGroupMember(index)}
                style={styles.removeMemberButton}
              >
                <FiX />
              </button>
            )}
          </div>
          
          <div style={styles.memberGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                style={styles.input}
                placeholder="Full name"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact *</label>
              <input
                type="tel"
                value={member.contactNumber}
                onChange={(e) => handleGroupMemberChange(index, 'contactNumber', e.target.value)}
                style={styles.input}
                placeholder="Phone number"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bike Number *</label>
              <input
                type="text"
                value={member.motorcycleNumber}
                onChange={(e) => handleGroupMemberChange(index, 'motorcycleNumber', e.target.value.toUpperCase())}
                style={styles.input}
                placeholder="MH01AB1234"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bike Model *</label>
              <input
                type="text"
                value={member.motorcycleModel}
                onChange={(e) => handleGroupMemberChange(index, 'motorcycleModel', e.target.value)}
                style={styles.input}
                placeholder="Royal Enfield Classic 350"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addGroupMember}
        style={styles.addMemberButton}
      >
        <FiPlus /> Add Member
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div style={styles.stepContent}>
      {renderBookingTypeSelector()}

      {bookingType === 'group' && renderGroupMembersSection()}

      <h3 style={styles.sectionTitle}>{bookingType === 'group' ? 'Group Leader Information' : 'Personal Information'}</h3>
      
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Your full name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email <span style={styles.required}>*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="your.email@example.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Contact Number <span style={styles.required}>*</span></label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="+91 98765 43210"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Gender <span style={styles.required}>*</span></label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            style={styles.select}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Date of Birth <span style={styles.required}>*</span></label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Blood Group <span style={styles.required}>*</span></label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleInputChange}
            style={styles.select}
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Address <span style={styles.required}>*</span></label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          style={styles.textarea}
          placeholder="Your full address"
          rows="3"
        />
      </div>

      <h3 style={styles.sectionTitle}>{bookingType === 'group' ? 'Leader\'s Motorcycle Information' : 'Motorcycle Information'}</h3>
      
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Motorcycle Model <span style={styles.required}>*</span></label>
          <input
            type="text"
            name="motorcycleModelName"
            value={formData.motorcycleModelName}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="e.g., Royal Enfield Classic 350"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Motorcycle Number <span style={styles.required}>*</span></label>
          <input
            type="text"
            name="motorcycleNumber"
            value={formData.motorcycleNumber}
            onChange={(e) => {
              const { name, value } = e.target;
              setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
              }));
            }}
            style={styles.input}
            placeholder="MH01AB1234"
          />
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Emergency Contact</h3>
      
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Contact Person Name <span style={styles.required}>*</span></label>
          <input
            type="text"
            name="emergencyContactPersonName"
            value={formData.emergencyContactPersonName}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Emergency contact name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Contact Number <span style={styles.required}>*</span></label>
          <input
            type="tel"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Medical Information</h3>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>Medical History <span style={styles.required}>*</span></label>
        <textarea
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={handleInputChange}
          style={styles.textarea}
          placeholder="Any medical conditions, allergies, or medications we should know about (or write 'None')"
          rows="3"
        />
      </div>

      <h3 style={styles.sectionTitle}>Terms & Agreements</h3>
      
      <div style={styles.agreementsSection}>
        {[
          { key: 'foodAndRefreshments', label: 'I will arrange my own food and refreshments during the ride' },
          { key: 'informationAccuracy', label: 'I confirm that all information provided is accurate' },
          { key: 'noContrabands', label: 'I will not carry any contraband items during the ride' },
          { key: 'rulesAndRegulations', label: 'I agree to follow all rules and regulations of the ride' }
        ].map(({ key, label }) => (
          <label key={key} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={key}
              checked={formData[key]}
              onChange={handleInputChange}
              style={styles.checkbox}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const { subtotal, discount, total } = calculateTotal();

    return (
      <div style={styles.stepContent}>
        <h3 style={styles.sectionTitle}>Payment Summary</h3>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Booking Type:</span>
            <span style={styles.summaryValue}>
              {bookingType === 'group' ? `Group (${formData.groupMembers.length} members)` : 'Individual'}
            </span>
          </div>
          
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Price per person:</span>
            <span style={styles.summaryValue}>₹{ride.price}</span>
          </div>

          {bookingType === 'group' && (
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Group size:</span>
              <span style={styles.summaryValue}>{formData.groupMembers.length} riders</span>
            </div>
          )}

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal:</span>
            <span style={styles.summaryValue}>₹{subtotal}</span>
          </div>

          {appliedCoupon && (
            <>
              <div style={{...styles.summaryRow, color: '#4CAF50'}}>
                <span style={styles.summaryLabel}>
                  Discount ({appliedCoupon.coupon?.code || couponCode}):
                </span>
                <span style={styles.summaryValue}>-₹{discount}</span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                style={styles.removeCouponButton}
              >
                Remove Coupon
              </button>
            </>
          )}

          <div style={{...styles.summaryRow, ...styles.totalRow}}>
            <span style={styles.totalLabel}>Total Amount:</span>
            <span style={styles.totalValue}>₹{total}</span>
          </div>
        </div>

        {!appliedCoupon && (
          <div style={styles.couponSection}>
            <h4 style={styles.couponTitle}>Have a Coupon Code?</h4>
            <div style={styles.couponInputGroup}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={styles.couponInput}
                placeholder="Enter coupon code"
                disabled={validatingCoupon}
              />
              <button
                type="button"
                onClick={validateCoupon}
                style={styles.applyCouponButton}
                disabled={validatingCoupon || !couponCode.trim()}
              >
                {validatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>Note:</strong> You will be redirected to Razorpay payment gateway to complete your payment securely.
          </p>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div style={styles.successContent}>
      <div style={styles.successIcon}>
        <FiCheck size={64} />
      </div>
      <h2 style={styles.successTitle}>Booking Confirmed!</h2>
      <p style={styles.successText}>
        Your {bookingType === 'group' ? 'group ' : ''}booking for <strong>{ride.title}</strong> has been confirmed.
        {bookingType === 'group' && ` Total riders: ${formData.groupMembers.length}`}
      </p>
      <p style={styles.successSubText}>
        A confirmation email has been sent to <strong>{formData.email}</strong>
      </p>
      <button onClick={onClose} style={styles.closeButton}>
        Close
      </button>
    </div>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Book Your Ride</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.progressBar}>
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                ...styles.progressStep,
                ...(currentStep >= step.number ? styles.progressStepActive : {}),
                ...(currentStep === step.number ? styles.progressStepCurrent : {})
              }}
            >
              <div style={styles.progressStepIcon}>
                <step.icon />
              </div>
              <span style={styles.progressStepText}>{step.title}</span>
            </div>
          ))}
        </div>

        <div style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {currentStep < 3 && (
          <div style={styles.footer}>
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                style={styles.backButton}
                disabled={loading}
              >
                <FiArrowLeft /> Back
              </button>
            )}
            <button
              onClick={nextStep}
              style={styles.nextButton}
              disabled={loading}
            >
              {loading ? 'Processing...' : currentStep === 2 ? 'Proceed to Payment' : 'Next'}
              {!loading && currentStep < 2 && <FiArrowRight />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    backgroundColor: '#0a0a0a',
    borderRadius: '12px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #222'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    borderBottom: '1px solid #222'
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    color: '#aaa',
    cursor: 'pointer',
    padding: '0',
    width: '35px',
    height: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  progressBar: {
    display: 'flex',
    padding: '20px 25px',
    gap: '15px',
    borderBottom: '1px solid #222'
  },
  progressStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    opacity: 0.5,
    transition: 'opacity 0.3s ease'
  },
  progressStepActive: {
    opacity: 1
  },
  progressStepCurrent: {
    opacity: 1
  },
  progressStepIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.2rem'
  },
  progressStepText: {
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '25px 30px'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  bookingTypeContainer: {
    marginBottom: '10px'
  },
  bookingTypeButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '12px'
  },
  bookingTypeButton: {
    padding: '25px 20px',
    borderRadius: '8px',
    border: '2px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    fontSize: '1rem'
  },
  bookingTypeButtonActive: {
    borderColor: '#ff4757',
    backgroundColor: 'rgba(255, 71, 87, 0.1)'
  },
  bookingTypeButtonText: {
    fontWeight: '600',
    fontSize: '1.15rem'
  },
  bookingTypeDesc: {
    fontSize: '0.85rem',
    color: '#aaa'
  },
  groupSection: {
    backgroundColor: '#111',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #222',
    marginBottom: '10px'
  },
  memberCard: {
    backgroundColor: '#1a1a1a',
    padding: '18px',
    borderRadius: '6px',
    marginBottom: '15px',
    border: '1px solid #333'
  },
  memberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  memberTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600'
  },
  removeMemberButton: {
    background: 'none',
    border: 'none',
    color: '#ff4757',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '18px'
  },
  addMemberButton: {
    padding: '12px 20px',
    borderRadius: '6px',
    border: '2px dashed #333',
    backgroundColor: 'transparent',
    color: '#ff4757',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    marginTop: '10px'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#fff',
    paddingBottom: '10px',
    borderBottom: '2px solid #222'
  },
  subSectionTitle: {
    margin: '15px 0 15px 0',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#fff'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff'
  },
  required: {
    color: '#ff4757'
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  select: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer'
  },
  textarea: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  agreementsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #222'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  checkbox: {
    marginTop: '3px',
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  summaryCard: {
    backgroundColor: '#111',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #222'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    borderBottom: '1px solid #222'
  },
  summaryLabel: {
    color: '#aaa',
    fontSize: '0.95rem'
  },
  summaryValue: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600'
  },
  totalRow: {
    borderBottom: 'none',
    borderTop: '2px solid #333',
    marginTop: '10px',
    paddingTop: '20px'
  },
  totalLabel: {
    color: '#fff',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  totalValue: {
    color: '#ff4757',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  couponSection: {
    backgroundColor: '#111',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #222'
  },
  couponTitle: {
    margin: '0 0 18px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff'
  },
  couponInputGroup: {
    display: 'flex',
    gap: '10px'
  },
  couponInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  applyCouponButton: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  removeCouponButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ff4757',
    backgroundColor: 'transparent',
    color: '#ff4757',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s ease'
  },
  infoBox: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    border: '1px solid #ff4757',
    borderRadius: '6px',
    padding: '15px'
  },
  infoText: {
    margin: 0,
    color: '#fff',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center'
  },
  successIcon: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginBottom: '20px'
  },
  successTitle: {
    margin: '0 0 15px 0',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  successText: {
    margin: '0 0 10px 0',
    fontSize: '1.1rem',
    color: '#aaa',
    lineHeight: '1.6'
  },
  successSubText: {
    margin: '0 0 30px 0',
    fontSize: '0.95rem',
    color: '#aaa'
  },
  closeButton: {
    padding: '14px 40px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 30px',
    borderTop: '1px solid #222'
  },
  backButton: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: '1px solid #555',
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  nextButton: {
    padding: '12px 24px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ff4757',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    marginLeft: 'auto'
  }
};

export default BookingForm;
