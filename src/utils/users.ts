/*
    Utility: Fetch User By Id
    Description: Utility to fetch a user by id
    Methods:
        - fetchUserById(id: number, res: Response): Promise<any>
    Usage:
        - Use fetchUserById method to fetch a user by id
        - Returns user object if user is found
        - Returns null and sends a 404 response if user is not found
*/
import { Response } from 'express';
import { db, schema } from '@/db/setup';
import { eq } from 'drizzle-orm';

export const fetchUserById = async (id: bigint, res: Response) => {
    const user: any = await db.select().from(schema.users).where(eq(schema.users.id, Number(id)));
    if(user.length <=0 ) { // Drizzle returns an empty array if no user is found
        res.status(404).json({status: 404, message: `User ${id} not found`})
        return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}