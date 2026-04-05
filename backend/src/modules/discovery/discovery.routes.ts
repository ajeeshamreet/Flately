import { Router } from 'express';
import checkJwt from '../../middlewares/jwt.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { getFeed, swipe } from './discovery.controller';

const router = Router();

router.get(
	'/',
	checkJwt,
	...withAuthenticatedController(getFeed, {
		domainErrors: {
			ONBOARDING_REQUIRED: {
				status: 403,
				body: { message: 'Onboarding completion is required' },
			},
		},
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.get(
	'/feed',
	checkJwt,
	...withAuthenticatedController(getFeed, {
		domainErrors: {
			ONBOARDING_REQUIRED: {
				status: 403,
				body: { message: 'Onboarding completion is required' },
			},
		},
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.post(
	'/swipe',
	checkJwt,
	...withAuthenticatedController(swipe, {
		domainErrors: {
			ONBOARDING_REQUIRED: {
				status: 403,
				body: { message: 'Onboarding completion is required' },
			},
		},
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

export default router;
