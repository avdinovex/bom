import React, { useState } from 'react';
import { FiUser, FiCreditCard, FiCheck, FiArrowLeft, FiArrowRight, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BookingForm = ({ ride, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    email: '',
    fullName: '',
    address: '',
    contactNumber: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    
    // Motorcycle Information
    motorcycleModelName: '',
    motorcycleNumber: '',
    
    // Emergency Contact
    emergencyContactPersonName: '',
    emergencyContactNumber: '',
    
    // Medical Information
    medicalHistory: '',
    
    // Agreements
    foodAndRefreshments: false,
    informationAccuracy: false,
    noContrabands: false,
    rulesAndRegulations: false
  });

  const steps = [
    { number: 1, title: 'Personal Details', icon: FiUser },
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
    
    // Validate agreements
    const requiredAgreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
    const uncheckedAgreements = requiredAgreements.filter(field => !formData[field]);
    
    if (uncheckedAgreements.length > 0) {
      toast.error('Please agree to all terms and conditions');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    // Payment validation will be handled by Razorpay
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2) {
      // Step 2 is payment, handle it differently
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

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create booking order with Razorpay
      const bookingData = {
        rideId: ride._id,
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

      const orderResponse = await api.post('/bookings/create-order', bookingData);
      const { booking, razorpayOrder, ride: rideData } = orderResponse.data.data;

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Configure Razorpay options
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'BOM - Bikers Of Mumbai',
        description: `Booking for ${rideData.title}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            setLoading(true);
            // Verify payment with backend
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
          rideTitle: rideData.title
        },
        theme: {
          color: '#dc2626', // Red theme to match app
          backdrop_color: '#000000'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled by user');
            setLoading(false);
          },
          confirm_close: true,
          animation: true,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes timeout
        remember_customer: false,
        readonly: {
          email: true,
          contact: true,
          name: true
        }
      };

      // Create Razorpay instance and open payment modal
      const razorpay = new window.Razorpay(options);
      
      // Add error handling for Razorpay
      razorpay.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        console.error('Payment failed:', response.error);
        setLoading(false);
      });

      razorpay.open();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking order');
      console.error('Payment initiation error:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // This function is now handled by step navigation and payment flow
    toast.success('Booking confirmed successfully!');
    onClose && onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contact No (WhatsApp no) *
            </label>
            <input
              type="tel"
              name="contactNumber"
              required
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date Of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              required
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Blood Group *
            </label>
            <select
              name="bloodGroup"
              required
              value={formData.bloodGroup}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Motorcycle Information */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Motorcycle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Motorcycle Model Name *
            </label>
            <input
              type="text"
              name="motorcycleModelName"
              required
              value={formData.motorcycleModelName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Motorcycle Number *
            </label>
            <input
              type="text"
              name="motorcycleNumber"
              required
              value={formData.motorcycleNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="e.g., MH01AB1234"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Emergency Contact Person Name *
            </label>
            <input
              type="text"
              name="emergencyContactPersonName"
              required
              value={formData.emergencyContactPersonName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Emergency Contact Number *
            </label>
            <input
              type="tel"
              name="emergencyContactNumber"
              required
              value={formData.emergencyContactNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Medical Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Previous Medical History In Last 6 Month? *
          </label>
          <textarea
            name="medicalHistory"
            required
            rows={3}
            value={formData.medicalHistory}
            onChange={handleInputChange}
            placeholder="Please describe any medical conditions, injuries, or treatments in the last 6 months. If none, please write 'None'."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Agreements */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Terms & Conditions</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="foodAndRefreshments"
              id="foodAndRefreshments"
              checked={formData.foodAndRefreshments}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-800 rounded"
            />
            <label htmlFor="foodAndRefreshments" className="text-sm text-gray-300">
              <strong className="text-white">Special Note:</strong> Any extra food & refreshments, beverages will be paid by own individuals. *
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="informationAccuracy"
              id="informationAccuracy"
              checked={formData.informationAccuracy}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-800 rounded"
            />
            <label htmlFor="informationAccuracy" className="text-sm text-gray-300">
              All the above information is true and I will be fully responsible for my safety during this ride. *
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="noContrabands"
              id="noContrabands"
              checked={formData.noContrabands}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-800 rounded"
            />
            <label htmlFor="noContrabands" className="text-sm text-gray-300">
              Unwanted Things like Drug another Contrabands Strictly Prohibited 🚭🚫 Like (Cocaine, Ganja). *
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="rulesAndRegulations"
              id="rulesAndRegulations"
              checked={formData.rulesAndRegulations}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 bg-gray-800 rounded"
            />
            <label htmlFor="rulesAndRegulations" className="text-sm text-gray-300">
              I agree with all the Rules & Regulations and am willing to pay the Ride fees mentioned above by BOM. *
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
        
        {/* Ride Details */}
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-white mb-2">Ride Details</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong className="text-white">Ride:</strong> {ride?.title}</p>
            <p><strong className="text-white">Date:</strong> {ride?.startTime ? new Date(ride.startTime).toLocaleDateString() : 'N/A'}</p>
            <p><strong className="text-white">Venue:</strong> {ride?.venue}</p>
            <p className="text-lg font-semibold text-green-400"><strong>Ride Fees: ₹{ride?.price || 0}</strong></p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-600/30 p-6 rounded-lg">
          <h4 className="font-semibold text-red-400 mb-4 flex items-center">
            <FiCreditCard className="mr-2" />
            Secure Payment Options
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">💳</div>
                <div className="text-xs text-gray-300">Credit/Debit Card</div>
              </div>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📱</div>
                <div className="text-xs text-gray-300">UPI</div>
              </div>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🏦</div>
                <div className="text-xs text-gray-300">Net Banking</div>
              </div>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📟</div>
                <div className="text-xs text-gray-300">Wallets</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-300 space-y-1">
              <p className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Secured by Razorpay Payment Gateway
              </p>
              <p className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                256-bit SSL Encryption
              </p>
              <p className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                PCI DSS Compliant
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-3">Payment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Ride Fee:</span>
              <span className="text-white">₹{ride?.price || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Payment Gateway Fee:</span>
              <span className="text-white">₹0</span>
            </div>
            <hr className="border-gray-600" />
            <div className="flex justify-between font-semibold">
              <span className="text-white">Total Amount:</span>
              <span className="text-green-400">₹{ride?.price || 0}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            Click "Proceed to Payment" to complete your booking securely
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-600/20 mb-4">
          <FiCheck className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-2">Payment Successful!</h3>
        <p className="text-gray-300">Your booking has been confirmed</p>
      </div>

      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-600/30 p-6 rounded-lg text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h4 className="font-semibold text-white mb-2">Booking Confirmed!</h4>
        <p className="text-gray-300 mb-4">
          You're all set for an amazing ride with BOM!
        </p>
        
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg mb-4">
          <h5 className="font-semibold text-white mb-2">Ride Details</h5>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong className="text-white">Ride:</strong> {ride?.title}</p>
            <p><strong className="text-white">Date:</strong> {ride?.startTime ? new Date(ride.startTime).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}</p>
            <p><strong className="text-white">Time:</strong> {ride?.startTime ? new Date(ride.startTime).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'}</p>
            <p><strong className="text-white">Venue:</strong> {ride?.venue}</p>
            <p><strong className="text-white">Amount Paid:</strong> <span className="text-green-400">₹{ride?.price || 0}</span></p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <p className="flex items-center justify-center">
            <span className="text-green-400 mr-2">✓</span>
            Booking confirmation sent to your email
          </p>
          <p className="flex items-center justify-center">
            <span className="text-green-400 mr-2">✓</span>
            Payment receipt will be shared shortly
          </p>
          <p className="flex items-center justify-center">
            <span className="text-green-400 mr-2">✓</span>
            Further details will be shared on WhatsApp
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
        <h4 className="font-semibold text-white mb-3">What's Next?</h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>1. Check your email for booking confirmation</p>
          <p>2. Join our WhatsApp group for ride updates</p>
          <p>3. Prepare your motorcycle and safety gear</p>
          <p>4. Arrive at the venue 15 minutes before start time</p>
        </div>
      </div>
    </div>
  );

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />
          
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-600/20 mb-4">
              <FiLogIn className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Login Required</h3>
            <p className="text-gray-300 mb-6">Please login to book this ride.</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClose();
                  // Navigate to general login page
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Book Your Ride</h2>
            <p className="text-sm text-gray-300">{ride?.title}</p>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isActive ? 'bg-red-600 text-white' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`ml-2 text-sm ${
                      isActive ? 'text-red-500 font-medium' :
                      isCompleted ? 'text-green-500' :
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`mx-4 h-px w-16 ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto bg-gray-900">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    'Processing...'
                  ) : currentStep === 2 ? (
                    <>
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Proceed to Payment
                    </>
                  ) : (
                    <>
                      Next
                      <FiArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;