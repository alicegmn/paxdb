import express, { Request, Response } from "express";

const router = express.Router();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test API connectivity
 *     description: Simple endpoint to verify that the API is reachable.
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Successful test response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   type: string
 *                   example: hej vi har kontakt
 */

router.get("/", (_req: Request, res: Response) => {
  const data = { test: "hej vi har kontakt" };

  res.status(200).json(data);
});

export default router;
