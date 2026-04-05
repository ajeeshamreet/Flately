import { Router } from 'express';
import {
	exchangeGoogleCode,
	googleCallback,
	login,
	signup,
	startGoogleAuth,
} from './auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/google/start', startGoogleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/exchange', exchangeGoogleCode);

export default router;
