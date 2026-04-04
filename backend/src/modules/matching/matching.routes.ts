import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { getMatches } from './matching.controller';

const router = Router();

router.get(
	'/me',
	checkJwt,
	...withAuthenticatedController(getMatches, {
		domainErrors: {
			PROFILE_OR_PREFERENCES_MISSING: {
				status: 400,
				body: { message: 'Complete profile and preferences first' },
			},
		},
		fallbackError: { status: 500, body: { message: 'Matching failed' } },
	}),
);

export default router;
