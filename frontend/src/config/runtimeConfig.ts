type RuntimeConfig = {
  apiBaseUrl: string
  socketUrl: string
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
}

function readEnv(name: string, fallback = ''): string {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : fallback
}

export const runtimeConfig: RuntimeConfig = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL', 'http://localhost:4000'),
  socketUrl: readEnv('VITE_SOCKET_URL', 'http://localhost:4000'),
  cloudinaryCloudName: readEnv('VITE_CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryUploadPreset: readEnv('VITE_CLOUDINARY_UPLOAD_PRESET', ''),
}
