import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ override: true });

const prisma = new PrismaClient();

type SeedUser = {
  key: string;
  email: string;
  name: string;
  googleId: string;
  picture: string;
  profile: {
    age: number;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    bio: string;
    city: string;
    hasRoom: boolean;
    occupation: string;
    sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
    noiseLevel: number;
    guestPolicy: 'never' | 'rarely' | 'sometimes' | 'often';
    smoking: 'no' | 'outside' | 'yes';
    pets: 'no' | 'have' | 'love' | 'allergic';
  };
  preference: {
    genderPreference: 'male' | 'female' | 'any';
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
  };
};

type SwipeSeed = {
  from: string;
  to: string;
  action: 'like' | 'dislike';
};

type MatchSeed = {
  key: string;
  userA: string;
  userB: string;
};

type MessageSeed = {
  matchKey: string;
  sender: string;
  content: string;
};

const users: SeedUser[] = [
  {
    key: 'aarav',
    email: 'aarav.sharma@flately.demo',
    name: 'Aarav Sharma',
    googleId: 'google-seed-aarav',
    picture: 'https://i.pravatar.cc/200?img=11',
    profile: {
      age: 27,
      gender: 'male',
      bio: 'Product designer who likes clean homes, weekend football, and cooking pasta.',
      city: 'Bengaluru',
      hasRoom: true,
      occupation: 'Product Designer',
      sleepSchedule: 'flexible',
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'no',
      pets: 'love',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 12000,
      maxBudget: 24000,
      city: 'Bengaluru',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 4,
      weightCleanliness: 30,
      weightSleep: 20,
      weightHabits: 25,
      weightSocial: 25,
    },
  },
  {
    key: 'ananya',
    email: 'ananya.reddy@flately.demo',
    name: 'Ananya Reddy',
    googleId: 'google-seed-ananya',
    picture: 'https://i.pravatar.cc/200?img=21',
    profile: {
      age: 25,
      gender: 'female',
      bio: 'Frontend engineer. Early riser, yoga fan, and big on tidy shared spaces.',
      city: 'Hyderabad',
      hasRoom: false,
      occupation: 'Software Engineer',
      sleepSchedule: 'early-bird',
      noiseLevel: 2,
      guestPolicy: 'rarely',
      smoking: 'no',
      pets: 'love',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 10000,
      maxBudget: 20000,
      city: 'Hyderabad',
      cleanliness: 5,
      sleepSchedule: 2,
      smoking: false,
      drinking: false,
      pets: true,
      socialLevel: 3,
      weightCleanliness: 35,
      weightSleep: 25,
      weightHabits: 25,
      weightSocial: 15,
    },
  },
  {
    key: 'vihaan',
    email: 'vihaan.patel@flately.demo',
    name: 'Vihaan Patel',
    googleId: 'google-seed-vihaan',
    picture: 'https://i.pravatar.cc/200?img=31',
    profile: {
      age: 29,
      gender: 'male',
      bio: 'Finance professional. Calm lifestyle, no smoking, loves board games.',
      city: 'Mumbai',
      hasRoom: true,
      occupation: 'Finance Analyst',
      sleepSchedule: 'early-bird',
      noiseLevel: 2,
      guestPolicy: 'rarely',
      smoking: 'no',
      pets: 'no',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 18000,
      maxBudget: 32000,
      city: 'Mumbai',
      cleanliness: 4,
      sleepSchedule: 2,
      smoking: false,
      drinking: true,
      pets: false,
      socialLevel: 3,
      weightCleanliness: 30,
      weightSleep: 30,
      weightHabits: 25,
      weightSocial: 15,
    },
  },
  {
    key: 'isha',
    email: 'isha.menon@flately.demo',
    name: 'Isha Menon',
    googleId: 'google-seed-isha',
    picture: 'https://i.pravatar.cc/200?img=41',
    profile: {
      age: 26,
      gender: 'female',
      bio: 'Marketing manager who enjoys cafe hopping and weekend treks.',
      city: 'Pune',
      hasRoom: false,
      occupation: 'Marketing Manager',
      sleepSchedule: 'flexible',
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'outside',
      pets: 'have',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 12000,
      maxBudget: 22000,
      city: 'Pune',
      cleanliness: 3,
      sleepSchedule: 3,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 4,
      weightCleanliness: 25,
      weightSleep: 20,
      weightHabits: 25,
      weightSocial: 30,
    },
  },
  {
    key: 'kabir',
    email: 'kabir.verma@flately.demo',
    name: 'Kabir Verma',
    googleId: 'google-seed-kabir',
    picture: 'https://i.pravatar.cc/200?img=51',
    profile: {
      age: 28,
      gender: 'male',
      bio: 'Operations consultant. Quiet weekdays, social weekends, and neat routines.',
      city: 'Delhi',
      hasRoom: true,
      occupation: 'Consultant',
      sleepSchedule: 'night-owl',
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'no',
      pets: 'allergic',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 14000,
      maxBudget: 28000,
      city: 'Delhi',
      cleanliness: 4,
      sleepSchedule: 4,
      smoking: false,
      drinking: true,
      pets: false,
      socialLevel: 4,
      weightCleanliness: 25,
      weightSleep: 30,
      weightHabits: 25,
      weightSocial: 20,
    },
  },
  {
    key: 'meera',
    email: 'meera.nair@flately.demo',
    name: 'Meera Nair',
    googleId: 'google-seed-meera',
    picture: 'https://i.pravatar.cc/200?img=61',
    profile: {
      age: 24,
      gender: 'female',
      bio: 'Data scientist. Loves books, filter coffee, and well-organized spaces.',
      city: 'Bengaluru',
      hasRoom: false,
      occupation: 'Data Scientist',
      sleepSchedule: 'early-bird',
      noiseLevel: 2,
      guestPolicy: 'rarely',
      smoking: 'no',
      pets: 'love',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 11000,
      maxBudget: 21000,
      city: 'Bengaluru',
      cleanliness: 5,
      sleepSchedule: 2,
      smoking: false,
      drinking: false,
      pets: true,
      socialLevel: 2,
      weightCleanliness: 35,
      weightSleep: 25,
      weightHabits: 25,
      weightSocial: 15,
    },
  },
  {
    key: 'raghav',
    email: 'raghav.singh@flately.demo',
    name: 'Raghav Singh',
    googleId: 'google-seed-raghav',
    picture: 'https://i.pravatar.cc/200?img=71',
    profile: {
      age: 30,
      gender: 'male',
      bio: 'Startup founder. Likes energetic homes and spontaneous outings.',
      city: 'Mumbai',
      hasRoom: false,
      occupation: 'Founder',
      sleepSchedule: 'night-owl',
      noiseLevel: 4,
      guestPolicy: 'often',
      smoking: 'outside',
      pets: 'no',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 20000,
      maxBudget: 36000,
      city: 'Mumbai',
      cleanliness: 3,
      sleepSchedule: 5,
      smoking: true,
      drinking: true,
      pets: false,
      socialLevel: 5,
      weightCleanliness: 20,
      weightSleep: 30,
      weightHabits: 20,
      weightSocial: 30,
    },
  },
  {
    key: 'sanya',
    email: 'sanya.khanna@flately.demo',
    name: 'Sanya Khanna',
    googleId: 'google-seed-sanya',
    picture: 'https://i.pravatar.cc/200?img=81',
    profile: {
      age: 27,
      gender: 'female',
      bio: 'Lawyer balancing long workdays with dance classes and travel plans.',
      city: 'Delhi',
      hasRoom: true,
      occupation: 'Lawyer',
      sleepSchedule: 'flexible',
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'no',
      pets: 'have',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 15000,
      maxBudget: 30000,
      city: 'Delhi',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 4,
      weightCleanliness: 25,
      weightSleep: 25,
      weightHabits: 25,
      weightSocial: 25,
    },
  },
  {
    key: 'aditya',
    email: 'aditya.joshi@flately.demo',
    name: 'Aditya Joshi',
    googleId: 'google-seed-aditya',
    picture: 'https://i.pravatar.cc/200?img=12',
    profile: {
      age: 23,
      gender: 'male',
      bio: 'Master\'s student into fitness, coding side-projects, and gaming nights.',
      city: 'Pune',
      hasRoom: false,
      occupation: 'Student',
      sleepSchedule: 'night-owl',
      noiseLevel: 4,
      guestPolicy: 'often',
      smoking: 'no',
      pets: 'love',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 8000,
      maxBudget: 16000,
      city: 'Pune',
      cleanliness: 3,
      sleepSchedule: 4,
      smoking: false,
      drinking: true,
      pets: true,
      socialLevel: 5,
      weightCleanliness: 20,
      weightSleep: 25,
      weightHabits: 20,
      weightSocial: 35,
    },
  },
  {
    key: 'priya',
    email: 'priya.iyer@flately.demo',
    name: 'Priya Iyer',
    googleId: 'google-seed-priya',
    picture: 'https://i.pravatar.cc/200?img=22',
    profile: {
      age: 28,
      gender: 'female',
      bio: 'HR lead who prefers peaceful evenings, clean kitchens, and pet-friendly homes.',
      city: 'Hyderabad',
      hasRoom: true,
      occupation: 'HR Lead',
      sleepSchedule: 'early-bird',
      noiseLevel: 2,
      guestPolicy: 'rarely',
      smoking: 'no',
      pets: 'love',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 13000,
      maxBudget: 25000,
      city: 'Hyderabad',
      cleanliness: 5,
      sleepSchedule: 2,
      smoking: false,
      drinking: false,
      pets: true,
      socialLevel: 3,
      weightCleanliness: 35,
      weightSleep: 25,
      weightHabits: 25,
      weightSocial: 15,
    },
  },
  {
    key: 'nikhil',
    email: 'nikhil.desai@flately.demo',
    name: 'Nikhil Desai',
    googleId: 'google-seed-nikhil',
    picture: 'https://i.pravatar.cc/200?img=32',
    profile: {
      age: 31,
      gender: 'male',
      bio: 'Sales manager, frequent traveler, values practical and respectful housemates.',
      city: 'Mumbai',
      hasRoom: true,
      occupation: 'Sales Manager',
      sleepSchedule: 'flexible',
      noiseLevel: 3,
      guestPolicy: 'sometimes',
      smoking: 'outside',
      pets: 'no',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 17000,
      maxBudget: 32000,
      city: 'Mumbai',
      cleanliness: 4,
      sleepSchedule: 3,
      smoking: true,
      drinking: true,
      pets: false,
      socialLevel: 4,
      weightCleanliness: 25,
      weightSleep: 25,
      weightHabits: 30,
      weightSocial: 20,
    },
  },
  {
    key: 'kavya',
    email: 'kavya.gupta@flately.demo',
    name: 'Kavya Gupta',
    googleId: 'google-seed-kavya',
    picture: 'https://i.pravatar.cc/200?img=42',
    profile: {
      age: 24,
      gender: 'female',
      bio: 'Content creator and photographer, loves vibrant spaces and new people.',
      city: 'Bengaluru',
      hasRoom: false,
      occupation: 'Content Creator',
      sleepSchedule: 'night-owl',
      noiseLevel: 4,
      guestPolicy: 'often',
      smoking: 'outside',
      pets: 'have',
    },
    preference: {
      genderPreference: 'any',
      minBudget: 10000,
      maxBudget: 19000,
      city: 'Bengaluru',
      cleanliness: 3,
      sleepSchedule: 4,
      smoking: true,
      drinking: true,
      pets: true,
      socialLevel: 5,
      weightCleanliness: 20,
      weightSleep: 20,
      weightHabits: 20,
      weightSocial: 40,
    },
  },
];

