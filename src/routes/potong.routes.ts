import { Router } from "express";
import { PotongController } from "../controllers/potong.controller";
import { verifyToken } from "../middlewares/verifyToken";
import upload from "../middlewares/upload";

const router = Router();

router.get("/", PotongController.getAll);
router.get("/:id", PotongController.getById);
router.post("/", upload.single("gambar"), PotongController.create);
router.put("/:id", upload.single("gambar"), PotongController.update);
router.delete("/:id", PotongController.delete);

export default router;
