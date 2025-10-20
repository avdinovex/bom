import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Event from '../models/Event.js';
import UpcomingRide from '../models/UpcomingRide.js';
import CompletedRide from '../models/CompletedRide.js';
import Blog from '../models/Blog.js';
import TeamMember from '../models/TeamMember.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sattvadoshi:Sattva%40123@userdatabase.lastvy7.mongodb.net/BOM?retryWrites=true&w=majority&appName=UserDataBase');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      UpcomingRide.deleteMany({}),
      CompletedRide.deleteMany({}),
      Blog.deleteMany({}),
      TeamMember.deleteMany({})
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      fullName: 'Admin User',
      email: 'admin@ridebooking.com',
      passwordHash: 'admin123', // Will be hashed by pre-save middleware
      primaryBike: 'Royal Enfield Classic 350',
      experienceLevel: 'Advanced',
      role: 'admin',
      phone: '9876543210'
    });

    // Create regular users
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'user123', // Will be hashed by pre-save middleware
        primaryBike: 'Honda CB350RS',
        experienceLevel: 'Intermediate',
        phone: '9876543211'
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: 'user123', // Will be hashed by pre-save middleware
        primaryBike: 'KTM Duke 390',
        experienceLevel: 'Advanced',
        phone: '9876543212'
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        passwordHash: 'user123', // Will be hashed by pre-save middleware
        primaryBike: 'Yamaha FZ25',
        experienceLevel: 'Beginner',
        phone: '9876543213'
      }
    ]);

    // Create events
    console.log('🎉 Creating events...');
    await Event.create([
      {
        title: 'Annual Bike Show 2024',
        imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        details: 'Join us for the biggest bike show of the year featuring latest models, custom bikes, and exciting competitions.',
        location: 'Mumbai Exhibition Center',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-17'),
        category: 'other',
        organizer: adminUser._id
      },
      {
        title: 'Safety Workshop',
        imgUrl: 'https://images.unsplash.com/photo-1544966503-7e9518d958a3',
        details: 'Learn essential riding safety tips and techniques from experienced riders and instructors.',
        location: 'Delhi Riding School',
        startDate: new Date('2024-11-20'),
        endDate: new Date('2024-11-20'),
        category: 'workshop',
        organizer: adminUser._id
      }
    ]);

    // Create upcoming rides
    console.log('🏍️  Creating upcoming rides...');
    await UpcomingRide.create([
      {
        title: 'Weekend Getaway to Lonavala',
        slogan: 'Escape the city chaos',
        venue: 'Mumbai to Lonavala',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // +8 hours
        maxCapacity: 20,
        price: 1500,
        description: 'A scenic ride to the beautiful hill station of Lonavala with breakfast and lunch included.',
        difficulty: 'Easy',
        distance: 120,
        imgUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
        organizer: adminUser._id,
        registeredCount: 5,
        isFeatured: true
      },
      {
        title: 'Himalayan Adventure',
        slogan: 'Conquer the mountains',
        venue: 'Delhi to Manali',
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Two weeks
        endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // +3 days
        maxCapacity: 15,
        price: 12000,
        description: 'An epic journey through the Himalayas with camping and professional guides.',
        difficulty: 'Hard',
        distance: 800,
        imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        organizer: adminUser._id,
        registeredCount: 8,
        isFeatured: true
      },
      {
        title: 'Coastal Highway Cruise',
        slogan: 'Feel the ocean breeze',
        venue: 'Goa Coastal Roads',
        startTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Three weeks
        maxCapacity: 25,
        price: 2500,
        description: 'Cruise along the beautiful Goa coastline with stops at scenic beaches.',
        difficulty: 'Medium',
        distance: 200,
        imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        organizer: adminUser._id,
        registeredCount: 12
      }
    ]);

    // Create completed rides
    console.log('🏁 Creating completed rides...');
    await CompletedRide.create([
      {
        title: 'Mumbai to Pune Express',
        imgUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
        date: new Date('2024-10-15'),
        details: 'A successful ride with 25 participants covering the Mumbai-Pune expressway.',
        venue: 'Mumbai to Pune',
        distance: 150,
        participants: 25,
        difficulty: 'Medium',
        organizer: adminUser._id,
        isFeatured: true
      },
      {
        title: 'Rajasthan Desert Safari',
        imgUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a2e',
        date: new Date('2024-09-20'),
        details: 'An amazing desert adventure through Rajasthan with cultural experiences.',
        venue: 'Rajasthan Desert',
        distance: 500,
        participants: 18,
        difficulty: 'Hard',
        organizer: adminUser._id
      }
    ]);

    // Create blog posts
    console.log('📝 Creating blog posts...');
    await Blog.create([
      {
        title: 'Essential Bike Maintenance Tips for Long Rides',
        slug: 'essential-bike-maintenance-tips-long-rides',
        imgUrl: 'https://images.unsplash.com/photo-1544966503-7e9518d958a3',
        excerpt: 'Learn how to keep your bike in perfect condition for those long highway adventures.',
        content: `
# Essential Bike Maintenance Tips for Long Rides

Long motorcycle rides can be incredibly rewarding, but they also put your bike through its paces. Proper maintenance is crucial for safety, performance, and reliability on extended journeys.

## Pre-Ride Inspection Checklist

### 1. Check Your Tires
- Inspect tire pressure and tread depth
- Look for any cracks, punctures, or unusual wear patterns
- Ensure proper tire pressure according to manufacturer specifications

### 2. Fluid Levels
- Engine oil level and condition
- Brake fluid levels (front and rear)
- Coolant level (if liquid-cooled)
- Chain lubrication

### 3. Lights and Electronics
- Test all lights (headlight, tail light, indicators)
- Check battery voltage
- Verify horn and other electrical components

## On-the-Road Maintenance

During your journey, it's important to perform regular checks:
- Monitor engine temperature
- Listen for unusual sounds
- Check chain tension periodically
- Inspect for any loose bolts or components

## Post-Ride Care

After completing your long ride:
- Clean your bike thoroughly
- Change engine oil if due
- Inspect for any damage or wear
- Store your bike properly

Remember, a well-maintained motorcycle is not just more reliable—it's safer for you and more enjoyable to ride!
        `,
        author: adminUser._id,
        category: 'maintenance',
        tags: ['maintenance', 'safety', 'tips'],
        isPublished: true,
        publishedAt: new Date('2024-10-01'),
        views: 245,
        isFeatured: true
      },
      {
        title: 'Best Riding Routes in Western Ghats',
        slug: 'best-riding-routes-western-ghats',
        imgUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        excerpt: 'Discover the most scenic and thrilling motorcycle routes through the Western Ghats.',
        content: `
# Best Riding Routes in Western Ghats

The Western Ghats offer some of the most spectacular motorcycle routes in India. From winding mountain roads to lush green valleys, here are the top routes every rider should experience.

## 1. Mumbai to Lonavala via Old Highway

This classic route takes you through:
- **Distance**: 120 km
- **Difficulty**: Easy to Medium  
- **Best Time**: Post-monsoon (October to February)

### Highlights:
- Scenic views of valleys and hills
- Multiple viewpoints and stops
- Great food options along the route

## 2. Bangalore to Coorg

A favorite among South Indian riders:
- **Distance**: 250 km
- **Difficulty**: Medium
- **Best Time**: All year round

### What to Expect:
- Coffee plantations
- Winding mountain roads
- Pleasant weather throughout

## 3. Pune to Mahabaleshwar

Perfect weekend getaway:
- **Distance**: 120 km  
- **Difficulty**: Easy to Medium
- **Best Time**: October to March

The route offers beautiful landscapes and is suitable for riders of all experience levels.

## Safety Tips for Ghat Riding

- Always wear proper protective gear
- Maintain safe following distance
- Be extra cautious during monsoon season
- Keep your bike well-maintained
- Carry emergency supplies

Happy riding through these magnificent mountains!
        `,
        author: adminUser._id,
        category: 'rides',
        tags: ['routes', 'western-ghats', 'travel'],
        isPublished: true,
        publishedAt: new Date('2024-09-15'),
        views: 189
      }
    ]);

    // Create team members
    console.log('👨‍💼 Creating team members...');
    await TeamMember.create([
      {
        name: 'Rajesh Kumar',
        position: 'Founder & CEO',
        imgUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        bio: 'Passionate rider with over 15 years of experience. Founded the company to connect riders and promote safe riding culture.',
        email: 'rajesh@ridebooking.com',
        phone: '9876543220',
        department: 'leadership',
        isFounder: true,
        displayOrder: 1,
        social: {
          linkedin: 'https://linkedin.com/in/rajeshkumar',
          instagram: 'https://instagram.com/rajesh_rides'
        }
      },
      {
        name: 'Priya Sharma',
        position: 'Head of Operations',
        imgUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b515',
        bio: 'Ensures smooth operations and excellent customer experience for all our rides and events.',
        email: 'priya@ridebooking.com',
        department: 'operations',
        displayOrder: 2,
        social: {
          linkedin: 'https://linkedin.com/in/priyasharma'
        }
      },
      {
        name: 'Arjun Patel',
        position: 'Lead Ride Coordinator',
        imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        bio: 'Experienced rider and route planner. Coordinates all our rides and ensures safety protocols.',
        email: 'arjun@ridebooking.com',
        department: 'operations',
        displayOrder: 3,
        social: {
          facebook: 'https://facebook.com/arjun.patel',
          instagram: 'https://instagram.com/arjun_rides'
        }
      }
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@ridebooking.com / admin123');
    console.log('User: john@example.com / user123');
    console.log('User: jane@example.com / user123');
    console.log('User: mike@example.com / user123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  mongoose.disconnect();
  console.log('🔌 Database connection closed');
};

runSeed();