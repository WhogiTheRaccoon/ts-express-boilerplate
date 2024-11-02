import { Request, Response, NextFunction } from 'express';
import userSchema from '@/policies/userSchema'; // Import the userSchema for validating the request body
import { db, eq, or } from '@/db/setup';
import { users } from '@/db/schema';

const get = async (req: Request, res: Response, next: NextFunction) => {
    const data = await db.select().from(users);
    if(data.length === 0) return next({ status: 500, message: 'Internal Server Error' });

    data.forEach((user: any) => delete user.password);
    res.status(200).json(data);

};

const getOne = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    const { error } = userSchema.getOne.validate({ id });
    if(error) return next({ status: 400, message: error.details[0].message });

    const user: any = await db.select().from(users).where(eq(users.id, id));
    if(!user) return next({ status: 404, message: 'User not found' });

    delete user[0].password;
    res.status(200).json(user); 
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { error } = userSchema.createUser.validate(req.body);
    if(error) return next({ status: 400, message: error.details[0].message });

    const user = await db.insert(users).values(req.body);
    if(!user) return next({ status: 500, message: 'Internal Server Error' });

    res.status(201).json({ message: 'User created successfully' });
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    const { error } = userSchema.updateUser.validate({ id, ...req.body });
    if(error) return next({ status: 400, message: error.details[0].message });

    const user: any = await db.select().from(users).where(eq(users.id, id));
    if(!user) return next({ status: 404, message: 'User not found' });

    await db.update(users).set(req.body).where(eq(users.id, id));
    res.status(200).json({ message: 'User updated successfully' });
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);

    const { error } = userSchema.getOne.validate({ id });
    if(error) return next({ status: 400, message: error.details[0].message });

    const user: any = await db.select().from(users).where(eq(users.id, id));
    if(!user) return next({ status: 404, message: 'User not found' });

    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({ message: 'User deleted successfully' });
}


export default {
    get,
    getOne,
    deleteUser,
    createUser,
    updateUser
};