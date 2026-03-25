import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyProfile, saveProfile } from './profiles.controller';

const router = Router();

router.get('/me', checkJwt, getMyProfile as RequestHandler);
router.post('/me', checkJwt, saveProfile as RequestHandler);

export default router;
