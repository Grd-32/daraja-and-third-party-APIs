import express from 'express';
import { savePreferences, handlePaymentCallback } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/preferences', savePreferences);
router.post('/payment/callback', handlePaymentCallback);

export default router;
