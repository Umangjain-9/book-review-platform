import { Response } from 'express';
import Review from '../models/Review';
import Book from '../models/Book';
import { AuthRequest } from '../middleware/authMiddleware';

// Get reviews for a book
export const getReviewsForBook = async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ bookId: req.params.bookId });
  res.json(reviews);
};

// Add a review
export const addReview = async (req: AuthRequest, res: Response) => {
  const { rating, reviewText } = req.body;
  const book = await Book.findById(req.params.bookId);

  if (book) {
    const review = new Review({
      rating, reviewText,
      bookId: req.params.bookId,
      userId: req.user._id,
      userName: req.user.name,
    });
    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};