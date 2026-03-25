import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getMyMatches } from './matches.controller';

const router = Router();

router.get('/me', checkJwt, getMyMatches);

export default router;
