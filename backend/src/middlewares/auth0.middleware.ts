import { auth } from 'express-oauth2-jwt-bearer';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import { AuthRequest } from '../types/auth';

const checkJwt: RequestHandler = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

const attachUserId = (req: Request, _res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  if (authReq.auth?.payload?.sub) {
    authReq.userId = authReq.auth.payload.sub;
  }
  next();
};

export default [checkJwt, attachUserId] as RequestHandler[];
