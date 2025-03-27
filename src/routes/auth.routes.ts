import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/signin", authController.signIn);
router.post("/signup", authController.signUp);
router.post("/signout", authController.signOut);

export default router;
