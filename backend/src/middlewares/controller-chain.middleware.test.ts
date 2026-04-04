import { NextFunction } from 'express';
import { describe, expect, it, vi } from 'vitest';
import {
  requireAuthenticatedUser,
  withAuthenticatedController,
} from './controller-chain.middleware';

function createMockResponse() {
  const res = {
    headersSent: false,
    status: vi.fn(),
    json: vi.fn(),
  } as any;

  res.status.mockReturnValue(res);
  return res;
}

describe('requireAuthenticatedUser', () => {
  it('returns 401 with default body when userId is missing', () => {
    const middleware = requireAuthenticatedUser();
    const req = {} as any;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when userId exists', () => {
    const middleware = requireAuthenticatedUser();
    const req = { userId: 'user-1' } as any;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('withAuthenticatedController', () => {
  it('maps domain error to configured status/body', () => {
    const controller = vi.fn();
    const chain = withAuthenticatedController(controller as any, {
      domainErrors: {
        INVALID_WEIGHTS: {
          status: 400,
          body: { message: 'weights must sum to 100' },
        },
      },
      fallbackError: {
        status: 500,
        body: { message: 'fallback' },
      },
    });

    const errorMiddleware = chain[2] as any;
    const req = {} as any;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    errorMiddleware(new Error('INVALID_WEIGHTS'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'weights must sum to 100' });
    expect(next).not.toHaveBeenCalled();
  });

  it('falls back to configured fallback body for unknown errors', () => {
    const controller = vi.fn();
    const chain = withAuthenticatedController(controller as any, {
      fallbackError: {
        status: 503,
        body: { message: 'service temporarily unavailable' },
      },
    });

    const errorMiddleware = chain[2] as any;
    const req = {} as any;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      return;
    });

    errorMiddleware(new Error('UNKNOWN_ERROR'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ message: 'service temporarily unavailable' });
    expect(next).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});