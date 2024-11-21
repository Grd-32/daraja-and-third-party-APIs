import express from 'express';
import { getAllUsers, updateUserRole, deleteTender } from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only routes
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/tenders/:id', authMiddleware, adminMiddleware, deleteTender);

export default router;
