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
			ONBOARDING_REQUIRED: {
				status: 403,
				body: { message: 'Onboarding completion is required' },
			},
		},
		fallbackError: { status: 500, body: { message: 'Matching failed' } },
	}),
);

export default router;
