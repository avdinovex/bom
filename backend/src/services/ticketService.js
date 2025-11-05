import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a ticket image with QR code for ride bookings
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Buffer>} - Image buffer
 */
export const generateRideTicket = async (bookingData) => {
  const {
    bookingNumber,
    userName,
    rideName,
    venue,
    startTime,
    amount,
    bookingType,
    groupSize,
    motorcycleInfo,
    qrData
  } = bookingData;

  // Canvas dimensions
  const width = 800;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Header section
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(0, 0, width, 150);
  
  // Logo/Brand Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('RIDE TICKET', width / 2, 70);
  
  ctx.font = '20px Arial';
  ctx.fillText('Band Of Mumbai', width / 2, 110);

  // Ticket type badge
  const badgeText = bookingType === 'group' ? `GROUP (${groupSize})` : 'INDIVIDUAL';
  ctx.fillStyle = '#00d9ff';
  ctx.fillRect(width - 180, 20, 160, 40);
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, width - 100, 45);

  // White content area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 180, width - 80, height - 240);

  // Border
  ctx.strokeStyle = '#ff6b35';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 180, width - 80, height - 240);

  // Content
  ctx.fillStyle = '#1a1a2e';
  ctx.textAlign = 'left';
  
  // Booking number
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Booking #${bookingNumber}`, 70, 230);
  
  // Separator line
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 250);
  ctx.lineTo(width - 70, 250);
  ctx.stroke();

  // User name (large and prominent)
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ff6b35';
  ctx.fillText(userName.toUpperCase(), 70, 300);

  ctx.fillStyle = '#1a1a2e';
  ctx.font = '20px Arial';
  let yPos = 350;

  // Ride details
  ctx.font = 'bold 18px Arial';
  ctx.fillText('RIDE DETAILS', 70, yPos);
  ctx.font = '18px Arial';
  yPos += 35;
  
  ctx.fillText(`📍 ${rideName}`, 70, yPos);
  yPos += 30;
  ctx.fillText(`🏁 ${venue}`, 70, yPos);
  yPos += 30;
  
  const dateTime = new Date(startTime).toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  ctx.fillText(`📅 ${dateTime}`, 70, yPos);
  yPos += 40;

  // Motorcycle info
  if (motorcycleInfo) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('MOTORCYCLE', 70, yPos);
    ctx.font = '18px Arial';
    yPos += 35;
    ctx.fillText(`🏍️ ${motorcycleInfo.modelName}`, 70, yPos);
    yPos += 30;
    ctx.fillText(`🔢 ${motorcycleInfo.motorcycleNumber}`, 70, yPos);
    yPos += 40;
  }

  // Payment info
  ctx.font = 'bold 18px Arial';
  ctx.fillText('PAYMENT', 70, yPos);
  ctx.font = '18px Arial';
  yPos += 35;
  ctx.fillText(`💰 Amount Paid: ₹${amount}`, 70, yPos);
  yPos += 50;

  // QR Code generation
  const qrCodeDataUrl = await QRCode.toDataURL(qrData || JSON.stringify({
    bookingNumber,
    userName,
    rideName,
    startTime,
    amount
  }), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 200,
    margin: 1,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff'
    }
  });

  // Load and draw QR code
  const qrImage = await loadImage(qrCodeDataUrl);
  const qrSize = 180;
  const qrX = (width - qrSize) / 2;
  const qrY = yPos;
  
  // QR code border
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  ctx.strokeStyle = '#ff6b35';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // QR code label
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Scan for verification', width / 2, qrY + qrSize + 30);

  // Footer
  ctx.fillStyle = '#999999';
  ctx.font = '12px Arial';
  ctx.fillText('This ticket is valid only with valid ID proof', width / 2, height - 40);
  ctx.fillText('Keep this ticket safe and show during check-in', width / 2, height - 20);

  return canvas.toBuffer('image/png');
};

/**
 * Generate a ticket image with QR code for event bookings
 * @param {Object} bookingData - Booking details
 * @returns {Promise<Buffer>} - Image buffer
 */
