import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { createOrUpdateProfile, getProfileByUserId } from './profiles.service';

export async function getMyProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const profile = await getProfileByUserId(userId);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function saveProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
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
      Object.entries(profileData).filter(([_, v]) => v !== undefined)
    );

    const profile = await createOrUpdateProfile(userId, cleanedData);
    res.json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
