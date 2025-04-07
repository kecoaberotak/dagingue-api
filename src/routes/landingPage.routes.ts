import { Router } from "express";
import { LandingPageController } from "../controllers/landingPage.controller";
import upload from "../middlewares/upload";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", LandingPageController.getAll);
// router.post("/", upload.any(), verifyToken, LandingPageController.create);
router.put("/", upload.any(), verifyToken, LandingPageController.update);

export default router;
