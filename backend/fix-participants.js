import mongoose from 'mongoose';
import Event from './src/models/Event.js';
import EventBooking from './src/models/EventBooking.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixParticipantCounts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events\n`);

    for (const event of events) {
      console.log(`\nProcessing event: ${event.title}`);
      console.log(`Current participants (before): ${event.currentParticipants}`);

      // Count actual paid bookings for this event
      const paidBookings = await EventBooking.find({
        event: event._id,
        status: 'paid'
      });

      // Calculate correct participant count
      let correctCount = 0;
      for (const booking of paidBookings) {
        if (booking.bookingType === 'group') {
          correctCount += booking.groupInfo.groupSize;
        } else {
          correctCount += 1;
        }
      }

      console.log(`Paid bookings: ${paidBookings.length}`);
      console.log(`Correct participant count: ${correctCount}`);

      // Update the event
      if (event.currentParticipants !== correctCount) {
        event.currentParticipants = correctCount;
        
        // Also update nested capacity field if it exists
        if (event.capacity) {
          event.capacity.currentParticipants = correctCount;
        }
        
        await event.save();
        console.log(`✅ Updated participants from ${event.currentParticipants} to ${correctCount}`);
      } else {
        console.log(`✓ Participant count is already correct`);
      }
    }

    console.log('\n✅ All participant counts have been fixed!');
    
  } catch (error) {
    console.error('Error fixing participant counts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

fixParticipantCounts();
