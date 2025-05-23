import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  const data = { test: "hej vi har kontakt" };

  res.status(200).json(data);
});

export default router;