export const generateEventTicket = async (bookingData) => {
  const {
    bookingNumber,
    userName,
    eventName,
    location,
    startDate,
    endDate,
    amount,
    bookingType,
    groupSize,
    motorcycleInfo,
    qrData
  } = bookingData;

  // Canvas dimensions
  const width = 800;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f2027');
  gradient.addColorStop(0.5, '#203a43');
  gradient.addColorStop(1, '#2c5364');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Header section
  ctx.fillStyle = '#00d9ff';
  ctx.fillRect(0, 0, width, 150);
  
  // Logo/Brand Text
  ctx.fillStyle = '#0f2027';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('EVENT TICKET', width / 2, 70);
  
  ctx.font = '20px Arial';
  ctx.fillText('Band Of Mumbai', width / 2, 110);

  // Ticket type badge
  const badgeText = bookingType === 'group' ? `GROUP (${groupSize})` : 'INDIVIDUAL';
  ctx.fillStyle = '#ff6b35';
  ctx.fillRect(width - 180, 20, 160, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, width - 100, 45);

  // White content area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 180, width - 80, height - 240);

  // Border
  ctx.strokeStyle = '#00d9ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 180, width - 80, height - 240);

  // Content
  ctx.fillStyle = '#0f2027';
  ctx.textAlign = 'left';
  
  // Booking number
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Booking #${bookingNumber}`, 70, 230);
  
  // Separator line
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 250);
  ctx.lineTo(width - 70, 250);
  ctx.stroke();

  // User name (large and prominent)
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#00d9ff';
  ctx.fillText(userName.toUpperCase(), 70, 300);

  ctx.fillStyle = '#0f2027';
  ctx.font = '20px Arial';
  let yPos = 350;

  // Event details
  ctx.font = 'bold 18px Arial';
  ctx.fillText('EVENT DETAILS', 70, yPos);
  ctx.font = '18px Arial';
  yPos += 35;
  
  ctx.fillText(`🎉 ${eventName}`, 70, yPos);
  yPos += 30;
  ctx.fillText(`📍 ${location}`, 70, yPos);
  yPos += 30;
  
  const startDateTime = new Date(startDate).toLocaleString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  ctx.fillText(`📅 Start: ${startDateTime}`, 70, yPos);
  yPos += 30;

  if (endDate) {
    const endDateTime = new Date(endDate).toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    ctx.fillText(`🏁 End: ${endDateTime}`, 70, yPos);
    yPos += 40;
  } else {
    yPos += 10;
  }

  // Motorcycle info
  if (motorcycleInfo) {
    ctx.font = 'bold 18px Arial';
    ctx.fillText('MOTORCYCLE', 70, yPos);
    ctx.font = '18px Arial';
    yPos += 35;
    ctx.fillText(`🏍️ ${motorcycleInfo.modelName}`, 70, yPos);
    yPos += 30;
    ctx.fillText(`🔢 ${motorcycleInfo.motorcycleNumber}`, 70, yPos);
    yPos += 40;
  }

  // Payment info
  ctx.font = 'bold 18px Arial';
  ctx.fillText('PAYMENT', 70, yPos);
  ctx.font = '18px Arial';
  yPos += 35;
  ctx.fillText(`💰 Amount Paid: ₹${amount}`, 70, yPos);
  yPos += 50;

  // QR Code generation
  const qrCodeDataUrl = await QRCode.toDataURL(qrData || JSON.stringify({
    bookingNumber,
    userName,
    eventName,
    startDate,
    amount
  }), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 200,
    margin: 1,
    color: {
      dark: '#0f2027',
      light: '#ffffff'
    }
  });

  // Load and draw QR code
  const qrImage = await loadImage(qrCodeDataUrl);
  const qrSize = 180;
  const qrX = (width - qrSize) / 2;
  const qrY = yPos;
  
  // QR code border
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  ctx.strokeStyle = '#00d9ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // QR code label
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Scan for verification', width / 2, qrY + qrSize + 30);

  // Footer
  ctx.fillStyle = '#999999';
  ctx.font = '12px Arial';
  ctx.fillText('This ticket is valid only with valid ID proof', width / 2, height - 40);
  ctx.fillText('Keep this ticket safe and show during check-in', width / 2, height - 20);

  return canvas.toBuffer('image/png');
};

export default {
  generateRideTicket,
  generateEventTicket
};
