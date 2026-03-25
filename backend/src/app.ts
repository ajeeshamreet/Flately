import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env';

import profileRoutes from './modules/profiles/profiles.routes';
import preferenceRoutes from './modules/preferences/preferences.routes';
import userRoutes from './modules/users.routes';
import matchingRoutes from './modules/matching/matching.routes';
import matchRoutes from './modules/matches/matches.routes';
import discoveryRoutes from './modules/discovery/discovery.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use('/matching', matchingRoutes);
app.use('/profiles', profileRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/users', userRoutes);
app.use('/matches', matchRoutes);
app.use('/chat', chatRoutes);
app.use('/preferences', preferenceRoutes);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
