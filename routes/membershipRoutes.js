import express from 'express';
import { registerMembership, getAllMembers, checkMembershipStatus } from '../controllers/membershipController.js';

const router = express.Router();

router.post('/membership/register', registerMembership);
router.get('/membership/all', getAllMembers);
router.get('/membership/status/:email', checkMembershipStatus);

export default router;
