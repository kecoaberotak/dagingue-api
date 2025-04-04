import { Router } from "express";
import { LandingPageController } from "../controllers/landingPage.controller";
import upload from "../middlewares/upload";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", LandingPageController.getAll);
router.get("/:key", LandingPageController.getByKey);
router.post("/", upload.any(), verifyToken, LandingPageController.create);
router.put("/:key", upload.any(), verifyToken, LandingPageController.update);
router.delete("/key", verifyToken, LandingPageController.delete);

export default router;
