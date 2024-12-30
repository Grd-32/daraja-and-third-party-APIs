import express from 'express';
import { initiatePayment } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payments/initiate
router.post('/initiate', initiatePayment);

export default router;
