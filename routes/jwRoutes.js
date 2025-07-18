import express from "express";
import jwController from "../controllers/jwController.js";
import relatedController from "../controllers/relatedController.js";
import stripeController from "../controllers/stripeControllers.js";
import processingOrder from "../controllers/orderController.js";
import stockController from '../controllers/stockController.js';
import discountCodeController from "../controllers/discountCodeController.js";

const router = express.Router();

// Metti le rotte specifiche PRIMA delle rotte con parametri dinamici
router.get("/related/:slug", relatedController.related);
router.get("/", jwController.index);
router.get('/discount-code', discountCodeController.discount);
router.post('/verify-discount', discountCodeController.verifyDiscount);
router.get("/:slug", jwController.show);  // Sposta questa DOPO tutte le rotte specifiche
router.post("/orders", processingOrder.confirmOrder);
router.post("/update-payment-status", processingOrder.updatePaymentStatus);
router.post('/create-payment-intent', stripeController.createPaymentIntent);
router.post('/scale-stock', stockController.scaleStock);

export default router;