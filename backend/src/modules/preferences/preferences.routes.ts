import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyPreferences, saveMyPreferences } from './preferences.controller';

const router = Router();

router.get('/me', checkJwt, getMyPreferences as RequestHandler);
router.post('/me', checkJwt, saveMyPreferences as RequestHandler);

export default router;
