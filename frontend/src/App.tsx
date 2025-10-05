import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, Star, Search, Plus, Trash2, LogOut, User, Moon, Sun, ChevronLeft, ChevronRight, Home, UserCircle } from 'lucide-react';
import axios from 'axios';
import './App.css'; 

// API instance setup
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Interfaces
interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}
interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  year: number;
  addedBy: string;
  addedByName: string;
}
interface Review {
  _id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help', 'Fantasy'];

// Main Component
export default function BookReviewPlatform() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'home' | 'bookDetails' | 'addBook' | 'profile'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'title' | 'year' | 'rating'>('title');
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [bookForm, setBookForm] = useState({ title: '', author: '', description: '', genre: 'Fiction', year: new Date().getFullYear() });
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCurrentView('home');
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (currentView === 'home' || currentView === 'profile') {
      fetchBooks();
    }
  }, [currentView]);
  
  useEffect(() => {
    if (currentView === 'bookDetails' && selectedBook) {
      fetchReviewsForBook(selectedBook._id);
    } else {
      setReviews([]); // Clear reviews when leaving details view
    }
  }, [selectedBook, currentView]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (error) {
      showNotification('Could not fetch books.', 'error');
    }
  };

  const fetchReviewsForBook = async (bookId: string) => {
    try {
      const { data } = await api.get(`/reviews/${bookId}`);
      setReviews(data);
    } catch (error) {
      showNotification('Could not fetch reviews.', 'error');
    }
  };

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', loginForm);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setCurrentView('home');
      showNotification('Login successful!', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Invalid credentials', 'error');
    }
  };

  const handleSignup = async () => {
    try {
      const { data } = await api.post('/auth/signup', signupForm);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setCurrentView('home');
      showNotification('Account created successfully!', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Signup failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
    showNotification('Logged out successfully', 'success');
  };

  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.author || !bookForm.description) {
      showNotification('Please fill all fields', 'error');
      return;
    }
    try {
      await api.post('/books', bookForm);
      setBookForm({ title: '', author: '', description: '', genre: 'Fiction', year: new Date().getFullYear() });
      setCurrentView('home');
      showNotification('Book added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add book', 'error');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book and all its reviews?')) {
      try {
        await api.delete(`/books/${bookId}`);
        setCurrentView('home');
        showNotification('Book deleted successfully!', 'success');
      } catch (error) {
        showNotification('Failed to delete book', 'error');
      }
    }
  };

  const handleAddReview = async () => {
    if (!selectedBook) return;
    if (!reviewForm.reviewText) {
      showNotification('Review text cannot be empty', 'error');
      return;
    }
    try {
      await api.post(`/reviews/${selectedBook._id}`, reviewForm);
      fetchReviewsForBook(selectedBook._id);
      setReviewForm({ rating: 5, reviewText: '' });
      setShowReviewForm(false);
      showNotification('Review added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add review', 'error');
    }
  };

  const getAverageRating = (bookId: string) => {
    const bookReviews = reviews.filter(r => r.bookId === bookId);
    if (bookReviews.length === 0) return 0;
    return bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
  };

  const getRatingDistribution = (bookId: string) => {
    return [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} Star${rating > 1 ? 's' : ''}`,
      count: reviews.filter(r => r.bookId === bookId && r.rating === rating).length
    }));
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={16} className={star <= rating ? 'star filled' : 'star'} />
      ))}
    </div>
  );

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return b.year - a.year;
      // Note: Sorting by rating requires all reviews to be fetched, which can be slow.
      // This implementation is simplified and may not reflect global average ratings accurately.
      return 0;
    });

  const paginatedBooks = filteredBooks.slice((currentPage - 1) * 6, currentPage * 6);
  const totalPages = Math.ceil(filteredBooks.length / 6);

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return (
          <div className="auth-container"> {/* Use the new class */}
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <Book size={48} color="#3b82f6" style={{ margin: 'auto' }} />
                  <h2>Welcome Back</h2>
                  <p style={{ color: '#6b7280' }}>Sign in to your account</p>
              </div>
              <div className="form-group">
                <input className="form-input" type="email" placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <input className="form-input" type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin}>Login</button>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account?{' '}
                <button onClick={() => setCurrentView('signup')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button>
              </p>
            </div>
          </div>
        );
      case 'signup':
        return (
            <div className="auth-container"> 
                <div className="card">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <Book size={48} color="#3b82f6" style={{ margin: 'auto' }} />
                        <h2>Create Account</h2>
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="text" placeholder="Name" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="email" placeholder="Email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}/>
                    </div>
                    <div className="form-group">
                        <input className="form-input" type="password" placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}/>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSignup}>Sign Up</button>
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Already have an account?{' '}
                        <button onClick={() => setCurrentView('login')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
                    </p>
                </div>
            </div>
        );
      case 'home':
        return (
          <>
            <h1 className="home-header">Discover Books</h1> {/* Add class to H1 */}
            <div className="filters-bar"> {/* Use the new class */}
                <div className="search-input-wrapper"> {/* Use wrapper */}
                    <Search className="icon" size={20} />
                    <input type="text" className="form-input" placeholder="Search by title or author..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="form-select filter-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                    <option value="All">All Genres</option>
                    {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
                <select className="form-select filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="title">Sort by Title</option>
                    <option value="year">Sort by Year</option>
                </select>
            </div>
            <div className="book-grid">
              {paginatedBooks.map(book => (
                  <div key={book._id} className="card book-card-item" onClick={() => setSelectedBook(book)}>
                      <div className="book-card-header"> {/* New wrapper */}
                          <h3>{book.title}</h3>
                          {user && book.addedBy === user._id && (
                              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id); }}>
                                  <Trash2 size={16} color="#ef4444" />
                              </button>
                          )}
                      </div>
                      <div className="book-card-meta"> {/* New wrapper for meta info */}
                          <span>by {book.author}</span>
                          <span className="book-genre-tag">{book.genre}</span> {/* New genre tag */}
                      </div>
                      <p className="book-card-description line-clamp-2">{book.description}</p>
                      <div className="book-card-footer"> {/* New footer */}
                          <StarRating rating={getAverageRating(book._id)} />
                          <span className="book-year">{book.year}</span>
                      </div>
                  </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16}/></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                ))}
                <button className="btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16}/></button>
              </div>
            )}
          </>
        );
      case 'bookDetails':
          if (!selectedBook) return <div>Book not found.</div>;
          return (
              <>
                  <button onClick={() => setSelectedBook(null)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}><ChevronLeft size={16}/> Back to Books</button>
                  <div className="card">
                      <div className="book-details-header">
                          <h1>{selectedBook.title}</h1>
                          {user && selectedBook.addedBy === user._id && (
                              <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteBook(selectedBook._id); }}>
                                  <Trash2 size={20} />
                              </button>
                          )}
                      </div>
                      <p className="book-details-meta">by {selectedBook.author} | {selectedBook.year} | {selectedBook.genre}</p>
                      <p className="book-details-description">{selectedBook.description}</p>
                      <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)' }}/>

                      <div className="reviews-section"> {/* New section class */}
                          <h2>Reviews ({reviews.length}) <StarRating rating={getAverageRating(selectedBook._id)} /></h2>
                          {user && <button className="btn btn-primary" onClick={() => setShowReviewForm(!showReviewForm)}>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</button>}
                          {showReviewForm && (
                              <div className="add-review-form"> {/* New form class */}
                                  <h3>Your Review</h3>
                                  <div className="form-group">
                                      <label>Rating</label>
                                      <div className="star-rating">
                                          {[1, 2, 3, 4, 5].map(star => (
                                              <button key={star} className="btn-icon" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                                  <Star size={24} className={star <= reviewForm.rating ? 'star filled' : 'star'} />
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="form-group">
                                      <label>Review</label>
                                      <textarea className="form-textarea" rows={4} value={reviewForm.reviewText} onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })} />
                                  </div>
                                  <div className="form-actions">
                                      <button className="btn btn-primary" onClick={handleAddReview}>Submit Review</button>
                                  </div>
                              </div>
                          )}
                          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {reviews.map(review => (
                                  <div key={review._id} className="review-card"> {/* New review card class */}
                                      <div className="review-header">
                                          <strong className="review-author">{review.userName}</strong>
                                          <StarRating rating={review.rating} />
                                      </div>
                                      <p>{review.reviewText}</p>
                                      <small className="review-date">{new Date(review.createdAt).toLocaleDateString()}</small>
                                  </div>
                              ))}
                              {reviews.length === 0 && <p className="text-secondary">No reviews yet for this book.</p>}
                          </div>
                      </div>
                  </div>
              </>
          );
      case 'addBook':
        return (
          <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <div className="card">
              <h1>Add a New Book</h1>
              <div className="form-group">
                <label>Title</label>
                <input className="form-input" type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input className="form-input" type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-textarea" rows={5} value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Genre</label>
                <select className="form-select" value={bookForm.genre} onChange={e => setBookForm({...bookForm, genre: e.target.value})}>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year Published</label>
                <input className="form-input" type="number" value={bookForm.year} onChange={e => setBookForm({...bookForm, year: parseInt(e.target.value) || new Date().getFullYear()})} />
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleAddBook}>Add Book</button>
                <button className="btn btn-secondary" onClick={() => setCurrentView('home')}>Cancel</button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div>
      {notification && (
          <div className={`notification ${notification.type}`}>
              {notification.message}
          </div>
      )}
      {currentView !== 'login' && currentView !== 'signup' && (
          <nav className="navbar">
              <div className="navbar-brand">
                  <Book color="#3b82f6" />
                  <span>BookReview</span>
              </div>
              <div className="navbar-links">
                  {/* Updated styling for navigation buttons */}
                  <button
                      className={`btn ${currentView === 'home' ? 'btn-primary' : 'btn-link'}`}
                      onClick={() => { setSelectedBook(null); setCurrentView('home'); }}
                  >
                      <Home size={16}/> Home
                  </button>
                  <button
                      className={`btn ${currentView === 'addBook' ? 'btn-primary' : 'btn-link'}`}
                      onClick={() => setCurrentView('addBook')}
                  >
                      <Plus size={16}/> Add Book
                  </button>
              </div>
              <div className="navbar-user">
                  <span className="navbar-user-name"><User size={16}/> {user?.name}</span>
                  <button className="btn-icon" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun/> : <Moon/>}</button>
                  <button className="btn btn-danger" onClick={handleLogout}><LogOut size={16}/></button>
              </div>
          </nav>
      )}
      <main className="container">
        {renderContent()}
      </main>
    </div>
  );
}