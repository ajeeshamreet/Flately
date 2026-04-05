export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type User = {
  id: string
  email: string
  name?: string | null
  picture?: string | null
}

export type Profile = {
  id: string
  userId: string
  name?: string | null
  age?: number | null
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null
  bio?: string | null
  photos: string[]
  city?: string | null
  hasRoom: boolean
  occupation?: 'student' | 'professional' | null
  sleepSchedule?: 'early-bird' | 'night-owl' | 'flexible' | null
  noiseLevel?: number | null
  guestPolicy?: 'never' | 'rarely' | 'sometimes' | 'often' | null
  smoking?: 'no' | 'outside' | 'yes' | null
  pets?: 'no' | 'have' | 'love' | 'allergic' | null
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type Preference = {
  id: string
  userId: string
  genderPreference: 'male' | 'female' | 'any'
  minBudget: number
  maxBudget: number
  city: string
  cleanliness: number
  sleepSchedule: number
  smoking: boolean
  drinking: boolean
  pets: boolean
  socialLevel: number
  weightCleanliness: number
  weightSleep: number
  weightHabits: number
  weightSocial: number
  createdAt: string
  updatedAt: string
}

export type DiscoveryProfile = {
  id: string
  name: string
  age: number | null
  gender: string | null
  occupation: string | null
  city: string | null
  hasRoom: boolean
  photos: string[]
  compatibility: number
  budgetMin: number
  budgetMax: number
  tags: string[]
}

export type MatchUser = {
  id: string
  name: string
  age: number | null
  gender: string | null
  occupation: string | null
  city: string | null
  hasRoom: boolean
  photos: string[]
  budgetMin: number
  budgetMax: number
  tags: string[]
}

export type Match = {
  id: string
  matchedAt: string
  createdAt: string
  otherUser: MatchUser
  compatibility: number
  lastMessage: string | null
  conversationId: string | null
}

export type ChatMessage = {
  id: string
  senderId: string
  content: string
  createdAt: string
  timestamp?: string
}

export type ChatConversation = {
  id: string
  matchId: string
  createdAt: string
}

export type ChatOtherUser = {
  id: string
  name: string
  picture?: string | null
  city?: string | null
  occupation?: string | null
}

export type OpenChatResponse = {
  conversation: ChatConversation
  messages: ChatMessage[]
  otherUser: ChatOtherUser | null
}

export type SwipeAction = 'like' | 'dislike' | 'skip' | 'superlike'

export type OnboardingFormData = {
  name: string
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  bio: string
  occupation: 'student' | 'professional'
  photos: string[]
  hasRoom: boolean
  city: string
  minBudget: number
  maxBudget: number
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible'
  noiseLevel: number
  guestPolicy: 'never' | 'rarely' | 'sometimes' | 'often'
  smoking: 'no' | 'outside' | 'yes'
  pets: 'no' | 'have' | 'love' | 'allergic'
  drinking: boolean
  cleanliness: number
  socialLevel: number
  genderPreference: 'male' | 'female' | 'any'
  priorityOrder: Array<'cleanliness' | 'sleep' | 'habits' | 'social'>
}

export type AuthSession = {
  accessToken: string
  user: User
}
