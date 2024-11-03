import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import 'tsconfig-paths/register'; // Register tsconfig paths
import { rateLimiter } from '@/middlewares/rateLimit';
import { isMaintenance } from './middlewares/maintenance';
import logger from '@/services/loggerService';

import '@/services/loggerService';
import '@/services/passportService';
import '@/services/queueService';
import '@/services/cacheService';
dotenv.config();

// Constants
const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;
const APP_URL: string = String(process.env.APP_URL);
const secret: string = String(process.env.SECRET);

// Middlewares
app.use(morgan(':method :url :status :response-time ms - :res[content-length] \n'));
app.use(bodyParser.json());
app.use(cors({ origin: process.env.ORGIN }));
app.use(rateLimiter);
app.use(isMaintenance);

// Sessions and Passport
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
require('./routes')(app);

// Error Handler
app.use((err: Error, req: any, res: any, next: any) => {
  logger.error(err);
  res.status(500).send(err);
});

// Server
app.listen(port, () => {
  console.log(`Server is running on port: ${APP_URL}`);
});