import express from 'express';
import { getReviewsForBook, addReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();

router.route('/:bookId').get(getReviewsForBook).post(protect, addReview);

export default router;