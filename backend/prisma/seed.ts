import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load backend/.env and override any existing env vars so repository .env takes precedence
dotenv.config({ override: true });

// Mask credentials when logging
const rawDbUrl = process.env.DATABASE_URL;
const maskedDbUrl = rawDbUrl
  ? rawDbUrl.replace(/(mongodb(?:\+srv)?:\/\/)([^:@\n]+):([^@\n]+)@/, "$1<REDACTED>@")
  : undefined;
if (maskedDbUrl) {
  console.log('Using DATABASE_URL (masked):', maskedDbUrl);
} else {
  console.log('No DATABASE_URL found in environment');
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: {
        googleId: "google-seed-alice",
        email: "alice@example.com",
        name: "Alice",
        picture: "https://i.pravatar.cc/150?img=1",
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: {
        googleId: "google-seed-bob",
        email: "bob@example.com",
        name: "Bob",
        picture: "https://i.pravatar.cc/150?img=2",
      },
    }),
    prisma.user.upsert({
      where: { email: "carol@example.com" },
      update: {},
      create: {
        googleId: "google-seed-carol",
        email: "carol@example.com",
        name: "Carol",
        picture: "https://i.pravatar.cc/150?img=3",
      },
    }),
    prisma.user.upsert({
      where: { email: "dave@example.com" },
      update: {},
      create: {
        googleId: "google-seed-dave",
        email: "dave@example.com",
        name: "Dave",
        picture: "https://i.pravatar.cc/150?img=4",
      },
    }),
  ]);

  const [alice, bob, carol, dave] = users;
  console.log("✅ Users created");

  // ─── Profiles ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.profile.upsert({
      where: { userId: alice.id },
      update: {},
      create: {
        userId: alice.id,
        name: "Alice",
        age: 24,
        gender: "female",
        bio: "Software engineer, love cooking and hiking.",
        photos: ["https://i.pravatar.cc/300?img=1"],
        city: "Mumbai",
        hasRoom: true,
        occupation: "Engineer",
        sleepSchedule: "early-bird",
        noiseLevel: 2,
        guestPolicy: "rarely",
        smoking: "no",
        pets: "love",
        onboardingCompleted: true,
      },
    }),
    prisma.profile.upsert({
      where: { userId: bob.id },
      update: {},
      create: {
        userId: bob.id,
        name: "Bob",
        age: 26,
        gender: "male",
        bio: "Designer. Night owl. Big into music.",
        photos: ["https://i.pravatar.cc/300?img=2"],
        city: "Mumbai",
        hasRoom: false,
        occupation: "Designer",
        sleepSchedule: "night-owl",
        noiseLevel: 4,
        guestPolicy: "sometimes",
        smoking: "outside",
        pets: "no",
        onboardingCompleted: true,
      },
    }),
    prisma.profile.upsert({
      where: { userId: carol.id },
      update: {},
      create: {
        userId: carol.id,
        name: "Carol",
        age: 23,
        gender: "female",
        bio: "Med student. Quiet, clean, studious.",
        photos: ["https://i.pravatar.cc/300?img=3"],
        city: "Delhi",
        hasRoom: false,
        occupation: "Student",
        sleepSchedule: "early-bird",
        noiseLevel: 1,
        guestPolicy: "never",
        smoking: "no",
        pets: "allergic",
        onboardingCompleted: true,
      },
    }),
    prisma.profile.upsert({
      where: { userId: dave.id },
      update: {},
      create: {
        userId: dave.id,
        name: "Dave",
        age: 28,
        gender: "male",
        bio: "Startup guy. Work hard, play hard.",
        photos: ["https://i.pravatar.cc/300?img=4"],
        city: "Mumbai",
        hasRoom: true,
        occupation: "Entrepreneur",
        sleepSchedule: "flexible",
        noiseLevel: 3,
        guestPolicy: "often",
        smoking: "no",
        pets: "have",
        onboardingCompleted: true,
      },
    }),
  ]);
  console.log("✅ Profiles created");

  // ─── Preferences ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.preference.upsert({
      where: { userId: alice.id },
      update: {},
      create: {
        userId: alice.id,
        genderPreference: "any",
        minBudget: 8000,
        maxBudget: 15000,
        city: "Mumbai",
        cleanliness: 4,
        sleepSchedule: 2,
        smoking: false,
        drinking: true,
        pets: true,
        socialLevel: 3,
        weightCleanliness: 30,
        weightSleep: 25,
        weightHabits: 25,
        weightSocial: 20,
      },
    }),
    prisma.preference.upsert({
      where: { userId: bob.id },
      update: {},
      create: {
        userId: bob.id,
        genderPreference: "any",
        minBudget: 6000,
        maxBudget: 12000,
        city: "Mumbai",
        cleanliness: 3,
        sleepSchedule: 5,
        smoking: false,
        drinking: true,
        pets: false,
        socialLevel: 4,
        weightCleanliness: 20,
        weightSleep: 30,
        weightHabits: 20,
        weightSocial: 30,
      },
    }),
    prisma.preference.upsert({
      where: { userId: carol.id },
      update: {},
      create: {
        userId: carol.id,
        genderPreference: "female",
        minBudget: 5000,
        maxBudget: 10000,
        city: "Delhi",
        cleanliness: 5,
        sleepSchedule: 1,
        smoking: false,
        drinking: false,
        pets: false,
        socialLevel: 1,
        weightCleanliness: 40,
        weightSleep: 30,
        weightHabits: 20,
        weightSocial: 10,
      },
    }),
    prisma.preference.upsert({
      where: { userId: dave.id },
      update: {},
      create: {
        userId: dave.id,
        genderPreference: "any",
        minBudget: 10000,
        maxBudget: 20000,
        city: "Mumbai",
        cleanliness: 3,
        sleepSchedule: 3,
        smoking: false,
        drinking: true,
        pets: true,
        socialLevel: 5,
        weightCleanliness: 20,
        weightSleep: 20,
        weightHabits: 25,
        weightSocial: 35,
      },
    }),
  ]);
  console.log("✅ Preferences created");

  // ─── Swipes ───────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.swipe.upsert({
      where: { fromUserId_toUserId: { fromUserId: alice.id, toUserId: bob.id } },
      update: {},
      create: { fromUserId: alice.id, toUserId: bob.id, action: "like" },
    }),
    prisma.swipe.upsert({
      where: { fromUserId_toUserId: { fromUserId: bob.id, toUserId: alice.id } },
      update: {},
      create: { fromUserId: bob.id, toUserId: alice.id, action: "like" },
    }),
    prisma.swipe.upsert({
      where: { fromUserId_toUserId: { fromUserId: alice.id, toUserId: dave.id } },
      update: {},
      create: { fromUserId: alice.id, toUserId: dave.id, action: "like" },
    }),
    prisma.swipe.upsert({
      where: { fromUserId_toUserId: { fromUserId: carol.id, toUserId: bob.id } },
      update: {},
      create: { fromUserId: carol.id, toUserId: bob.id, action: "skip" },
    }),
  ]);
  console.log("✅ Swipes created");

  // ─── Match ────────────────────────────────────────────────────────────────
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId: alice.id, userBId: bob.id } },
    update: {},
    create: { userAId: alice.id, userBId: bob.id },
  });
  console.log("✅ Match created");

  // ─── Conversation ─────────────────────────────────────────────────────────
  const conversation = await prisma.conversation.upsert({
    where: { matchId: match.id },
    update: {},
    create: { matchId: match.id },
  });
  console.log("✅ Conversation created");

  // ─── Messages (individual creates — MongoDB has no skipDuplicates) ─────────
  const messageData = [
    {
      conversationId: conversation.id,
      senderId: alice.id,
      content: "Hey Bob! Looks like we matched 👋",
    },
    {
      conversationId: conversation.id,
      senderId: bob.id,
      content: "Hey Alice! Yeah, your place in Mumbai looks great.",
    },
    {
      conversationId: conversation.id,
      senderId: alice.id,
      content: "Thanks! When would you like to visit?",
    },
  ];

  for (const msg of messageData) {
    await prisma.message.create({ data: msg });
  }
  console.log("✅ Messages created");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });