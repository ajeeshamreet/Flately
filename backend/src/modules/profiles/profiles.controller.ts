import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { createOrUpdateProfile, getProfileByUserId } from './profiles.service';

export async function getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const profile = await getProfileByUserId(userId);
  res.json(profile);
}

export async function saveProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const body = req.body as Record<string, unknown>;

  // Extract all onboarding fields
  const profileData = {
    // Basic info
    name: body.name as string | undefined,
    age: body.age as number | undefined,
    gender: body.gender as string | undefined,
    bio: body.bio as string | undefined,
    photos: body.photos as string[] | undefined,

    // Location & housing
    city: body.city as string | undefined,
    hasRoom: body.hasRoom as boolean | undefined,
    occupation: body.occupation as string | undefined,

    // Lifestyle
    sleepSchedule: body.sleepSchedule as string | undefined,
    noiseLevel: body.noiseLevel as number | undefined,
    guestPolicy: body.guestPolicy as string | undefined,
    smoking: body.smoking as string | undefined,
    pets: body.pets as string | undefined,

    // Mark onboarding as completed
    onboardingCompleted: true,
  };

  // Remove undefined values
  const cleanedData = Object.fromEntries(
    Object.entries(profileData).filter(([_, value]) => value !== undefined),
  ) as Parameters<typeof createOrUpdateProfile>[1];

  const profile = await createOrUpdateProfile(userId, cleanedData);
  res.json(profile);
}
