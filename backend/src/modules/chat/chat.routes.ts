import { Router } from 'express';
import checkJwt from '../../middlewares/jwt.middleware';
import { Openchat } from './chat.controller';

const router = Router();

router.get('/:matchId', checkJwt, Openchat);

export default router;
