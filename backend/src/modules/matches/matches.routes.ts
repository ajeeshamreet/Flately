import { Router } from 'express';
import checkJwt from '../../middlewares/auth0.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { connectCompatibility, getMyMatches } from './matches.controller';

const router = Router();

router.get(
	'/me',
	checkJwt,
	...withAuthenticatedController(getMyMatches, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

router.post(
	'/connect/:toUserId',
	checkJwt,
	...withAuthenticatedController(connectCompatibility, {
		fallbackError: { status: 500, body: { message: 'Internal server error' } },
	}),
);

export default router;
