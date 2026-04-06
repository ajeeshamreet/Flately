import { Router } from 'express';
import checkJwt from '../../middlewares/jwt.middleware';
import { withAuthenticatedController } from '../../middlewares/controller-chain.middleware';
import { createUploadSignature } from './uploads.controller';

const router = Router();

router.post(
  '/signature',
  checkJwt,
  ...withAuthenticatedController(createUploadSignature, {
    unauthorizedBody: { error: 'Unauthorized' },
    domainErrors: {
      CLOUDINARY_NOT_CONFIGURED: {
        status: 503,
        body: {
          error: 'CLOUDINARY_NOT_CONFIGURED',
        },
      },
    },
    fallbackError: {
      status: 500,
      body: {
        error: 'UPLOAD_SIGNATURE_FAILED',
      },
    },
    logPrefix: 'Error creating upload signature:',
  }),
);

export default router;
