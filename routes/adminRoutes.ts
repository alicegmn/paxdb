import express from "express";
import authenticateToken, {
  AuthenticatedRequest,
} from "../middlewares/authMiddleware";
import requireRole from "../middlewares/requireRole";
import asyncHandler from "../middlewares/asyncHandler";

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
