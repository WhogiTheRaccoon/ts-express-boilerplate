/*
    Service: CacheService
    Description: Service to cache data using Redis
    Methods:
        - set(key: string, value: string, ttl: number): Promise<void>
        - get(key: string): Promise<string | null>
        - del(key: string): Promise<void>
        - flush(): Promise<void>
    Usage:
        - Use set method to set a key value pair in cache
        - Use get method to get a value from cache
        - Use del method to delete a key from cache
        - Use flush method to clear all cache
*/
import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from './loggerService';
dotenv.config();

class CacheService {
    private redisClient: any;
    private cacheTime: number = Number(process.env.CACHETIME) || 3600;

    constructor() {
        this.redisClient = createClient({
            socket: {
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: Number(process.env.REDIS_PORT) || 6379,
            },
            password: process.env.REDIS_PASS || undefined,
        })

        this.redisClient.connect().catch((err: any) => {
            logger.error(`Redis Connection Error: ${err}`, { service: 'cacheService' });
        });

        this.redisClient.on('error', (err: any) => {
            logger.error(`Redis Error: ${err}`, { service: 'cacheService' });
        });
    }

    public async set(key: string, value: string, ttl: number = this.cacheTime): Promise<void> {
        try {
            await this.redisClient.set(key, value, 'EX', ttl);
        } catch (error) {
            logger.error(`Error setting cache for key ${key}: ${error}`, { service: 'cacheService' });
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            const reply = await this.redisClient.get(key);
            return reply;
        } catch (error) {
            console.error(`Error getting cache for key ${key}:`, error);
            throw error;
        }
    }

    public async del(key: string): Promise<void> {
        try {
            await this.redisClient.del(key);
        } catch (error) {
            logger.error(`Error deleting cache for key ${key}: ${error}`, { service: 'cacheService' });
            throw error;
        }
    }

    public async flush(): Promise<void> {
        try {
            await this.redisClient.flushall();
        } catch (error) {
            logger.error(`Error flushing cache: ${error}`, { service: 'cacheService' });
            throw error;
        }
    }

}


export const cacheService = new CacheService();