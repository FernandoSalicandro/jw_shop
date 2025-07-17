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
//aggiungo la rotta per il paymentIntent
router.post('/create-payment-intent', stripeController.createPaymentIntent)
//ora il backend può ricevere il client secret e procedere alla creazione del pagamento

export default router;