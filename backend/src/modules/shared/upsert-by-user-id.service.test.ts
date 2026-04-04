import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpsertByUserIdService } from './upsert-by-user-id.service';

type UpdateData = { setting: string };
type CreateData = { userId: string; setting: string };
type Result = { id: string; userId: string; setting: string };

const findByUserId = vi.fn<(userId: string) => Promise<Result | null>>();
const updateByUserId = vi.fn<(userId: string, data: UpdateData) => Promise<Result>>();
const mapCreateData = vi.fn<(userId: string, data: UpdateData) => CreateData>();
const createByUserId = vi.fn<(data: CreateData) => Promise<Result>>();

class TestUpsertService extends UpsertByUserIdService<UpdateData, CreateData, Result> {
  protected findByUserId(userId: string): Promise<Result | null> {
    return findByUserId(userId);
  }

  protected updateByUserId(userId: string, data: UpdateData): Promise<Result> {
    return updateByUserId(userId, data);
  }

  protected mapCreateData(userId: string, data: UpdateData): CreateData {
    return mapCreateData(userId, data);
  }

  protected createByUserId(data: CreateData): Promise<Result> {
    return createByUserId(data);
  }
}

describe('UpsertByUserIdService', () => {
  const service = new TestUpsertService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses update path when existing record is present', async () => {
    const userId = 'user-1';
    const data: UpdateData = { setting: 'updated' };
    const existing: Result = { id: '1', userId, setting: 'old' };
    const updated: Result = { id: '1', userId, setting: 'updated' };

    findByUserId.mockResolvedValue(existing);
    updateByUserId.mockResolvedValue(updated);

    const result = await service.upsert(userId, data);

    expect(findByUserId).toHaveBeenCalledWith(userId);
    expect(updateByUserId).toHaveBeenCalledWith(userId, data);
    expect(mapCreateData).not.toHaveBeenCalled();
    expect(createByUserId).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  it('uses create path when existing record is missing', async () => {
    const userId = 'user-2';
    const data: UpdateData = { setting: 'new' };
    const mappedCreateData: CreateData = { userId, setting: 'new' };
    const created: Result = { id: '2', userId, setting: 'new' };

    findByUserId.mockResolvedValue(null);
    mapCreateData.mockReturnValue(mappedCreateData);
    createByUserId.mockResolvedValue(created);

    const result = await service.upsert(userId, data);

    expect(findByUserId).toHaveBeenCalledWith(userId);
    expect(updateByUserId).not.toHaveBeenCalled();
    expect(mapCreateData).toHaveBeenCalledWith(userId, data);
    expect(createByUserId).toHaveBeenCalledWith(mappedCreateData);
    expect(result).toEqual(created);
  });
});