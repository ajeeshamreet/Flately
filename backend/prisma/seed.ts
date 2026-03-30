/**
 * Seed Script for Flately Demo Data
 *
 * Usage:
 *   npm run seed          - Seed demo data
 *   npm run seed:reset    - Remove all demo data
 *
 * This creates realistic demo users with profiles, preferences,
 * matches, and conversations for testing the app.
 */

import * as dotenv from 'dotenv';
import prisma from '../src/config/prisma';

// Load environment variables
dotenv.config();

interface DemoProfile {
  age: number;
  gender: string;
  occupation: string;
  city: string;
  hasRoom: boolean;
  onboardingCompleted: boolean;
}

interface DemoPreference {
  genderPreference: string;
  minBudget: number;
  maxBudget: number;
  city: string;
  cleanliness: number;
  sleepSchedule: number;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
  socialLevel: number;
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
}

interface DemoUser {
  auth0id: string;
  email: string;
  name: string;
  picture: string;
  profile: DemoProfile;
  preference: DemoPreference;
}

// Demo user data - easily identifiable by auth0id prefix "demo_"
const DEMO_USERS: DemoUser[] = [
  {
    auth0id: 'demo_sarah_001',
    email: 'sarah.demo@flately.test',
    name: 'Sarah Mitchell',
    picture:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 26,
      gender: 'female',
      occupation: 'UX Designer',
      city: 'San Francisco',
      hasRoom: true,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'any',
      minBudget: 1200,
      maxBudget: 2000,
      city: 'San Francisco',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 4,
      weightCleanliness: 30,
      weightSleep: 25,
      weightHabits: 20,
      weightSocial: 25,
    },
  },
  {
    auth0id: 'demo_alex_002',
    email: 'alex.demo@flately.test',
    name: 'Alex Chen',
    picture:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 28,
      gender: 'male',
      occupation: 'Software Engineer',
      city: 'San Francisco',
      hasRoom: false,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'any',
      minBudget: 1500,
      maxBudget: 2500,
      city: 'San Francisco',
      cleanliness: 5,
      sleepSchedule: 2,
      smoking: false,
      drinking: true,
      pets: false,
      socialLevel: 3,
      weightCleanliness: 35,
      weightSleep: 30,
      weightHabits: 15,
      weightSocial: 20,
    },
  },
  {
    auth0id: 'demo_jordan_003',
    email: 'jordan.demo@flately.test',
    name: 'Jordan Taylor',
    picture:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 24,
      gender: 'male',
      occupation: 'Marketing Manager',
      city: 'San Francisco',
      hasRoom: true,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'any',
      minBudget: 1000,
      maxBudget: 1800,
      city: 'San Francisco',
      cleanliness: 3,
      sleepSchedule: 4,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 5,
      weightCleanliness: 20,
      weightSleep: 20,
      weightHabits: 25,
      weightSocial: 35,
    },
  },
  {
    auth0id: 'demo_emma_004',
    email: 'emma.demo@flately.test',
    name: 'Emma Rodriguez',
    picture:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 27,
      gender: 'female',
      occupation: 'Data Scientist',
      city: 'San Francisco',
      hasRoom: false,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'female',
      minBudget: 1400,
      maxBudget: 2200,
      city: 'San Francisco',
      cleanliness: 4,
      sleepSchedule: 2,
      smoking: false,
      drinking: false,
      pets: true,
      socialLevel: 2,
      weightCleanliness: 40,
      weightSleep: 25,
      weightHabits: 20,
      weightSocial: 15,
    },
  },
  {
    auth0id: 'demo_mike_005',
    email: 'mike.demo@flately.test',
    name: 'Mike Johnson',
    picture:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 30,
      gender: 'male',
      occupation: 'Freelance Writer',
      city: 'San Francisco',
      hasRoom: true,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'any',
      minBudget: 800,
      maxBudget: 1500,
      city: 'San Francisco',
      cleanliness: 3,
      sleepSchedule: 5,
      smoking: true,
      drinking: true,
      pets: true,
      socialLevel: 4,
      weightCleanliness: 15,
      weightSleep: 35,
      weightHabits: 25,
      weightSocial: 25,
    },
  },
  {
    auth0id: 'demo_lisa_006',
    email: 'lisa.demo@flately.test',
    name: 'Lisa Park',
    picture:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 25,
      gender: 'female',
      occupation: 'Graphic Designer',
      city: 'San Francisco',
      hasRoom: false,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'any',
      minBudget: 1100,
      maxBudget: 1900,
      city: 'San Francisco',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: false,
      drinking: true,
      pets: false,
      socialLevel: 4,
      weightCleanliness: 30,
      weightSleep: 20,
      weightHabits: 25,
      weightSocial: 25,
    },
  },
  {
    auth0id: 'demo_david_007',
    email: 'david.demo@flately.test',
    name: 'David Kim',
    picture:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 29,
      gender: 'male',
      occupation: 'Product Manager',
      city: 'San Francisco',
      hasRoom: true,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'male',
      minBudget: 1600,
      maxBudget: 2400,
      city: 'San Francisco',
      cleanliness: 5,
      sleepSchedule: 2,
      smoking: false,
      drinking: true,
      pets: false,
      socialLevel: 3,
      weightCleanliness: 35,
      weightSleep: 30,
      weightHabits: 20,
      weightSocial: 15,
    },
  },
  {
    auth0id: 'demo_nina_008',
    email: 'nina.demo@flately.test',
    name: 'Nina Patel',
    picture:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    profile: {
      age: 23,
      gender: 'female',
      occupation: 'Graduate Student',
      city: 'San Francisco',
      hasRoom: false,
      onboardingCompleted: true,
    },
    preference: {
      genderPreference: 'female',
      minBudget: 700,
      maxBudget: 1300,
      city: 'San Francisco',
      cleanliness: 3,
      sleepSchedule: 4,
      smoking: false,
      drinking: false,
      pets: true,
      socialLevel: 3,
      weightCleanliness: 25,
      weightSleep: 30,
      weightHabits: 20,
      weightSocial: 25,
    },
  },
];

