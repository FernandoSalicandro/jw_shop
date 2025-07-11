import express from "express";
import jwController from "../controllers/jwController.js";
import confirmOrder from "../controllers/orderController.js";

const router = express.Router();

router.get("/", jwController.index);
router.get("/:slug", jwController.show);
router.post("/confirm", confirmOrder);

export default router;
