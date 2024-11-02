import { Request, Response, NextFunction } from 'express';
import userSchema from '@/policies/userSchema'; // Import the userSchema for validating the request body
import { db, eq, or } from '@/db/setup';
import { users } from '@/db/schema';
import passport = require('passport');
import bcrypt from 'bcrypt';
import logger from '@/services/loggerService';
import { emailService } from '@/services/emailService';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    const { error } = userSchema.loginUser.validate({ username, password });

    if(error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }

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

const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const { error } = userSchema.createUser.validate({ username, email, password });

    if(error) {
        res.status(400).json({ error: error.details[0].message });
        return;
    }

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
    const createdUser = await db.insert(users).values({ username, email, password: hashedPassword }).$returningId();
    logger.info(`User ${username} created`);
    res.json({ message: 'User created', user: { username, email } });

    // Send email verification 
    const secret: string = String(process.env.JWT_SECRET);
    const token = jwt.sign({ id: createdUser[0].id }, secret, { expiresIn: '1d' });
    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    emailService.sendEmail(email, 'verifyEmail', { username: username, verificationLink });
    logger.info(`Email verification sent to ${email}`);
};

const verifyEmail = async (req: Request, res: Response) => {
    const { token }: any = req.query;
    const secret: string = String(process.env.JWT_SECRET);

    try {
        const decoded: any = jwt.verify(token, secret);
        const { id } = decoded;

        await db.update(users).set({ email_verified: true }).where(eq(users.id, id));
        res.json({ message: 'Email verified successfully' });
        logger.info(`User with id ${id} verified email`);
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
    }
};

const forgotPassword = async (req: Request, res: Response) => {
    const email = (req.user as any)[0]?.email ?? null; // I mean, this is a bit weird

    if(!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    const user: any = await db.select().from(users).where(eq(users.email, email));
    if(user.length <= 0) {
        res.status(400).json({ error: 'User not found' });
        return;
    }

    const secret: string = String(process.env.JWT_SECRET);
    const token = jwt.sign({ email: email }, secret, { expiresIn: '1d' });

    const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
    emailService.sendEmail(user[0].email, 'resetPassword', { resetLink });
    logger.info(`Password reset email sent to ${user.email} with token ${token}`);
    res.json({ message: 'Password reset email sent' });
}

const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const secret: string = String(process.env.JWT_SECRET);

    try {
        const decoded: any = jwt.verify(token, secret);
        const { email } = decoded;

        const user: any = await db.select().from(users).where(eq(users.email, email));
        if(user.length <= 0) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));
        res.json({ message: 'Password reset successfully' });
        logger.info(`User with Email ${email} reset password`);
        emailService.sendEmail(user[0].email, 'passwordReset', { username: user[0].username });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
    }
}

const me = (req: Request, res: Response) => {
    const me = (req.user as any)[0];
    delete me.password;
    res.json(me);
}

const logout = (req: Request, res: Response) => {
    req.logout((err => {
        if(err) {
            res.status(500).json({ error: 'Failed to logout' });
            return;
        }
        res.json({ message: 'Logged out successfully' });
    }))
}

export default {
    login,
    register,
    logout,
    me,
    verifyEmail,
    forgotPassword,
    resetPassword
};