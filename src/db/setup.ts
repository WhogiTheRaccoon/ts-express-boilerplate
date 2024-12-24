import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import logger from '@/services/loggerService';
import * as schema from '@/db/schema';
dotenv.config();

if(!process.env.DB_URL) throw new Error('DB_URL is required');

const pool = mysql.createPool(process.env.DB_URL);
const db = drizzle(pool, { schema, mode: 'default' });

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
});

pool.getConnection((err, conn) => {
    if (err) {
        logger.error('Database connection failed:', err);
        return;
    }
    console.log('Database connected successfully');
    conn.release();
});

export { db, schema };
