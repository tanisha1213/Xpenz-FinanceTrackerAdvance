import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getLoans,
  addLoan,
  updateLoan,
  deleteLoan
} from '../controllers/loanController.js';

const router = express.Router();

// Apply auth middleware to protect all loan endpoints
router.use(protect);

router.get('/', getLoans);
router.post('/', addLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

export default router;
