import { Request, Response, NextFunction } from 'express';
import passport = require('passport');
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as userSchema from '@/policies/userSchema'; // Import the userSchema for validating the request body

import { db, schema } from '@/db/setup';
import { eq, or} from 'drizzle-orm';

import logger from '@/services/loggerService';
import { emailService } from '@/services/emailService';
import { validate } from '@/utils/validation';
dotenv.config();

dotenv.config();

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    if (!validate(userSchema.loginUser, { username, password }, res)) return;

    // Local authentication using PassportJS
    passport.authenticate('local', (err: string, user: any, info: any) => {
        if (err) { return next(err); }
        if (!user) { return res.status(400).json({ message: info.message }); }

        req.logIn(user, (err) => {
            if (err) { return next(err); }
            
            delete user.password; // Remove password from user object
            logger.info(`User ${user.username} logged in`);
            return res.status(200).json({ message: 'Logged in successfully', user });
        });
    })(req, res, next);
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!validate(userSchema.createUser, { username, email, password }, res)) return;

    // Check if user already exists
    const existingUser = await db.select().from(schema.users).where(
        or(
            eq(schema.users.username, username), 
            eq(schema.users.email, email)
        ));

    if(existingUser.length > 0) {
        res.status(400).json({ error: 'User already exists' });
        return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const createdUser = await db.insert(schema.users).values({ username, email, password: hashedPassword }).$returningId();
    logger.info(`User ${username} created`);
    res.json({ message: 'User created', user: { username, email } });

    // Send email verification 
    const secret: string = String(process.env.JWT_SECRET);
    const token = jwt.sign({ id: createdUser[0].id }, secret, { expiresIn: '1d' });
    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    emailService.sendEmail(email, 'verifyEmail', 'Confirm your email address', { username: username, verificationLink });
    logger.info(`Email verification sent to ${email}`);
};

// Verification callback from email.
export const verifyEmail = async (req: Request, res: Response) => {
    const { token }: any = req.query;
    const secret: string = String(process.env.JWT_SECRET);
    if (!validate(userSchema.verifyEmail, { token }, res)) return;

    try {
        const decoded: any = jwt.verify(token, secret);
        const { id } = decoded;

        await db.update(schema.users).set({ email_verified: true }).where(eq(schema.users.id, id));
        const user: any = await db.select().from(schema.users).where(eq(schema.users.id, id));

        res.json({ message: 'Email verified successfully' });

        emailService.sendEmail(user[0].email, 'emailVerified', 'Email Verified', { username: user[0].username });
        logger.info(`User with id ${id} verified email`);
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
    }
};

// Initiates reset password by sending a tokenized link to the user
export const forgotPassword = async (req: Request, res: Response) => {
    const email = (req.user as any)[0]?.email ?? null; // I mean, this is a bit weird

    if(!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    const user: any = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if(user.length <= 0) {
        res.status(400).json({ error: 'User not found' });
        return;
    }

    const secret: string = String(process.env.JWT_SECRET);
    const token = jwt.sign({ email: email }, secret, { expiresIn: '1d' });

    const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
    emailService.sendEmail(user[0].email, 'resetPassword', 'Reset Password Request', { resetLink });
    logger.info(`Password reset email sent to ${user.email} with token ${token}`);
    res.json({ message: 'Password reset email sent' });
}

// Finally reset the user password to the desired one.
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const secret: string = String(process.env.JWT_SECRET);
    if (!validate(userSchema.resetPassword, { token, password }, res)) return;

    try {
        const decoded: any = jwt.verify(token, secret);
        const { email } = decoded;

        const user: any = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if(user.length <= 0) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.update(schema.users).set({ password: hashedPassword }).where(eq(schema.users.email, email));
        res.json({ message: 'Password reset successfully' });
        logger.info(`User with Email ${email} reset password`);
        emailService.sendEmail(user[0].email, 'passwordReset', 'Your password has been reset', { username: user[0].username });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
    }
}

// Returns currently logged in user array
export const me = (req: Request, res: Response) => {
    const user: any = req.user;

    if(user) {
        delete user[0].password;
        res.json(user[0]);
        return;
    } else {
        res.status(400).json({ error: 'User not found' });
        return;
    }
}

export const logout = (req: Request, res: Response) => {
    req.logout((err) => {
        if(err) {
            res.status(500).json({ error: 'Failed to logout' });
            return;
        }

    req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to destroy session' });
        }
  
        res.clearCookie('connect.sid');
  
        res.status(200).json({ message: 'Logged out successfully' });
    });
    });
}
