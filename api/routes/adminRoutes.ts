import express from "express";
import authenticateToken, {
  AuthenticatedRequest,
} from "../middlewares/authMiddleware";
import requireRole from "../middlewares/requireRole";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard access

 * /dashboard:
 *   get:
 *     summary: Access the admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the admin dashboard
 *                 user:
 *                   type: object
 *                   description: Authenticated admin user info
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       403:
 *         description: Forbidden – user does not have admin role
 */

router.get(
  "/dashboard",
  authenticateToken,
  requireRole(["admin", "moderator", "devices"]),
  (req: AuthenticatedRequest, res) => {
    res.json({ message: "Welcome to the admin dashboard", user: req.user });
  }
);

export default router;
