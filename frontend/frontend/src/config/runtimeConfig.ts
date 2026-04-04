const DEFAULT_API_BASE_URL = 'http://localhost:4000';
const DEFAULT_AUTH0_DOMAIN = 'dev-aobtnrv6g50bmj1a.us.auth0.com';
const DEFAULT_AUTH0_CLIENT_ID = '2Pz3Q6dir2WRg5lDLW8ucrmo3HG92cOR';

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function readEnvValue(value: string | undefined, fallback: string): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

const apiBaseUrl = normalizeUrl(
  readEnvValue(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
);

const socketUrl = normalizeUrl(
  readEnvValue(import.meta.env.VITE_SOCKET_URL, apiBaseUrl),
);

const auth0Domain = readEnvValue(import.meta.env.VITE_AUTH0_DOMAIN, DEFAULT_AUTH0_DOMAIN);
const auth0ClientId = readEnvValue(import.meta.env.VITE_AUTH0_CLIENT_ID, DEFAULT_AUTH0_CLIENT_ID);
const auth0Audience = readEnvValue(import.meta.env.VITE_AUTH0_AUDIENCE, apiBaseUrl);

export const runtimeConfig = {
  apiBaseUrl,
  socketUrl,
  auth0Domain,
  auth0ClientId,
  auth0Audience,
} as const;
