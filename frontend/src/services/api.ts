import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { runtimeConfig } from '@/config/runtimeConfig'

type TokenGetter = () => string | null
type UnauthorizedHandler = () => void

let tokenGetter: TokenGetter = () => null
let unauthorizedHandler: UnauthorizedHandler = () => undefined
let unauthorizedTriggered = false

export function setAccessTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
  unauthorizedTriggered = false
}

export const apiClient = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status
      const requestUrl = error.config?.url || ''
      const isAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/signup')

      if (status === 401 && !isAuthRequest && !unauthorizedTriggered) {
        unauthorizedTriggered = true
        unauthorizedHandler()
      }
    }

    return Promise.reject(error)
  },
)

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config)
  return response.data
}

export function toApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (!(error instanceof AxiosError)) {
    return error instanceof Error ? error.message : fallback
  }

  const data = error.response?.data
  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.error === 'string') {
      return record.error
    }
    if (typeof record.message === 'string') {
      return record.message
    }
  }

  return error.message || fallback
}
