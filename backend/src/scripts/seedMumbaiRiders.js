import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleMumbaiRidersEvents = [
  {
    title: 'Mumbai Bikers Mania 2024',
    subtitle: 'The Ultimate Biking Festival',
    description: 'Mumbai Bikers Mania is a premium biking festival conceptualised by the Brotherhood of Mumbai exclusively for the city\'s passionate riding community.',
    
    category: 'mumbai-bikers-mania',
    tags: ['biking', 'festival', 'mumbai', 'adventure', 'motorsport', 'community'],
    
    startDate: new Date('2024-12-15T09:00:00'),
    endDate: new Date('2024-12-15T18:00:00'),
    
    location: 'Mumbai',
    venue: {
      name: 'MMRDA Grounds',
      address: 'MMRDA Grounds, Bandra Kurla Complex, Bandra East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051'
    },
    
    pricing: {
      isFree: false,
      basePrice: 1500,
      currency: 'INR',
      earlyBirdPrice: 1200,
      earlyBirdDeadline: new Date('2024-11-15T23:59:59')
    },
    
    capacity: {
      maxParticipants: 500,
      currentParticipants: 0,
      waitlistEnabled: true,
      maxWaitlist: 100
    },
    
    registrationInfo: {
      isRequired: true,
      startDate: new Date('2024-10-01T00:00:00'),
      endDate: new Date('2024-12-10T23:59:59'),
      instructions: 'Please bring your valid driving license and ensure your motorcycle is in good condition.'
    },
    
    contentSections: [
      {
        sectionTitle: 'INTRODUCING',
        heading: 'MUMBAI BIKERS\nMANIA',
        content: 'Mumbai Bikers Mania is a premium biking festival conceptualised by the Brotherhood of Mumbai exclusively for the city\'s passionate riding community. It is not a meetup, not a casual group ride—but a full-scale motorsport-inspired event.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Mumbai Bikers Mania Introduction',
        order: 1,
        layout: 'image-left'
      },
      {
        sectionTitle: 'OUR VISION',
        heading: 'PROFESSIONAL\nBIKING PLATFORM',
        content: 'The vision behind Mumbai Bikers Mania is to create a professional platform dedicated to real biking culture. Riders don\'t just attend—they experience. A space where the community feels seen, valued, and represented. Where every rev, every drift, every stunt becomes a story.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Professional Biking Platform',
        order: 2,
        layout: 'image-right'
      },
      {
        sectionTitle: 'EXPERIENCE',
        heading: 'OFF-ROAD &\nTRAIL ZONES',
        content: 'The event features purpose-built off-road and trail zones designed for thrill seekers. Motocross-style tracks are introduced to challenge skill, control, and precision. Every corner of the event is planned with the spirit of adrenaline and passion at its core.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Off-Road Tracks',
        order: 3,
        layout: 'image-left'
      },
      {
        sectionTitle: 'SHOWCASE',
        heading: 'STUNT ARENAS &\nPERFORMANCE',
        content: 'Stunt arenas are created where professional riders can showcase talent and inspire others. The aim is to bring international-style biking energy to Mumbai. To give local riders a stage that truly matches their enthusiasm and dedication.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Stunt Arena',
        order: 4,
        layout: 'image-right'
      },
      {
        sectionTitle: 'CELEBRATION',
        heading: 'DISCIPLINE, SKILL\n& RAW POWER',
        content: 'Mumbai Bikers Mania celebrates discipline, skill, and the raw power of machines. It unites bikers not for a ride, but for a biker\'s festival experience. It\'s designed to break the stereotype that biking is just about long-distance rides. It highlights technical riding, stunt precision, and track discipline.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Biking Culture',
        order: 5,
        layout: 'image-left'
      },
      {
        sectionTitle: 'STANDARDS',
        heading: 'SAFETY &\nEXCELLENCE',
        content: 'The event encourages riders to push limits in a safe and controlled environment. Professional partners and track builders are involved to maintain high standards. This festival is built to inspire the next wave of biking culture in the city.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Professional Standards',
        order: 6,
        layout: 'image-right'
      },
      {
        sectionTitle: 'THE MOVEMENT',
        heading: 'WHERE THROTTLE\nMEETS AMBITION',
        content: 'Mumbai Bikers Mania is a step towards building a recognised biking identity for Mumbai. An identity that speaks of passion, power, and professional-level biking events. Riders come here not just to participate, but to be part of a legacy. A legacy where Mumbai stands tall in the national biking scene.\n\nThis is more than an event—it\'s the beginning of a movement.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imageAlt: 'Mumbai Biking Legacy',
        order: 7,
        layout: 'image-left'
      }
    ],
    
    requirements: {
      ageLimit: {
        min: 18,
        max: 65
      },
      licenseRequired: true,
      bikeRequired: true,
      helmetMandatory: true,
      equipmentNeeded: [
        { item: 'Riding Jacket', isRequired: true, description: 'Protective riding gear mandatory' },
        { item: 'Riding Gloves', isRequired: true, description: 'For better grip and protection' },
        { item: 'Riding Boots', isRequired: false, description: 'Recommended for safety' }
      ],
      skillLevel: 'all'
    },
    
    highlights: [
      'Professional stunt performances',
      'Off-road adventure tracks',
      'Bike showcase and exhibitions',
      'Live music and entertainment',
      'Food and refreshment stalls',
      'Prizes and giveaways'
    ],
    
    itinerary: [
      {
        time: '09:00 AM',
        activity: 'Registration and Check-in',
        description: 'Participants registration and bike inspection',
        location: 'Main Entrance',
        duration: 60
      },
      {
        time: '10:30 AM',
        activity: 'Opening Ceremony',
        description: 'Welcome address and event inauguration',
        location: 'Main Stage',
        duration: 30
      },
      {
        time: '11:00 AM',
        activity: 'Stunt Performances',
        description: 'Professional stunt riders showcase',
        location: 'Stunt Arena',
        duration: 90
      },
      {
        time: '01:00 PM',
        activity: 'Lunch Break',
        description: 'Food and refreshments',
        location: 'Food Court',
        duration: 60
      },
      {
        time: '02:00 PM',
        activity: 'Off-Road Adventure',
        description: 'Guided off-road riding experience',
        location: 'Adventure Track',
        duration: 120
      },
      {
        time: '04:30 PM',
        activity: 'Bike Show & Competition',
        description: 'Best bike competition and showcase',
        location: 'Exhibition Area',
        duration: 90
      },
      {
        time: '06:00 PM',
        activity: 'Closing Ceremony',
        description: 'Prize distribution and closing remarks',
        location: 'Main Stage',
        duration: 60
      }
    ],
    
    contactInfo: {
      primaryContact: {
        name: 'Event Coordinator',
        phone: '+91 98765 43210',
        email: 'events@brotherhoodofmumbai.com'
      },
      emergencyContact: {
        name: 'Emergency Helpline',
        phone: '+91 98765 43211'
      },
      supportEmail: 'support@brotherhoodofmumbai.com',
      supportPhone: '+91 98765 43212'
    },
    
    socialLinks: {
      website: 'https://brotherhoodofmumbai.com',
      facebook: 'https://facebook.com/brotherhoodofmumbai',
      instagram: 'https://instagram.com/brotherhoodofmumbai',
      twitter: 'https://twitter.com/bomriders',
      youtube: 'https://youtube.com/@brotherhoodofmumbai'
    },
    
    seo: {
      metaTitle: 'Mumbai Bikers Mania 2024 - Ultimate Biking Festival',
      metaDescription: 'Join Mumbai\'s biggest biking festival with professional stunts, off-road adventures, and community celebration.',
      keywords: ['mumbai bikers mania', 'biking festival', 'motorcycle event', 'brotherhood of mumbai', 'stunts', 'adventure']
    },
    
    isActive: true,
    isPublished: true,
    isFeatured: true,
    eventType: 'upcoming',
    status: 'published',
    isBookingEnabled: true
  },
  
  // Second event - 6 months later
  {
    title: 'Mumbai Bikers Mania - Summer Edition 2025',
    subtitle: 'Ride the Heat',
    description: 'Summer edition of Mumbai\'s premier biking festival with extended tracks and new challenges.',
    
    category: 'mumbai-bikers-mania',
    tags: ['biking', 'festival', 'mumbai', 'summer', 'adventure', 'motorsport'],
    
    startDate: new Date('2025-06-15T08:00:00'),
    endDate: new Date('2025-06-15T19:00:00'),
    
    location: 'Mumbai',
    venue: {
      name: 'Navi Mumbai Race Track',
      address: 'Sector 15, Kharghar, Navi Mumbai',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '410210'
    },
    
    pricing: {
      isFree: false,
      basePrice: 1800,
      currency: 'INR',
      earlyBirdPrice: 1500,
      earlyBirdDeadline: new Date('2025-05-15T23:59:59')
    },
    
    capacity: {
      maxParticipants: 750,
      currentParticipants: 0,
      waitlistEnabled: true,
      maxWaitlist: 150
    },
    
    contentSections: [
      {
        sectionTitle: 'SUMMER EDITION',
        heading: 'RIDE THE\nHEAT',
        content: 'The Summer Edition of Mumbai Bikers Mania brings extended challenges, longer tracks, and more adrenaline-pumping activities designed for the hot season. New cooling stations and enhanced safety measures ensure maximum comfort.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        order: 1,
        layout: 'image-left'
      },
      {
        sectionTitle: 'ENHANCED EXPERIENCE',
        heading: 'EXTENDED TRACKS\n& NEW CHALLENGES',
        content: 'This summer edition features 40% longer adventure tracks, new obstacle courses, and advanced stunt arenas. Professional cooling systems and hydration stations ensure participant safety during the intense summer heat.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        order: 2,
        layout: 'image-right'
      }
    ],
    
    isActive: true,
    isPublished: false, // Future event
    isFeatured: false,
    eventType: 'upcoming',
    status: 'draft',
    isBookingEnabled: false // Will be enabled later
  }
];

