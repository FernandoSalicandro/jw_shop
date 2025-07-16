import express from "express";
import jwController from "../controllers/jwController.js";
import confirmOrder from "../controllers/orderController.js";
import relatedController from "../controllers/relatedController.js";

const router = express.Router();

router.get("/related/:slug", relatedController.related);
router.get("/", jwController.index);
router.get("/:slug", jwController.show);
router.post("/confirm", confirmOrder);

export default router;
