import express from "express";
import authenticateToken, {
  AuthenticatedRequest,
} from "../middlewares/authMiddleware.ts";
import requireRole from "../middlewares/requireRole.ts";
import asyncHandler from "../middlewares/asyncHandler.ts";

const router = express.Router();

// GET /admin/dashboard
router.get(
  "/dashboard",
  authenticateToken,
  requireRole("admin"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Du kan lägga till asynkron logik här i framtiden, t.ex. hämta statistik
    res.json({
      message: "Welcome to the admin dashboard",
      user: req.user,
    });
  })
);

export default router;
