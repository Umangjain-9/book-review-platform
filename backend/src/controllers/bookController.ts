import { Response } from 'express';
import Book from '../models/Book';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all books
export const getBooks = async (req: AuthRequest, res: Response) => {
  const books = await Book.find({});
  res.json(books);
};

// Add a book
export const addBook = async (req: AuthRequest, res: Response) => {
  const { title, author, description, genre, year } = req.body;
  const book = new Book({
    title, author, description, genre, year,
    addedBy: req.user._id,
    addedByName: req.user.name,
  });
  const createdBook = await book.save();
  res.status(201).json(createdBook);
};

// Delete a book
export const deleteBook = async (req: AuthRequest, res: Response) => {
    const book = await Book.findById(req.params.id);
    if(book) {
        if(book.addedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await Review.deleteMany({ bookId: book._id });
        await book.deleteOne();
        res.json({ message: 'Book removed' });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

// ... You can add updateBook functionality here as well