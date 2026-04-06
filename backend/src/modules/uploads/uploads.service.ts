import crypto from 'crypto';
import env from '../../config/env';

type CloudinaryUploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

function normalizeFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, '');
}

function ensureCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
} {
  const cloudName = env.CLOUDINARY_CLOUD_NAME.trim();
  const apiKey = env.CLOUDINARY_API_KEY.trim();
  const apiSecret = env.CLOUDINARY_API_SECRET.trim();
  const folder = normalizeFolder(env.CLOUDINARY_UPLOAD_FOLDER);

  if (!cloudName || !apiKey || !apiSecret || !folder) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}

function createCloudinarySignature(parameters: Record<string, string>, apiSecret: string): string {
  const signatureBase = Object.entries(parameters)
    .filter(([, value]) => value.length > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');
}

export function getCloudinaryUploadSignature(): CloudinaryUploadSignature {
  const { cloudName, apiKey, apiSecret, folder } = ensureCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = createCloudinarySignature(
    {
      folder,
      timestamp: String(timestamp),
    },
    apiSecret,
  );

  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
  };
}
