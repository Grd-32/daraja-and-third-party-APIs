import express from 'express';
import { initiateMpesaPayment, handleMpesaCallback } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mpesa', initiateMpesaPayment); // Initiate MPESA STK Push
router.post('/mpesa-callback', handleMpesaCallback); // Handle MPESA callback

export default router;
