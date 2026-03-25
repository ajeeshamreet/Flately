import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMatches } from './matching.controller';

const router = Router();

router.get('/me', checkJwt, getMatches);

export default router;
