/*
    Service: LoggerService
    Description: Service to log messages to files and console, when not in production, logs to console
    Methods:
        - logger.<TYPE>(message: string): void
            - Types: error, warn, info, verbose, debug, silly
    Usage:
        - Use logger.<TYPE>(message) to log an info message
*/
import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.cli(),
    defaultMeta: { service: 'backend' },
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ]
  });

// If not in production, log to console
if(process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

export default logger;