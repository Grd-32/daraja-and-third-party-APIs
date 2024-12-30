import express from 'express';
import { getAllUsers, updateUserRole, deleteTender } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only routes
router.get('/users', authenticate, adminMiddleware, getAllUsers);
router.put('/users/role', authenticate, adminMiddleware, updateUserRole);
router.delete('/tenders/:id', authenticate, adminMiddleware, deleteTender);

export default router;
