import express from 'express';
import { getBooks, addBook, deleteBook } from '../controllers/bookController';
import { protect } from '../middleware/authMiddleware';
const router = express.Router();

router.route('/').get(getBooks).post(protect, addBook);
router.route('/:id').delete(protect, deleteBook);

export default router;