import express from 'express';
import {
  getTenders,
  createTender,
  updateTender,
  deleteTender,
} from '../controllers/tenderController.js';

const router = express.Router();

// Routes
router.get('/', getTenders);
router.post('/', createTender);
router.put('/:id', updateTender);
router.delete('/:id', deleteTender);

export default router;
