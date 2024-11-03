import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as userSchema from '@/policies/userSchema'; // Import the userSchema for validating the request body
import { db, eq, or } from '@/db/setup';
import { users } from '@/db/schema';
import logger from '@/services/loggerService';
import { fetchUserById } from '@/utils/users';
import { validate } from '@/utils/validation';

export const get = async (req: Request, res: Response) => {
    try {
        const data = await db.select().from(users);
        if (data.length <= 0) {
            res.status(400).json({ status: 400, message: 'No users found' });
            return;
        }
    
        data.forEach((user: any) => delete user.password);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ status: 500, message: `Get User failed ${error}` });
        logger.error(`Get User failed ${error}`)
    }

};

export const getOne = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!validate(userSchema.getOne, { id }, res)) return;

    try {
        const user = await fetchUserById(id, res);
        if (user) res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ status: 500, message: `Get User ${id} failed ${error}` });
        logger.error(`Get User ${id} failed ${error}`)
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!validate(userSchema.createUser, req.body, res)) return;

    try {
         // Check if user already exists
        const existingUser = await db.select().from(users).where(
            or(
                eq(users.username, username), 
                eq(users.email, email)
            ));

        if(existingUser.length > 0) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        await db.insert(users).values({ username, email, password: hashedPassword });
        logger.info(`User ${username} created`);

        res.status(201).json({ status: 201, message: 'User created successfully', user: { username, email } });
    } catch (error) {
        res.status(500).json({ status: 500, message: `Error creating user ${error}` });
        logger.error(`Error creating user ${error}`)
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!validate(userSchema.updateUser, { id, ...req.body }, res)) return;

    const user = await fetchUserById(id, res);
    if (!user) return;

    try {
        await db.update(users).set(req.body).where(eq(users.id, id));
        res.status(200).json({ status: 200, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 500, message: `Error updating user ${id} ${error}` });
        logger.error(`Error updating user ${id} ${error}`)
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!validate(userSchema.getOne, { id }, res)) return;

    const user = await fetchUserById(id, res);
    if (!user) return;

    try {
        await db.delete(users).where(eq(users.id, id));
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: `Error Deleting user ${id} ${error}` });
        logger.error(`Error Deleting user ${id} ${error}`)
    }
};
