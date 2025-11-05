import React, { useState } from 'react';
import api from '../services/api';

const TicketPreview = () => {
  const [ticketType, setTicketType] = useState('ride');
  const [loading, setLoading] = useState(false);
  const [ticketImage, setTicketImage] = useState(null);
  const [error, setError] = useState('');

  const generatePreview = async () => {
    setLoading(true);
    setError('');
    setTicketImage(null);

    try {
      const response = await api.post('/test/generate-ticket-preview', {
        type: ticketType
      });

      setTicketImage(response.data.data.imageData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!ticketImage) return;

    const link = document.createElement('a');
    link.href = ticketImage;
    link.download = `ticket-preview-${ticketType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🎟️ Ticket Preview Generator</h2>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Type
            </label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="ride">🏍️ Ride Ticket</option>
              <option value="event">🎉 Event Ticket</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generatePreview}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Preview'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Ticket Preview */}
        {ticketImage && !loading && (
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <img
                src={ticketImage}
                alt="Ticket Preview"
                className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadTicket}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all active:scale-95"
              >
                📥 Download Ticket
              </button>

              <button
                onClick={() => setTicketImage(null)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all active:scale-95"
              >
                🔄 Clear
              </button>
            </div>

            <div className="text-sm text-gray-600 text-center">
              <p>✅ This is a preview of how your ticket will look</p>
              <p className="mt-1">📱 Actual tickets are sent via WhatsApp after successful booking</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Tickets</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Tickets are automatically sent via WhatsApp after successful payment</li>
            <li>Each ticket includes a unique QR code for verification</li>
            <li>Tickets show all booking details: name, date, venue, and payment info</li>
            <li>You can resend tickets anytime from your booking history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TicketPreview;
