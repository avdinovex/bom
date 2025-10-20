import React, { useState } from 'react';
import { FiUser, FiCreditCard, FiCheck, FiArrowLeft, FiArrowRight, FiLogIn } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EventBookingForm = ({ event, onClose, onSuccess }) => {
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
    
    const agreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }
    
    for (const agreement of agreements) {
      if (!formData[agreement]) {
        return `Please accept all required agreements`;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    // Validate contact numbers (basic validation for 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid 10-digit contact number';
    }
    
    if (!phoneRegex.test(formData.emergencyContactNumber.replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid 10-digit emergency contact number';
    }
    
    return null;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const validationError = validateStep1();
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to book this event');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare booking data
      const bookingData = {
        eventId: event._id,
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

      // Create booking order
      const response = await api.post('/event-bookings/create-order', bookingData);
      const { booking, razorpayOrder, event: eventData } = response.data.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Brotherhood of Mumbai',
        description: `Event Booking - ${eventData.title}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/event-bookings/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Event booking confirmed successfully!');
            setCurrentStep(3);
            
            if (onSuccess) {
              onSuccess(verifyResponse.data.data);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.contactNumber
        },
        theme: {
          color: '#ff4757'
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FiLogIn className="mx-auto text-6xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to book events. Please login or register to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Book Event</h2>
              <p className="opacity-90">{event?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                    ${currentStep >= step.number 
                      ? 'bg-white text-red-500 border-white' 
                      : 'border-red-200 text-red-200'
                    }`}>
                    <step.icon size={20} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-white' : 'text-red-200'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-white' : 'bg-red-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
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
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Motorcycle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motorcycle Model *
                    </label>
                    <input
                      type="text"
                      name="motorcycleModelName"
                      value={formData.motorcycleModelName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., Honda CB650F"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motorcycle Number *
                    </label>
                    <input
                      type="text"
                      name="motorcycleNumber"
                      value={formData.motorcycleNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., MH01AB1234"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactPersonName"
                      value={formData.emergencyContactPersonName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Medical Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History / Allergies / Medications *
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide any relevant medical history, allergies, or medications. Write 'None' if not applicable."
                    required
                  />
                </div>
              </div>

              {/* Agreements */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Terms & Agreements</h3>
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="foodAndRefreshments"
                      checked={formData.foodAndRefreshments}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I understand that food and refreshments will be provided as per the event schedule and dietary restrictions should be communicated in advance.
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="informationAccuracy"
                      checked={formData.informationAccuracy}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I confirm that all information provided is accurate and complete to the best of my knowledge.
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="noContrabands"
                      checked={formData.noContrabands}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I agree not to carry any contraband items, illegal substances, or prohibited materials during the event.
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="rulesAndRegulations"
                      checked={formData.rulesAndRegulations}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      required
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I agree to follow all event rules and regulations, safety guidelines, and instructions from event organizers.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
                <div className="text-left max-w-md mx-auto space-y-2">
                  <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-medium">{event?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(event?.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{event?.location}</span>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{event?.price}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : `Pay ₹${event?.price}`}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">
                <FiCheck className="mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your event booking has been successfully confirmed. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={onClose}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        {currentStep < 3 && (
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <FiArrowLeft className="mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            {currentStep < 2 && (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Next
                <FiArrowRight className="ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookingForm;