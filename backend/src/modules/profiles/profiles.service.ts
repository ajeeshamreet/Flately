import prisma from '../../config/prisma';
import { UpsertByUserIdService } from '../shared/upsert-by-user-id.service';

type ProfileUpdateData = Parameters<typeof prisma.profile.update>[0]['data'];
type ProfileCreateData = Parameters<typeof prisma.profile.create>[0]['data'];
type ProfileRecord = Awaited<ReturnType<typeof prisma.profile.update>>;

class ProfileUpsertService extends UpsertByUserIdService<
  ProfileUpdateData,
  ProfileCreateData,
  ProfileRecord
> {
  protected findByUserId(userId: string): Promise<ProfileRecord | null> {
    return prisma.profile.findUnique({ where: { userId } });
  }

  protected updateByUserId(userId: string, data: ProfileUpdateData): Promise<ProfileRecord> {
    return prisma.profile.update({ where: { userId }, data });
  }

  protected mapCreateData(userId: string, data: ProfileUpdateData): ProfileCreateData {
    return {
      ...(data as Record<string, unknown>),
      userId,
    } as ProfileCreateData;
  }

  protected createByUserId(data: ProfileCreateData): Promise<ProfileRecord> {
    return prisma.profile.create({ data });
  }
}

const profileUpsertService = new ProfileUpsertService();

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function createOrUpdateProfile(userId: string, data: ProfileUpdateData) {
  return profileUpsertService.upsert(userId, data);
}
