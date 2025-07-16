import express from "express";
import jwController from "../controllers/jwController.js";
import confirmOrder from "../controllers/orderController.js";
import relatedController from "../controllers/relatedController.js";
import stripeController from "../controllers/stripeControllers.js";

const router = express.Router();


router.get("/related/:slug", relatedController.related);
router.get("/", jwController.index);
router.get("/:slug", jwController.show);
router.post("/confirm", confirmOrder);

// Rotte Stripe - Fernando
router.post("/create-checkout-session", stripeController.createCheckoutSession);
router.post("/webhook", express.raw({type: 'application/json'}), stripeController.webhook);

export default router;