import { Router } from 'express';
import checkJwt from '../../middlewares/jwt.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { getMyPreferences, saveMyPreferences } from './preferences.controller';

const router = Router();

router.get(
	'/me',
	checkJwt,
	...withAuthenticatedController(getMyPreferences, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.post(
	'/me',
	checkJwt,
	...withAuthenticatedController(saveMyPreferences, {
		domainErrors: {
			INVALID_WEIGHTS: { status: 400, body: { error: 'Weights must sum to 100' } },
		},
		fallbackError: { status: 500, body: { message: 'Failed to save preferences' } },
	}),
);

export default router;
