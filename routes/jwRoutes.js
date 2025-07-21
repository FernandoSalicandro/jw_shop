import express from "express";
import jwController from "../controllers/jwController.js";
import relatedController from "../controllers/relatedController.js";
import stripeController from "../controllers/stripeControllers.js";
import processingOrder from "../controllers/orderController.js";
import stockController from '../controllers/stockController.js';
import discountCodeController from "../controllers/discountCodeController.js";
import botController from "../controllers/botController.js";
import emailController from "../controllers/emailController.js";

const router = express.Router();

// Rotte specifiche (vanno PRIMA delle rotte con parametri dinamici)
router.post('/bot', botController.botAnswer);
router.get("/related/:slug", relatedController.related);
router.get("/", jwController.index);
router.get('/discount-code', discountCodeController.discount);
router.post('/verify-discount', discountCodeController.verifyDiscount);

// Rotte per gli ordini e pagamenti
router.post("/orders", processingOrder.confirmOrder);
router.post("/update-payment-status", processingOrder.updatePaymentStatus);
router.post('/create-payment-intent', stripeController.createPaymentIntent);
router.post('/scale-stock', stockController.scaleStock);

// Nuova rotta per l'invio delle email
router.post('/send-order-emails', emailController.sendOrderEmails);

// Rotta con parametro dinamico (va DOPO tutte le rotte specifiche)
router.get("/:slug", jwController.show);

export default router;