const swipes: SwipeSeed[] = [
  { from: 'aarav', to: 'meera', action: 'like' },
  { from: 'meera', to: 'aarav', action: 'like' },
  { from: 'vihaan', to: 'sanya', action: 'like' },
  { from: 'sanya', to: 'vihaan', action: 'like' },
  { from: 'kabir', to: 'isha', action: 'like' },
  { from: 'isha', to: 'kabir', action: 'like' },
  { from: 'priya', to: 'ananya', action: 'like' },
  { from: 'ananya', to: 'priya', action: 'like' },
  { from: 'aditya', to: 'kavya', action: 'like' },
  { from: 'kavya', to: 'aditya', action: 'like' },
  { from: 'raghav', to: 'nikhil', action: 'like' },
  { from: 'nikhil', to: 'raghav', action: 'like' },
  { from: 'aarav', to: 'kavya', action: 'dislike' },
  { from: 'meera', to: 'aditya', action: 'dislike' },
  { from: 'vihaan', to: 'raghav', action: 'dislike' },
  { from: 'priya', to: 'kavya', action: 'dislike' },
];

const matches: MatchSeed[] = [
  { key: 'aarav-meera', userA: 'aarav', userB: 'meera' },
  { key: 'vihaan-sanya', userA: 'vihaan', userB: 'sanya' },
  { key: 'kabir-isha', userA: 'kabir', userB: 'isha' },
  { key: 'ananya-priya', userA: 'ananya', userB: 'priya' },
  { key: 'aditya-kavya', userA: 'aditya', userB: 'kavya' },
  { key: 'raghav-nikhil', userA: 'raghav', userB: 'nikhil' },
];

