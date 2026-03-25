export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  age?: number;
  location?: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
}
