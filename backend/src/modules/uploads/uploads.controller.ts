import { Response } from 'express';
import { AuthRequest } from '../../types/auth';
import { getCloudinaryUploadSignature } from './uploads.service';

export async function createUploadSignature(_req: AuthRequest, res: Response): Promise<void> {
  const payload = getCloudinaryUploadSignature();
  res.json(payload);
}
