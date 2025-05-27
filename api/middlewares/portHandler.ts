import { Request, Response, NextFunction } from "express";

const removePortMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.headers.host && req.headers.host.includes(":443")) {
    req.headers.host = req.headers.host.replace(":443", "");
  }
  next();
};

export default removePortMiddleware;