import { Router } from "express";
import healthRouter from "./health.routes";
import usersRoutes from "./user.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/", healthRouter);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);

export default router;
