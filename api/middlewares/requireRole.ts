import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.ts';

const requireRole = (role: string) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied: insufficient role' });
        }
        next();
    };
};

export default requireRole;
