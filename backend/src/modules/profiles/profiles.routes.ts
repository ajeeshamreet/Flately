import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { getMyProfile, saveProfile } from './profiles.controller';

const router = Router();

router.get(
	'/me',
	checkJwt,
	...withAuthenticatedController(getMyProfile, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
		logPrefix: 'Error getting profile:',
	}),
);

router.post(
	'/me',
	checkJwt,
	...withAuthenticatedController(saveProfile, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
		logPrefix: 'Error saving profile:',
	}),
);

export default router;