// Demo messages for conversations
const DEMO_MESSAGES: string[] = [
  "Hey! I saw your profile and we seem like a great match!",
  "Hi! Thanks for reaching out. I love your place!",
  "The neighborhood is amazing. There's a park right across the street.",
  "That sounds perfect! I work from home a few days a week, is that okay?",
  "Totally fine! I have a home office setup too.",
  "When would you like to schedule a tour?",
  "How about this weekend? Saturday afternoon works for me.",
  "Saturday at 2pm sounds great! I'll send you the address.",
];

async function seed(): Promise<void> {
  console.log('🌱 Starting seed...\n');

  const createdUsers: { id: string; name: string | null }[] = [];

  // Create users with profiles and preferences
  for (const userData of DEMO_USERS) {
    console.log(`Creating user: ${userData.name}`);

    const user = await prisma.user.create({
      data: {
        auth0id: userData.auth0id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      },
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        ...userData.profile,
      },
    });

    await prisma.preference.create({
      data: {
        userId: user.id,
        ...userData.preference,
      },
    });

    createdUsers.push(user);
  }

  console.log(
    `\n✅ Created ${createdUsers.length} demo users with profiles and preferences`,
  );

  // Create some matches (mutual likes)
  // Sarah <-> Alex, Jordan <-> Emma, Mike <-> Lisa
  const matchPairs: [number, number][] = [
    [0, 1], // Sarah & Alex
    [2, 3], // Jordan & Emma
    [4, 5], // Mike & Lisa
  ];

  for (const [i, j] of matchPairs) {
    const userA = createdUsers[i];
    const userB = createdUsers[j];

    // Create mutual swipes
    await prisma.swipe.create({
      data: {
        fromUserId: userA.id,
        toUserId: userB.id,
        action: 'like',
      },
    });

    await prisma.swipe.create({
      data: {
        fromUserId: userB.id,
        toUserId: userA.id,
        action: 'like',
      },
    });

    // Create match (sorted IDs)
    const [userAId, userBId] = [userA.id, userB.id].sort();

    const match = await prisma.match.create({
      data: {
        userAId,
        userBId,
      },
    });

    // Create conversation with messages
    const conversation = await prisma.conversation.create({
      data: {
        matchId: match.id,
      },
    });

    // Add some demo messages
    const messagesCount = Math.floor(Math.random() * 4) + 3; // 3-6 messages
    for (let m = 0; m < messagesCount; m++) {
      const senderId = m % 2 === 0 ? userA.id : userB.id;
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content: DEMO_MESSAGES[m % DEMO_MESSAGES.length],
          createdAt: new Date(
            Date.now() - (messagesCount - m) * 60000 * 10,
          ),
        },
      });
    }

    console.log(
      `Created match: ${DEMO_USERS[i].name} <-> ${DEMO_USERS[j].name}`,
    );
  }

  // Create some pending swipes (one-way likes for discovery feed)
  const pendingSwipes: [number, number][] = [
    [6, 0], // David liked Sarah
    [7, 0], // Nina liked Sarah
    [6, 2], // David liked Jordan
  ];

  for (const [from, to] of pendingSwipes) {
    await prisma.swipe.create({
      data: {
        fromUserId: createdUsers[from].id,
        toUserId: createdUsers[to].id,
        action: 'like',
      },
    });
  }

  console.log(`\n✅ Created ${matchPairs.length} matches with conversations`);
  console.log('✅ Created pending swipes for discovery testing');
  console.log('\n🌱 Seed completed successfully!\n');
}

async function reset(): Promise<void> {
  console.log('🗑️  Resetting demo data...\n');

  // Get all demo user IDs
  const demoUsers = await prisma.user.findMany({
    where: {
      auth0id: {
        startsWith: 'demo_',
      },
    },
    select: { id: true },
  });

  const demoUserIds = demoUsers.map((u) => u.id);

  if (demoUserIds.length === 0) {
    console.log('No demo data found to reset.');
    return;
  }

  console.log(`Found ${demoUserIds.length} demo users to remove`);

  // Delete in order (respecting foreign keys)

  // 1. Delete messages from conversations involving demo users
  const conversations = await prisma.conversation.findMany({
    where: {
      match: {
        OR: [
          { userAId: { in: demoUserIds } },
          { userBId: { in: demoUserIds } },
        ],
      },
    },
  });
  const convoIds = conversations.map((c) => c.id);

  await prisma.message.deleteMany({
    where: { conversationId: { in: convoIds } },
  });
  console.log('  ✓ Deleted demo messages');

  // 2. Delete conversations
  await prisma.conversation.deleteMany({
    where: { id: { in: convoIds } },
  });
  console.log('  ✓ Deleted demo conversations');

  // 3. Delete matches
  await prisma.match.deleteMany({
    where: {
      OR: [
        { userAId: { in: demoUserIds } },
        { userBId: { in: demoUserIds } },
      ],
    },
  });
  console.log('  ✓ Deleted demo matches');

  // 4. Delete swipes
  await prisma.swipe.deleteMany({
    where: {
      OR: [
        { fromUserId: { in: demoUserIds } },
        { toUserId: { in: demoUserIds } },
      ],
    },
  });
  console.log('  ✓ Deleted demo swipes');

  // 5. Delete preferences
  await prisma.preference.deleteMany({
    where: { userId: { in: demoUserIds } },
  });
  console.log('  ✓ Deleted demo preferences');

  // 6. Delete profiles
  await prisma.profile.deleteMany({
    where: { userId: { in: demoUserIds } },
  });
  console.log('  ✓ Deleted demo profiles');

  // 7. Delete users
  await prisma.user.deleteMany({
    where: { id: { in: demoUserIds } },
  });
  console.log('  ✓ Deleted demo users');

  console.log('\n🗑️  Demo data reset complete!\n');
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--reset') || args.includes('-r')) {
      await reset();
    } else {
      await seed();
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
