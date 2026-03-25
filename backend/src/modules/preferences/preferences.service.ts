import prisma from '../../config/prisma';

type PreferenceData = Parameters<typeof prisma.preference.update>[0]['data'];

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

export async function getPreferences(userId: string) {
  return prisma.preference.findUnique({ where: { userId } });
}

export async function savePreferences(userId: string, data: PreferenceData) {
  if (!validateWeights(data)) {
    throw new Error('INVALID_WEIGHTS');
  }

  const existing = await prisma.preference.findUnique({ where: { userId } });

  if (existing) {
    return prisma.preference.update({ where: { userId }, data });
  }

  return prisma.preference.create({
    data: {
      ...(data as Record<string, unknown>),
      userId,
    } as Parameters<typeof prisma.preference.create>[0]['data'],
  });
}
