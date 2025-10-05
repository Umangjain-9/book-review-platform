import mongoose, { Schema } from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  year: { type: Number, required: true },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedByName: { type: String, required: true },
});

const Book = mongoose.model('Book', BookSchema);
// THIS LINE IS MISSING IN YOUR FILE
export default Book;