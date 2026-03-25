import { RequestHandler, Router } from 'express';
import checkJwt from '../middlewares/auth0.middleware';
import { getUserProfile } from './users.controllers';

const router = Router();

router.get('/me', checkJwt, getUserProfile as RequestHandler);

export default router;