const seedMumbaiRidersEvents = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bom');
    console.log('Connected to MongoDB');

    // Find or create an admin user as organizer
    let adminUser = await User.findOne({ email: 'admin@brotherhoodofmumbai.com' });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = await User.create({
        fullName: 'BOM Admin',
        email: 'admin@brotherhoodofmumbai.com',
        password: 'admin123', // This will be hashed by the User model
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created');
    }

    // Clear existing Mumbai Bikers Mania events
    await Event.deleteMany({ category: 'mumbai-bikers-mania' });
    console.log('Cleared existing Mumbai Bikers Mania events');

    // Add organizer to each event
    const eventsWithOrganizer = sampleMumbaiRidersEvents.map(event => ({
      ...event,
      organizer: adminUser._id
    }));

    // Create new events
    const createdEvents = await Event.create(eventsWithOrganizer);
    console.log(`Created ${createdEvents.length} Mumbai Bikers Mania events`);

    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   - Category: ${event.category}`);
      console.log(`   - Date: ${event.startDate.toDateString()}`);
      console.log(`   - Status: ${event.status}`);
      console.log(`   - Published: ${event.isPublished}`);
      console.log(`   - Content Sections: ${event.contentSections.length}`);
      console.log('');
    });

    console.log('✅ Mumbai Bikers Mania events seeded successfully!');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Start your frontend server: npm run dev');
    console.log('3. Go to /admin and login with admin@brotherhoodofmumbai.com / admin123');
    console.log('4. Navigate to Events to manage the seeded events');
    console.log('5. Go to /events to view the public Mumbai Bikers Mania page');
    
  } catch (error) {
    console.error('❌ Error seeding Mumbai Bikers Mania events:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedMumbaiRidersEvents();