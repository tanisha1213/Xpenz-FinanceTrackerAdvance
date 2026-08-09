import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  triggerDeductionNow,
  deleteSubscription
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .put(updateSubscription)
  .delete(deleteSubscription);

router.post('/:id/deduct', triggerDeductionNow);

export default router;
