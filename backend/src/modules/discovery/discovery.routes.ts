import { RequestHandler, Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { getFeed, swipe } from './discovery.controller';

const router = Router();

router.get('/feed', checkJwt, getFeed as RequestHandler);
router.post('/swipe', checkJwt, swipe as RequestHandler);

export default router;
