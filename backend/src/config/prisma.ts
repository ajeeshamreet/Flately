import { PrismaClient } from '@prisma/client';

let _client: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!_client) {
    _client = new PrismaClient();
  }
  return _client;
}

// Export a proxy that lazily instantiates PrismaClient on first property access.
// This prevents the client from being created at module-evaluation time,
// allowing callers to load environment variables before the client is constructed.
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  set(_target, prop, value) {
    const client = getPrismaClient();
    (client as any)[prop] = value;
    return true;
  },
}) as PrismaClient;

export default prisma;



