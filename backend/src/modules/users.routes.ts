import { Router } from 'express';
import checkJwt from '../middlewares/auth0.middleware';
import { withAuthenticatedController } from '../middlewares/controller-chain.middleware';
import { getUserProfile } from './users.controllers';

const router = Router();

router.get(
	'/me',
	checkJwt,
	...withAuthenticatedController(getUserProfile, {
		unauthorizedBody: { error: 'Unauthorized' },
		fallbackError: { status: 500, body: { error: 'Internal Server Error' } },
		logPrefix: 'Error in getUserProfile:',
	}),
);

export default router;
