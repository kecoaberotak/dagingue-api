import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/signout", verifyToken, authController.signOut);

export default router;
