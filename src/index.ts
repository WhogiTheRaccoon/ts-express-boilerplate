import express, { Express } from 'express';
import 'tsconfig-paths/register';
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { cacheService } from '@/services/cacheService';
import logger from '@/services/loggerService';
dotenv.config();

// Middlewares
import { rateLimiter } from '@/middlewares/rateLimit';
import { isMaintenance } from '@/middlewares/maintenance';

// Services
import '@/services/loggerService';
import '@/services/passportService';
import '@/services/queueService';
import '@/services/cacheService';

// Constants
const app: Express = express();

// Middlewares
app.use(morgan(':method :url :status :response-time ms - :res[content-length] \n'));
app.use(bodyParser.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(isMaintenance);
process.env.NODE_ENV === 'production' ? app.use(rateLimiter) : null; // Rate limit

// Sessions and Passport
app.use(session({
  store: new RedisStore({
    client: cacheService.redisClient,
    prefix: 'sess:',
  }),
  secret: process.env.SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
require('@/routes')(app);

// Error Handler
app.use((err: Error, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).send(err);
});

// Server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.APP_URL}`);
});