import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { AuthRequest } from '../types/auth';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const checkJwt: RequestHandler = (req, res, next): void => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (typeof payload === 'string') {
      throw new Error('INVALID_TOKEN_PAYLOAD');
    }

    const authReq = req as AuthRequest;
    authReq.auth = {
      payload: {
        sub: typeof payload.sub === 'string' ? payload.sub : undefined,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        name: typeof payload.name === 'string' ? payload.name : undefined,
        picture: typeof payload.picture === 'string' ? payload.picture : undefined,
      },
    };

    next();
  } catch (_error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const attachUserId = (req: Request, _res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  const subject = authReq.auth?.payload?.sub;

  if (typeof subject === 'string' && OBJECT_ID_PATTERN.test(subject)) {
    authReq.userId = subject;
  } else {
    authReq.userId = undefined;
  }

  next();
};

export default [checkJwt, attachUserId] as RequestHandler[];
