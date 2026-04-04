import prisma from '../../config/prisma';
import { UpsertByUserIdService } from '../shared/upsert-by-user-id.service';

type PreferenceData = Parameters<typeof prisma.preference.update>[0]['data'];
type PreferenceCreateData = Parameters<typeof prisma.preference.create>[0]['data'];
type PreferenceRecord = Awaited<ReturnType<typeof prisma.preference.update>>;

interface Weights {
  weightCleanliness: number;
  weightSleep: number;
  weightHabits: number;
  weightSocial: number;
}

function isWeights(value: unknown): value is Weights {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.weightCleanliness === 'number' &&
    typeof candidate.weightSleep === 'number' &&
    typeof candidate.weightHabits === 'number' &&
    typeof candidate.weightSocial === 'number'
  );
}

function validateWeights(weights: unknown): boolean {
  if (!isWeights(weights)) {
    return false;
  }

  const total =
    weights.weightCleanliness +
    weights.weightSleep +
    weights.weightHabits +
    weights.weightSocial;

  return total === 100;
}

class PreferenceUpsertService extends UpsertByUserIdService<
  PreferenceData,
  PreferenceCreateData,
  PreferenceRecord
> {
  protected findByUserId(userId: string): Promise<PreferenceRecord | null> {
    return prisma.preference.findUnique({ where: { userId } });
  }

  protected updateByUserId(userId: string, data: PreferenceData): Promise<PreferenceRecord> {
    return prisma.preference.update({ where: { userId }, data });
  }

  protected mapCreateData(userId: string, data: PreferenceData): PreferenceCreateData {
    return {
      ...(data as Record<string, unknown>),
      userId,
    } as PreferenceCreateData;
  }

  protected createByUserId(data: PreferenceCreateData): Promise<PreferenceRecord> {
    return prisma.preference.create({ data });
  }
}

const preferenceUpsertService = new PreferenceUpsertService();

export async function getPreferences(userId: string) {
  return prisma.preference.findUnique({ where: { userId } });
}

export async function savePreferences(userId: string, data: PreferenceData) {
  if (!validateWeights(data)) {
    throw new Error('INVALID_WEIGHTS');
  }

  return preferenceUpsertService.upsert(userId, data);
}
