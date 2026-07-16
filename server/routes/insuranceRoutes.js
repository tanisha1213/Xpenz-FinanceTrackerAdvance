import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getInsurances,
  addInsurance,
  updateInsurance,
  deleteInsurance
} from '../controllers/insuranceController.js';

const router = express.Router();

router.use(protect);

router.get('/', getInsurances);
router.post('/', addInsurance);
router.put('/:id', updateInsurance);
router.delete('/:id', deleteInsurance);

export default router;
