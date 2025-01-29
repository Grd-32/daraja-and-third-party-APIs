import express from "express";
import { createOrder, captureOrder } from "../controllers/paypalController.js";

const router = express.Router();

// Route to create a PayPal order
router.post("/create-order", createOrder);

// Route to capture a PayPal order
router.post("/capture-order", captureOrder);

export default router;
