import { runtimeConfig } from '@/config/runtimeConfig'
import { ApiError, apiRequest } from '@/services/api'

type SignedUploadConfig = {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
}

export type CloudinaryUploadAvailability = 'signed' | 'unsigned' | 'unavailable'

type CloudinaryUploadResponse = {
  secure_url?: string
  error?: {
    message?: string
  }
}

async function parseCloudinaryResponse(response: Response): Promise<string> {
  const json = (await response.json()) as CloudinaryUploadResponse

  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message || 'Failed to upload image')
  }

  return json.secure_url
}

async function uploadWithSignedConfig(file: File, config: SignedUploadConfig): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('timestamp', String(config.timestamp))
  formData.append('signature', config.signature)
  formData.append('api_key', config.apiKey)
  formData.append('folder', config.folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  return parseCloudinaryResponse(response)
}

async function uploadWithUnsignedPreset(file: File): Promise<string> {
  const cloudName = runtimeConfig.cloudinaryCloudName
  const uploadPreset = runtimeConfig.cloudinaryUploadPreset

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  return parseCloudinaryResponse(response)
}

async function getSignedUploadConfig(): Promise<SignedUploadConfig | null> {
  try {
    return await apiRequest<SignedUploadConfig>({
      method: 'POST',
      url: '/uploads/signature',
      data: {},
    })
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 503)) {
      return null
    }

    throw error
  }
}

export async function getCloudinaryUploadAvailability(): Promise<CloudinaryUploadAvailability> {
  const signedConfig = await getSignedUploadConfig()

  if (signedConfig) {
    return 'signed'
  }

  if (runtimeConfig.cloudinaryCloudName && runtimeConfig.cloudinaryUploadPreset) {
    return 'unsigned'
  }

  return 'unavailable'
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const signedConfig = await getSignedUploadConfig()

  if (signedConfig) {
    return uploadWithSignedConfig(file, signedConfig)
  }

  return uploadWithUnsignedPreset(file)
}
