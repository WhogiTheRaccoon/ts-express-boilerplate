import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const requireVerification: boolean = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
  const user: any  = req.user;

  if(!req.isAuthenticated()) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if(requireVerification && !user?.email_verified) {
    res.status(401).json({ message: 'Unauthorized, Email Verification Required' });
    return;
  }
  
  next();
}