import mongoose from 'mongoose';
import Event from '../models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sattvadoshi:Sattva%40123@userdatabase.lastvy7.mongodb.net/BOM?retryWrites=true&w=majority&appName=UserDataBase');
    console.log('MongoDB connected for seeding events');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const sampleEvents = [
  {
    title: 'Mumbai Bikers Mania 2025',
    details: 'Mumbai Bikers Mania is a premium biking festival conceptualised by the Brotherhood of Mumbai exclusively for the city\'s passionate riding community. It is not a meetup, not a casual group ride—but a full-scale motorsport-inspired event. The vision behind Mumbai Bikers Mania is to create a professional platform dedicated to real biking culture. Riders don\'t just attend—they experience. A space where the community feels seen, valued, and represented. Where every rev, every drift, every stunt becomes a story.',
    location: 'Aamby Valley City, Lonavala',
    startDate: new Date('2025-03-15T09:00:00Z'),
    endDate: new Date('2025-03-16T18:00:00Z'),
    category: 'ride',
    isActive: true,
    price: 2500,
    maxParticipants: 200,
    currentParticipants: 45,
    isBookingEnabled: true,
    eventType: 'upcoming',
    registrationDeadline: new Date('2025-03-10T23:59:59Z'),
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  },
  {
    title: 'Weekend Ride to Lonavala',
    details: 'Join us for a scenic weekend ride to Lonavala. Experience the beautiful Western Ghats, enjoy local food, and bond with fellow riders. This is a perfect ride for all skill levels.',
    location: 'Lonavala, Maharashtra',
    startDate: new Date('2025-11-23T07:00:00Z'),
    endDate: new Date('2025-11-24T19:00:00Z'),
    category: 'ride',
    isActive: true,
    price: 1500,
    maxParticipants: 50,
    currentParticipants: 28,
    isBookingEnabled: true,
    eventType: 'upcoming',
    registrationDeadline: new Date('2025-11-20T23:59:59Z'),
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  },
  {
    title: 'Bike Maintenance Workshop',
    details: 'Learn essential bike maintenance skills in this hands-on workshop. Topics include engine care, chain maintenance, brake adjustment, and troubleshooting common issues.',
    location: 'BOM Clubhouse, Mumbai',
    startDate: new Date('2025-12-07T10:00:00Z'),
    endDate: new Date('2025-12-07T16:00:00Z'),
    category: 'workshop',
    isActive: true,
    price: 800,
    maxParticipants: 25,
    currentParticipants: 12,
    isBookingEnabled: true,
    eventType: 'upcoming',
    registrationDeadline: new Date('2025-12-05T23:59:59Z'),
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  },
  {
    title: 'Mumbai Bikers Mania 2024',
    details: 'The inaugural Mumbai Bikers Mania was a massive success! Over 300 riders participated in this amazing festival featuring stunt shows, off-road tracks, and professional biking demonstrations.',
    location: 'Aamby Valley City, Lonavala',
    startDate: new Date('2024-03-16T09:00:00Z'),
    endDate: new Date('2024-03-17T18:00:00Z'),
    category: 'ride',
    isActive: true,
    price: 2000,
    maxParticipants: 300,
    currentParticipants: 285,
    isBookingEnabled: false,
    eventType: 'past',
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  },
  {
    title: 'Goa Beach Ride 2024',
    details: 'An unforgettable ride to the beaches of Goa. Participants enjoyed coastal roads, beach camping, and amazing Goan hospitality. This ride will be remembered for years to come.',
    location: 'Goa',
    startDate: new Date('2024-12-20T06:00:00Z'),
    endDate: new Date('2024-12-23T20:00:00Z'),
    category: 'ride',
    isActive: true,
    price: 3500,
    maxParticipants: 80,
    currentParticipants: 75,
    isBookingEnabled: false,
    eventType: 'past',
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  },
  {
    title: 'Safety Workshop 2024',
    details: 'A comprehensive safety workshop covering riding techniques, protective gear, road safety, and emergency response. Great turnout with positive feedback from all participants.',
    location: 'BOM Clubhouse, Mumbai',
    startDate: new Date('2024-08-15T14:00:00Z'),
    endDate: new Date('2024-08-15T18:00:00Z'),
    category: 'workshop',
    isActive: true,
    price: 500,
    maxParticipants: 40,
    currentParticipants: 38,
    isBookingEnabled: false,
    eventType: 'past',
    imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  }
];

const seedEvents = async () => {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Created ${createdEvents.length} sample events`);

    console.log('Sample events created successfully:');
    createdEvents.forEach(event => {
      console.log(`- ${event.title} (${event.eventType})`);
    });

  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const runSeed = async () => {
  await connectDB();
  await seedEvents();
};

runSeed();