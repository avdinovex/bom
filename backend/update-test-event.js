import mongoose from 'mongoose';
import Event from './src/models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const updateTestEvent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test event
    const testEvent = await Event.findOne({ 
      title: 'Test Mumbai Bikers Mania Event' 
    });

    if (!testEvent) {
      console.log('❌ Test event not found');
      process.exit(1);
    }

    console.log('📝 Found test event:', testEvent.title);
    console.log('Current dates:', {
      start: testEvent.startDate,
      end: testEvent.endDate,
      type: testEvent.eventType
    });

    // Update to future dates (7 days from now)
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 7);
    
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 8);

    testEvent.startDate = futureStart;
    testEvent.endDate = futureEnd;
    testEvent.eventType = 'upcoming';
    testEvent.status = 'published';
    testEvent.isPublished = true;

    await testEvent.save();

    console.log('✅ Updated test event to upcoming!');
    console.log('New dates:', {
      start: testEvent.startDate,
      end: testEvent.endDate,
      type: testEvent.eventType
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateTestEvent();
