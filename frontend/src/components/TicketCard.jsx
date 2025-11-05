import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const TicketCard = ({ booking, type = 'ride' }) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleResendTicket = async () => {
    setIsResending(true);
    setMessage({ text: '', type: '' });

    try {
      const endpoint = type === 'event' 
        ? `/event-bookings/${booking._id}/resend-ticket`
        : `/bookings/${booking._id}/resend-ticket`;
      
      const response = await api.post(endpoint);
      
      setMessage({
        text: `✅ Ticket sent to ${response.data.data.phoneNumber}`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to send ticket. Please try again.',
        type: 'error'
      });
    } finally {
      setIsResending(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">
              {type === 'event' ? '🎉 Event Ticket' : '🏍️ Ride Ticket'}
            </h3>
            <p className="text-sm opacity-90 mt-1">Booking #{booking.bookingNumber}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Event/Ride Details */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            {type === 'event' ? booking.event?.title : booking.ride?.title}
          </h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="font-semibold mr-2">📍</span>
              <span>{type === 'event' ? booking.event?.location : booking.ride?.venue}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold mr-2">📅</span>
              <span>
                {type === 'event' 
                  ? formatDate(booking.event?.startDate)
                  : formatDate(booking.ride?.startTime)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Booking Type</p>
              <p className="font-semibold text-gray-800 capitalize">
                {booking.bookingType}
                {booking.bookingType === 'group' && ` (${booking.groupInfo?.groupSize})`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Amount Paid</p>
              <p className="font-semibold text-gray-800">₹{booking.amount}</p>
            </div>
          </div>

          {booking.personalInfo && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm">Booked by</p>
              <p className="font-semibold text-gray-800">{booking.personalInfo.fullName}</p>
            </div>
          )}

          {booking.motorcycleInfo && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm">Motorcycle</p>
              <p className="font-semibold text-gray-800">
                {booking.motorcycleInfo.modelName} - {booking.motorcycleInfo.motorcycleNumber}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {booking.status === 'paid' && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleResendTicket}
              disabled={isResending}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                isResending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Send Ticket via WhatsApp
                </>
              )}
            </button>

            {/* Message Display */}
            {message.text && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <p className="text-xs text-gray-500 text-center mt-3">
              Your ticket will be sent to {booking.personalInfo?.contactNumber}
            </p>
          </div>
        )}

        {/* Booking Date */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Booked on {formatDate(booking.createdAt)}
        </div>
      </div>
    </div>
  );
};

TicketCard.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    bookingNumber: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    bookingType: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    personalInfo: PropTypes.shape({
      fullName: PropTypes.string,
      contactNumber: PropTypes.string
    }),
    motorcycleInfo: PropTypes.shape({
      modelName: PropTypes.string,
      motorcycleNumber: PropTypes.string
    }),
    groupInfo: PropTypes.shape({
      groupSize: PropTypes.number
    }),
    ride: PropTypes.shape({
      title: PropTypes.string,
      venue: PropTypes.string,
      startTime: PropTypes.string
    }),
    event: PropTypes.shape({
      title: PropTypes.string,
      location: PropTypes.string,
      startDate: PropTypes.string
    })
  }).isRequired,
  type: PropTypes.oneOf(['ride', 'event'])
};

export default TicketCard;
