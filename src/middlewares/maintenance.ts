import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export function isMaintenance(req: Request, res: Response, next: NextFunction) {
    const maintenanceMode = process.env.NODE_ENV === 'maintenance';

    if (!maintenanceMode) {
        return next();
    } else {
        res.status(401).json({ message: 'Application is currently in Maintenance Mode' });
    }
}