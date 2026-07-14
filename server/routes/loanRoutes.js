import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getLoans,
  addLoan,
  updateLoan,
  deleteLoan,
  getLoanInstallments,
  payInstallment
} from '../controllers/loanController.js';

const router = express.Router();

// Apply auth middleware to protect all loan endpoints
router.use(protect);

router.get('/', getLoans);
router.post('/', addLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);

// Loan Installments Endpoints
router.get('/:id/installments', getLoanInstallments);
router.post('/installments/:installmentId/pay', payInstallment);

export default router;
