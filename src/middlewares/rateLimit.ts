import { rateLimit } from 'express-rate-limit';
import logger from '@/services/loggerService';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    headers: true,
    statusCode: 429,
    handler: (req: any, res: any) => { 
        logger.warn(`Rate limit reached for IP: ${req.ip} [${req.headers['x-forwarded-for']}]`); // x-forwarded-for is used when the server is behind a proxy (Cloudflare, Nginx, etc.)
        res.status(429).send('Too many requests from this IP, please try again after 15 minutes');
    },
});