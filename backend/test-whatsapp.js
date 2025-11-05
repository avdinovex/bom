#!/usr/bin/env node

/**
 * WhatsApp Ticket System - Quick Test Script
 * Run with: node test-whatsapp.js
 */

import readline from 'readline';
import whatsappService from './src/services/whatsappService.js';
import { generateRideTicket, generateEventTicket } from './src/services/ticketService.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('\n🎟️  WhatsApp Ticket System - Test Script\n');
console.log('═'.repeat(50));

async function main() {
  try {
    // Check environment variables
    console.log('\n📋 Checking configuration...\n');
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!phoneNumberId || !accessToken) {
      console.log('❌ WhatsApp credentials not found in environment variables!');
      console.log('\nPlease add to your .env file:');
      console.log('  WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id');
      console.log('  WHATSAPP_ACCESS_TOKEN=your_access_token');
      console.log('\nSee WHATSAPP_SETUP.md for details.\n');
      rl.close();
      return;
    }
    
    console.log('✅ WhatsApp Phone Number ID found');
    console.log('✅ WhatsApp Access Token found\n');

    // Test 1: Health Check
    console.log('🔍 Test 1: Checking WhatsApp API health...');
    const isHealthy = await whatsappService.checkHealth();
    
    if (isHealthy) {
      console.log('✅ WhatsApp API is connected!\n');
    } else {
      console.log('❌ WhatsApp API is not responding.');
      console.log('   Please check your credentials.\n');
      rl.close();
      return;
    }

    // Test 2: Send Test Message
    const sendMessage = await question('📱 Send test text message? (y/n): ');
    
    if (sendMessage.toLowerCase() === 'y') {
      const phoneNumber = await question('   Enter phone number (with country code, e.g., 919876543210): ');
      
      try {
        console.log('\n   Sending test message...');
        await whatsappService.sendTextMessage(
          phoneNumber,
          '🎉 Hello from Band Of Mumbai! Your WhatsApp integration is working perfectly!'
        );
        console.log('✅ Test message sent successfully!\n');
      } catch (error) {
        console.log(`❌ Failed to send message: ${error.message}\n`);
      }
    }

    // Test 3: Generate and Send Test Ticket
    const sendTicket = await question('🎟️  Generate and send test ticket? (y/n): ');
    
    if (sendTicket.toLowerCase() === 'y') {
      const ticketType = await question('   Ticket type (ride/event): ');
      const phoneNumber = await question('   Enter phone number: ');
      
      try {
        console.log('\n   Generating ticket...');
        
        let ticketBuffer;
        if (ticketType.toLowerCase() === 'event') {
          ticketBuffer = await generateEventTicket({
            bookingNumber: 'TEST' + Date.now(),
            userName: 'Test User',
            eventName: 'Test Event - Mumbai Riders Meet',
            location: 'Marine Drive, Mumbai',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            amount: 1299,
            bookingType: 'individual',
            groupSize: 1,
            motorcycleInfo: {
              modelName: 'Royal Enfield Himalayan',
              motorcycleNumber: 'MH02CD5678'
            },
            qrData: JSON.stringify({ test: true, type: 'event' })
          });
        } else {
          ticketBuffer = await generateRideTicket({
            bookingNumber: 'TEST' + Date.now(),
            userName: 'Test User',
            rideName: 'Mumbai to Lonavala - Coastal Highway',
            venue: 'Gateway of India, Mumbai',
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            amount: 999,
            bookingType: 'individual',
            groupSize: 1,
            motorcycleInfo: {
              modelName: 'Royal Enfield Classic 350',
              motorcycleNumber: 'MH01AB1234'
            },
            qrData: JSON.stringify({ test: true, type: 'ride' })
          });
        }
        
        console.log('✅ Ticket generated!');
        console.log('   Uploading to WhatsApp...');
        
        await whatsappService.sendTicket(
          phoneNumber,
          ticketBuffer,
          {
            userName: 'Test User',
            bookingNumber: 'TEST' + Date.now(),
            rideName: ticketType === 'ride' ? 'Mumbai to Lonavala' : undefined,
            eventName: ticketType === 'event' ? 'Mumbai Riders Meet' : undefined,
            amount: ticketType === 'ride' ? 999 : 1299
          }
        );
        
        console.log('✅ Ticket sent successfully to', phoneNumber);
        console.log('   Check your WhatsApp! 📱\n');
      } catch (error) {
        console.log(`❌ Failed to send ticket: ${error.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('\n🎉 Testing complete!\n');
    console.log('Next steps:');
    console.log('  1. Check your WhatsApp for messages');
    console.log('  2. Try the full booking flow');
    console.log('  3. Check logs/combined.log for details');
    console.log('  4. See TESTING_GUIDE.md for more tests\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main();
