import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { getFeed, swipe } from './discovery.controller';

const router = Router();

router.get(
	'/',
	checkJwt,
	...withAuthenticatedController(getFeed, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.get(
	'/feed',
	checkJwt,
	...withAuthenticatedController(getFeed, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.post(
	'/swipe',
	checkJwt,
	...withAuthenticatedController(swipe, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

export default router;
