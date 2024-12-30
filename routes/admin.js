import express from 'express';
import {
  getDashboardData,
  manageTenders,
  manageUsers,
  getTransactions,
  getNotifications,
  createNotification,
} from '../controllers/admin.js';

const router = express.Router();

router.get('/dashboard', getDashboardData);
// router.get('/tenders', manageTenders);
router.route('/tenders').get(manageTenders).post(manageTenders);
router.get('/users', manageUsers);
router.get('/transactions', getTransactions);
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);

export default router;
