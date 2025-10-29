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
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    const agreements = ['foodAndRefreshments', 'informationAccuracy', 'noContrabands', 'rulesAndRegulations'];
    
    for (const agreement of agreements) {
      if (!formData[agreement]) {
        toast.error('Please accept all required agreements');
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Validate contact numbers (basic validation for 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.contactNumber.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid 10-digit contact number');
      return false;
    }
    
    if (!phoneRegex.test(formData.emergencyContactNumber.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid 10-digit emergency contact number');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const groupSize = bookingType === 'group' ? formData.groupMembers.length : 1;
    const basePrice = event?.pricing?.basePrice || event?.price || 0;
    const subtotal = basePrice * groupSize;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to book this event');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare booking data - send only what backend expects
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

      // Note: Backend doesn't support group bookings and coupons for events yet
      // These features are only available for rides

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
              {/* Booking Type Selector */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Booking Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleBookingTypeChange('individual')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      bookingType === 'individual'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <FiUser className="mx-auto text-3xl mb-2" style={{ color: bookingType === 'individual' ? '#ff4757' : '#666' }} />
                    <p className="font-semibold text-gray-800">Individual</p>
                    <p className="text-sm text-gray-600">Solo participant</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBookingTypeChange('group')}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      bookingType === 'group'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <FiUsers className="mx-auto text-3xl mb-2" style={{ color: bookingType === 'group' ? '#ff4757' : '#666' }} />
                    <p className="font-semibold text-gray-800">Group</p>
                    <p className="text-sm text-gray-600">2+ members</p>
                  </button>
                </div>
              </div>

              {/* Group Members Section */}
              {bookingType === 'group' && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Group Information</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      name="groupName"
                      value={formData.groupName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter group name"
                    />
                  </div>

                  <h4 className="text-md font-semibold mb-3 text-gray-800">Group Members ({formData.groupMembers.length})</h4>
                  {formData.groupMembers.map((member, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-800">Member {index + 1}</h5>
                        {formData.groupMembers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeGroupMember(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX size={20} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                          <input
                            type="tel"
                            value={member.contactNumber}
                            onChange={(e) => handleGroupMemberChange(index, 'contactNumber', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bike Number *</label>
                          <input
                            type="text"
                            value={member.motorcycleNumber}
                            onChange={(e) => handleGroupMemberChange(index, 'motorcycleNumber', e.target.value.toUpperCase())}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="MH01AB1234"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bike Model *</label>
                          <input
                            type="text"
                            value={member.motorcycleModel}
                            onChange={(e) => handleGroupMemberChange(index, 'motorcycleModel', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Royal Enfield Classic 350"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addGroupMember}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-red-500 hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Member
                  </button>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  {bookingType === 'group' ? 'Group Leader Information' : 'Personal Information'}
                </h3>
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
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Summary</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium text-gray-800">{event?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-800">{new Date(event?.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-800">{event?.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Type:</span>
                    <span className="text-gray-800 font-medium">
                      {bookingType === 'group' ? `Group (${formData.groupMembers.length} members)` : 'Individual'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="text-gray-800">₹{event?.pricing?.basePrice || event?.price || 0}</span>
                    </div>
                    
                    {bookingType === 'group' && (
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600">Group size:</span>
                        <span className="text-gray-800">{formData.groupMembers.length} participants</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-800 font-medium">₹{calculateTotal().subtotal}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between mt-2 text-green-600">
                        <span>Discount ({appliedCoupon.coupon?.code || couponCode}):</span>
                        <span className="font-medium">-₹{calculateTotal().discount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold text-gray-800">Total Amount:</span>
                      <span className="font-bold text-red-500">₹{calculateTotal().total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              {!appliedCoupon ? (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold mb-3 text-gray-800">Have a Coupon Code?</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter coupon code"
                      disabled={validatingCoupon}
                    />
                    <button
                      onClick={validateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {validatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">Coupon Applied!</p>
                      <p className="text-sm text-green-600">You saved ₹{calculateTotal().discount}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You will be redirected to Razorpay payment gateway to complete your payment securely.
                </p>
              </div>

              {/* Payment Button */}
              <div className="text-center">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all"
                >
                  {loading ? 'Processing...' : `Pay ₹${calculateTotal().total}`}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">
                <FiCheck className="mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-2">
                Your {bookingType === 'group' ? 'group ' : ''}booking for <strong>{event?.title}</strong> has been confirmed.
              </p>
              {bookingType === 'group' && (
                <p className="text-gray-600 mb-4">
                  Total participants: <strong>{formData.groupMembers.length}</strong>
                </p>
              )}
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to <strong>{formData.email}</strong>
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