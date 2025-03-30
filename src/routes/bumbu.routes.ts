import { Router } from "express";
import { BumbuController } from "../controllers/bumbu.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", BumbuController.getAll);
router.get("/:id", BumbuController.getById);
router.post("/", verifyToken, BumbuController.create);
router.put("/:id", verifyToken, BumbuController.update);
router.delete("/:id", verifyToken, BumbuController.delete);

export default router;
