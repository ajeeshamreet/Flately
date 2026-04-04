import { describe, expect, it } from 'vitest';
import { savePreferences } from './preferences.service';

describe('savePreferences INVALID_WEIGHTS validation', () => {
  it('rejects when weights do not sum to 100', async () => {
    await expect(
      savePreferences('user-1', {
        weightCleanliness: 20,
        weightSleep: 20,
        weightHabits: 20,
        weightSocial: 20,
      } as any),
    ).rejects.toThrow('INVALID_WEIGHTS');
  });

  it('rejects when weights payload is malformed', async () => {
    await expect(
      savePreferences('user-1', {
        weightCleanliness: 25,
        weightSleep: 25,
        weightHabits: '25',
        weightSocial: 25,
      } as any),
    ).rejects.toThrow('INVALID_WEIGHTS');
  });
});