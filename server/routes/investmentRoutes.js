import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment
} from '../controllers/investmentController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInvestments);
router.post('/', addInvestment);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;
