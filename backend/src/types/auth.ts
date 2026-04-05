import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthTokenPayload extends JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

export type AuthRequest = Request & {
  user?: AuthUser;
  userId?: string;
  auth?: {
    payload?: AuthTokenPayload;
  };
};
