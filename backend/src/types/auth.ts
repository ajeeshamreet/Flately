import { Request } from 'express';

export interface Auth0User {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export type AuthRequest = Request & {
  user?: Auth0User;
  userId?: string;
  auth?: {
    payload?: {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
  };
};
