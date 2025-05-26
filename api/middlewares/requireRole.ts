import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

const requireRole = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ message: "Access denied: insufficient role" });
      return;
    }

    next();
  };
};

export default requireRole;
