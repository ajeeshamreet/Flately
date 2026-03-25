import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { Openchat } from './chat.controller';

const router = Router();

router.get('/:matchId', checkJwt, Openchat);

export default router;
