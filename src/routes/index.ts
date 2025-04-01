import { Router } from "express";
import healthRouter from "./health.routes";
import usersRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import bumbuRoutes from "./bumbu.routes";
import potongRoutes from "./potong.routes";

const router = Router();

router.use("/", healthRouter);
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/api/bumbu", bumbuRoutes);
router.use("/api/potong", potongRoutes);

export default router;
