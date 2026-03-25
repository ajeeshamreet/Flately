export interface User {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Profile {
  id: string;
  userId: string;
  age?: number;
  gender?: string;
  occupation?: string;
  city?: string;
  hasRoom?: boolean;
  onboardingCompleted?: boolean;
}

export interface Preference {
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
}

export interface Match {
  id: string;
  matchedAt: string;
  compatibility: number;
  conversationId?: string | null;
}