const messages: MessageSeed[] = [
  {
    matchKey: 'aarav-meera',
    sender: 'aarav',
    content: 'Hi Meera, I saw we both prefer calm weekdays. Want to connect?',
  },
  {
    matchKey: 'aarav-meera',
    sender: 'meera',
    content: 'Hey Aarav! Yes, that sounds great. Which area in Bengaluru are you in?',
  },
  {
    matchKey: 'vihaan-sanya',
    sender: 'sanya',
    content: 'Hi Vihaan, your place setup looked nice. Is it near metro access?',
  },
  {
    matchKey: 'kabir-isha',
    sender: 'kabir',
    content: 'Hi Isha, I usually work late. Hope that works for your schedule.',
  },
  {
    matchKey: 'ananya-priya',
    sender: 'priya',
    content: 'Great to match! I am looking around Hitech City.',
  },
  {
    matchKey: 'aditya-kavya',
    sender: 'kavya',
    content: 'Hi Aditya, I am open to a shared setup near Baner.',
  },
  {
    matchKey: 'raghav-nikhil',
    sender: 'nikhil',
    content: 'Hi Raghav, we might align on flexible routines. Let us discuss.',
  },
];

function orderedPair(userIdA: string, userIdB: string): { userAId: string; userBId: string } {
  return userIdA < userIdB
    ? { userAId: userIdA, userBId: userIdB }
    : { userAId: userIdB, userBId: userIdA };
}

