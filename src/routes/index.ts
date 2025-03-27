import { Router } from "express";
import healthRouter from "./health.routes";
import usersRoutes from "./user.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/api/users", usersRoutes);

export default router;
