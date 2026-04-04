import {
  ErrorRequestHandler,
  NextFunction,
  RequestHandler,
  Response,
} from 'express';
import { AuthRequest } from '../types/auth';

type JsonBody = Record<string, unknown>;

export interface ErrorResponseConfig {
  status: number;
  body: JsonBody;
}

export interface ControllerChainOptions {
  unauthorizedBody?: JsonBody;
  domainErrors?: Record<string, ErrorResponseConfig>;
  fallbackError?: ErrorResponseConfig;
  logPrefix?: string;
}

type AuthenticatedController = (req: AuthRequest, res: Response) => Promise<void> | void;

export function requireAuthenticatedUser(
  unauthorizedBody: JsonBody = { message: 'Unauthorized' },
): RequestHandler {
  return (req, res, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json(unauthorizedBody);
      return;
    }

    next();
  };
}

function domainErrorToHttp(options: ControllerChainOptions): ErrorRequestHandler {
  const fallbackError: ErrorResponseConfig = options.fallbackError ?? {
    status: 500,
    body: { message: 'Internal server error' },
  };

  return (error, _req, res, next): void => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const domainCode = error instanceof Error ? error.message : undefined;
    const mapped = domainCode ? options.domainErrors?.[domainCode] : undefined;

    if (mapped) {
      res.status(mapped.status).json(mapped.body);
      return;
    }

    if (options.logPrefix) {
      console.error(options.logPrefix, error);
    } else {
      console.error(error);
    }

    res.status(fallbackError.status).json(fallbackError.body);
  };
}

export function withAuthenticatedController(
  handler: AuthenticatedController,
  options: ControllerChainOptions = {},
): Array<RequestHandler | ErrorRequestHandler> {
  return [
    requireAuthenticatedUser(options.unauthorizedBody),
    handler as RequestHandler,
    domainErrorToHttp(options),
  ];
}