async function seedUsers() {
  const userByKey = new Map<string, { id: string }>();

  for (const entry of users) {
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: {
        googleId: entry.googleId,
        name: entry.name,
        picture: entry.picture,
      },
      create: {
        googleId: entry.googleId,
        email: entry.email,
        name: entry.name,
        picture: entry.picture,
      },
      select: { id: true },
    });

    userByKey.set(entry.key, user);
  }

  return userByKey;
}

async function seedProfilesAndPreferences(userByKey: Map<string, { id: string }>) {
  for (const entry of users) {
    const user = userByKey.get(entry.key);

    if (!user) {
      throw new Error(`MISSING_USER_${entry.key}`);
    }

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...entry.profile,
        photos: [entry.picture],
        onboardingCompleted: true,
      },
      create: {
        userId: user.id,
        ...entry.profile,
        photos: [entry.picture],
        onboardingCompleted: true,
      },
    });

    await prisma.preference.upsert({
      where: { userId: user.id },
      update: {
        ...entry.preference,
      },
      create: {
        userId: user.id,
        ...entry.preference,
      },
    });
  }
}

async function seedSwipes(userByKey: Map<string, { id: string }>) {
  for (const entry of swipes) {
    const fromUser = userByKey.get(entry.from);
    const toUser = userByKey.get(entry.to);

    if (!fromUser || !toUser) {
      throw new Error(`MISSING_SWIPE_USER_${entry.from}_${entry.to}`);
    }

    await prisma.swipe.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: toUser.id,
        },
      },
      update: {
        action: entry.action,
      },
      create: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        action: entry.action,
      },
    });
  }
}

async function seedMatchesAndConversations(userByKey: Map<string, { id: string }>) {
  const conversationByMatchKey = new Map<string, { id: string }>();

  for (const entry of matches) {
    const userA = userByKey.get(entry.userA);
    const userB = userByKey.get(entry.userB);

    if (!userA || !userB) {
      throw new Error(`MISSING_MATCH_USER_${entry.userA}_${entry.userB}`);
    }

    const ordered = orderedPair(userA.id, userB.id);

    const match = await prisma.match.upsert({
      where: {
        userAId_userBId: ordered,
      },
      update: {},
      create: ordered,
      select: { id: true },
    });

    const conversation = await prisma.conversation.upsert({
      where: {
        matchId: match.id,
      },
      update: {},
      create: {
        matchId: match.id,
      },
      select: { id: true },
    });

    conversationByMatchKey.set(entry.key, conversation);
  }

  return conversationByMatchKey;
}

async function seedMessages(
  userByKey: Map<string, { id: string }>,
  conversationByMatchKey: Map<string, { id: string }>,
) {
  for (const message of messages) {
    const conversation = conversationByMatchKey.get(message.matchKey);
    const sender = userByKey.get(message.sender);

    if (!conversation || !sender) {
      throw new Error(`MISSING_MESSAGE_LINK_${message.matchKey}_${message.sender}`);
    }

    const existing = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        senderId: sender.id,
        content: message.content,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: sender.id,
        content: message.content,
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding Flately database with Indian demo data...');

  const userByKey = await seedUsers();
  console.log(`✅ Users upserted: ${userByKey.size}`);

  await seedProfilesAndPreferences(userByKey);
  console.log('✅ Profiles + preferences upserted');

  await seedSwipes(userByKey);
  console.log(`✅ Swipes upserted: ${swipes.length}`);

  const conversationByMatchKey = await seedMatchesAndConversations(userByKey);
  console.log(`✅ Matches + conversations upserted: ${conversationByMatchKey.size}`);

  await seedMessages(userByKey, conversationByMatchKey);
  console.log(`✅ Messages ensured: ${messages.length}`);

  console.log('🎉 Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
