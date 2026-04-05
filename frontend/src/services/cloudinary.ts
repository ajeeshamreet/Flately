import { runtimeConfig } from '@/config/runtimeConfig'

export async function uploadImageToCloudinary(file: File): Promise<string> {
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

  const json = (await response.json()) as {
    secure_url?: string
    error?: { message?: string }
  }

  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message || 'Failed to upload image')
  }

  return json.secure_url
}
