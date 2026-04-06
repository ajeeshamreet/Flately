import { runtimeConfig } from '@/config/runtimeConfig'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type QueryPrimitive = string | number | boolean | null | undefined

type QueryParams = Record<string, QueryPrimitive>

export type ApiRequestConfig = {
  method: HttpMethod
  url: string
  data?: unknown
  params?: QueryParams
  headers?: Record<string, string>
  timeoutMs?: number
}

type TokenGetter = () => string | null
type UnauthorizedHandler = () => void

let tokenGetter: TokenGetter = () => null
let unauthorizedHandler: UnauthorizedHandler = () => undefined
let unauthorizedTriggered = false

const DEFAULT_TIMEOUT_MS = 15000

type NormalizedRequest = {
  method: HttpMethod
  rawUrl: string
  url: string
  headers: Headers
  body?: BodyInit
  timeoutMs: number
}

type RequestStrategy = {
  send<T>(request: NormalizedRequest): Promise<T>
}

export class ApiError extends Error {
  status?: number
  data?: unknown
  url?: string

  constructor(
    message: string,
    options?: {
      status?: number
      data?: unknown
      url?: string
      cause?: unknown
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options?.status
    this.data = options?.data
    this.url = options?.url

    if (options?.cause !== undefined) {
      ;(this as Error & { cause?: unknown }).cause = options.cause
    }
  }
}

class FetchRequestStrategy implements RequestStrategy {
  async send<T>(request: NormalizedRequest): Promise<T> {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
    }, request.timeoutMs)

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      })

      const payload = await parseResponsePayload(response)

      if (!response.ok) {
        throw new ApiError(extractErrorMessage(payload, response.statusText), {
          status: response.status,
          data: payload,
          url: request.rawUrl,
        })
      }

      return payload as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', {
          url: request.rawUrl,
          cause: error,
        })
      }

      throw new ApiError('Network request failed', {
        url: request.rawUrl,
        cause: error,
      })
    } finally {
      window.clearTimeout(timeout)
    }
  }
}

class HttpClientAdapter {
  constructor(
    private readonly strategy: RequestStrategy,
    private readonly baseUrl: string,
  ) {}

  async request<T>(config: ApiRequestConfig): Promise<T> {
    const normalized = normalizeRequest(config, this.baseUrl, tokenGetter())

    try {
      return await this.strategy.send<T>(normalized)
    } catch (error) {
      if (error instanceof ApiError) {
        handleUnauthorized(error.status, normalized.rawUrl)
      }

      throw error
    }
  }
}

function appendQueryParams(url: URL, params?: QueryParams): void {
  if (!params) {
    return
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue
    }

    url.searchParams.set(key, String(value))
  }
}

function shouldSendJsonBody(data: unknown): boolean {
  if (data === undefined || data === null) {
    return false
  }

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return false
  }

  if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    return false
  }

  return true
}

function normalizeRequest(
  config: ApiRequestConfig,
  baseUrl: string,
  accessToken: string | null,
): NormalizedRequest {
  const url = new URL(config.url, baseUrl)
  appendQueryParams(url, config.params)

  const headers = new Headers(config.headers || {})
  headers.set('Accept', 'application/json')

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let body: BodyInit | undefined

  if (config.data !== undefined) {
    if (shouldSendJsonBody(config.data)) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(config.data)
    } else {
      body = config.data as BodyInit
    }
  }

  const method = config.method.toUpperCase() as HttpMethod

  return {
    method,
    rawUrl: config.url,
    url: url.toString(),
    headers,
    body,
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    if (typeof record.error === 'string') {
      return record.error
    }
    if (typeof record.message === 'string') {
      return record.message
    }
  }

  return fallback || 'Request failed'
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text || undefined
}

function isAuthRequest(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/google/exchange')
  )
}

function handleUnauthorized(status: number | undefined, requestUrl: string): void {
  if (status !== 401 || isAuthRequest(requestUrl) || unauthorizedTriggered) {
    return
  }

  unauthorizedTriggered = true
  unauthorizedHandler()
}

export function setAccessTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
  unauthorizedTriggered = false
}

export const apiClient = new HttpClientAdapter(
  new FetchRequestStrategy(),
  runtimeConfig.apiBaseUrl,
)

export async function apiRequest<T>(config: ApiRequestConfig): Promise<T> {
  return apiClient.request<T>(config)
}

export function toApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof ApiError) {
    return extractErrorMessage(error.data, error.message || fallback)
  }

  return error instanceof Error ? error.message : fallback
}
