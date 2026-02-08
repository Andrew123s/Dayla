const mongoose = require('mongoose');
const User = require('../models/user.model');
const Trip = require('../models/trip.model');
const Dashboard = require('../models/dashboard.model');
const { connectDB } = require('../config/db.config');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Dashboard.deleteMany({});

    // Create sample users (all marked as email verified for testing)
    const users = await User.create([
      {
        name: 'Forest Walker',
        email: 'forest@example.com',
        password: 'password123',
        bio: 'Nature enthusiast and weekend explorer.',
        interests: ['Hiking', 'Camping', 'Photography'],
        avatar: 'https://picsum.photos/200/200?random=user1',
        ecoScore: 85,
        emailVerified: true,
        onboardingCompleted: true
      },
      {
        name: 'River J.',
        email: 'river@example.com',
        password: 'password123',
        bio: 'Outdoor adventure seeker and trail runner.',
        interests: ['Hiking', 'Kayaking', 'Rock Climbing'],
        avatar: 'https://picsum.photos/200/200?random=user2',
        ecoScore: 78,
        emailVerified: true,
        onboardingCompleted: true
      },
      {
        name: 'Elena Forest',
        email: 'elena@example.com',
        password: 'password123',
        bio: 'Wildlife photographer and conservation advocate.',
        interests: ['Photography', 'Bird Watching', 'Wildlife'],
        avatar: 'https://picsum.photos/200/200?random=user3',
        ecoScore: 92,
        emailVerified: true,
        onboardingCompleted: true
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample trip
    const trip = await Trip.create({
      name: 'Yosemite Adventure',
      description: 'A 5-day hiking and camping trip in Yosemite National Park',
      owner: users[0]._id,
      collaborators: [users[1]._id, users[2]._id],
      destination: {
        name: 'Yosemite National Park',
        coordinates: { lat: 37.8651, lng: -119.5383 },
        country: 'USA',
        region: 'California'
      },
      dates: {
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-20')
      },
      budget: {
        total: 2500,
        currency: 'USD',
        categories: {
          accommodation: 800,
          transportation: 600,
          food: 400,
          activities: 300,
          other: 400
        }
      },
      status: 'planning',
      tags: ['adventure', 'nature', 'mountain'],
      ecoScore: 88
    });

    console.log(`✅ Created trip: ${trip.name}`);

    // Create dashboard for the trip
    const dashboard = await Dashboard.create({
      tripId: trip._id,
      name: `${trip.name} Dashboard`,
      owner: users[0]._id,
      collaborators: [
        { user: users[0]._id, role: 'admin', joinedAt: new Date() },
        { user: users[1]._id, role: 'editor', joinedAt: new Date() },
        { user: users[2]._id, role: 'editor', joinedAt: new Date() }
      ],
      notes: [
        {
          id: 'note_1',
          type: 'text',
          x: 100,
          y: 150,
          width: 200,
          height: 150,
          content: 'Pack bear canister and bear spray for Yosemite trails',
          color: '#faedcd',
          emoji: '🧸'
        },
        {
          id: 'note_2',
          type: 'schedule',
          x: 350,
          y: 150,
          width: 180,
          height: 120,
          content: 'Meet at trailhead at 6 AM',
          color: '#d4a373',
          emoji: '⏰',
          scheduledDate: '2025-06-15'
        },
        {
          id: 'note_3',
          type: 'budget',
          x: 100,
          y: 350,
          width: 220,
          height: 180,
          content: 'Budget breakdown for the trip',
          color: '#fefae0',
          emoji: '💰'
        }
      ],
      settings: {
        backgroundColor: '#f7f3ee',
        gridSize: 20,
        snapToGrid: true,
        showLinks: true
      }
    });

    console.log(`✅ Created dashboard with ${dashboard.notes.length} notes`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample Data Created:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Trips: 1`);
    console.log(`   Dashboards: 1`);
    console.log(`   Notes: ${dashboard.notes.length}`);

    console.log('\n🔑 Test Login Credentials:');
    users.forEach(user => {
      console.log(`   ${user.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  connectDB()
    .then(() => seedData())
    .then(() => {
      console.log('✅ Seeding completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };