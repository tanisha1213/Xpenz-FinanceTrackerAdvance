import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAccounts,
  addBankAccount,
  updateAccount,
  deleteBankAccount
} from '../controllers/accountController.js';

const router = express.Router();

router.use(protect);

router.get('/', getAccounts);
router.post('/bank', addBankAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteBankAccount);

export default router;
