import { Router } from "express";
import { BumbuController } from "../controllers/bumbu.controller";
import { verifyToken } from "../middlewares/verifyToken";
import upload from "../middlewares/upload";

const router = Router();

router.get("/", BumbuController.getAll);
router.get("/:id", BumbuController.getById);
router.post("/", verifyToken, upload.single("gambar"), BumbuController.create);
router.put("/:id", verifyToken, upload.single("gambar"), BumbuController.update);
router.delete("/:id", verifyToken, BumbuController.delete);

export default router;
