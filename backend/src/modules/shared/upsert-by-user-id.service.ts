export abstract class UpsertByUserIdService<TUpdateData, TCreateData, TResult> {
  protected abstract findByUserId(userId: string): Promise<TResult | null>;
  protected abstract updateByUserId(userId: string, data: TUpdateData): Promise<TResult>;
  protected abstract mapCreateData(userId: string, data: TUpdateData): TCreateData;
  protected abstract createByUserId(data: TCreateData): Promise<TResult>;

  async upsert(userId: string, data: TUpdateData): Promise<TResult> {
    const existing = await this.findByUserId(userId);

    if (existing) {
      return this.updateByUserId(userId, data);
    }

    return this.createByUserId(this.mapCreateData(userId, data));
  }
}