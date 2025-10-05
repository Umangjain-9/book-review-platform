BOOK REVIEW PLATFORM

A full-stack web application for discovering, reviewing, and sharing books. This platform allows users to sign up, log in, browse a collection of books, add new books, and post reviews with ratings. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

Tech Stack: React, Node.js, Express, MongoDB, TypeScript

LIVE DEMO

[INSERT YOUR LIVE FRONTEND LINK HERE] (e.g., Deployed on Vercel)

FEATURES

User Authentication: Secure user registration and login using JWT (JSON Web Tokens).

Book Management: Users can browse the book collection and add new books to the platform.

Review System: Authenticated users can write detailed reviews and give star ratings to books.

Search & Filter: Easily search for books by title or author, and filter the collection by genre.

Dynamic UI: A clean, modern, and responsive user interface built with React.

Dark Mode: A toggle for a comfortable viewing experience in low-light environments.

RESTful API: A well-structured backend API built with Express and Node.js.

SCREENSHOTS

Here is a preview of the application's interface:

(You can replace this link with a link to a GIF of your application. Tools like ScreenToGif or Giphy Capture are great for this.)

Application Screenshot Link: https://i.imgur.com/K0YQf5t.png

INSTALLATION & SETUP

To run this project locally, follow these steps:

Prerequisites:

Node.js (v18 or newer)

npm (or yarn)

MongoDB (a local instance or a free MongoDB Atlas cluster)

Clone the repository:
git clone https://github.com/Umangjain-9/book-review-platform.git
cd book-review-platform

Backend Setup:
cd backend
npm install

Create a .env file in the /backend folder (see Environment Variables section)

npm start

Frontend Setup:
(From the root folder, in a new terminal)
cd frontend
npm install

Create a .env.local file in the /frontend folder (see Environment Variables section)

npm run dev

ENVIRONMENT VARIABLES

You will need to create .env files in both the backend and frontend directories.

Backend (/backend/.env)
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_very_strong_and_long_secret_key

Frontend (/frontend/.env.local)
VITE_API_URL=http://localhost:5001/api

API ENDPOINTS

The backend provides the following RESTful API endpoints:

Method: POST
Endpoint: /api/auth/signup
Description: Register a new user.
Protected: No
Request Body (JSON): { "name", "email", "password" }
Success Response (2xx): { "_id", "name", "email", "token" }

Method: POST
Endpoint: /api/auth/login
Description: Authenticate a user and get a JWT.
Protected: No
Request Body (JSON): { "email", "password" }
Success Response (2xx): { "_id", "name", "email", "token" }

Method: GET
Endpoint: /api/books
Description: Retrieve a list of all books.
Protected: No
Request Body (JSON): (None)
Success Response (2xx): [ { "title", "author", ... } ]

Method: POST
Endpoint: /api/books
Description: Add a new book to the database.
Protected: Yes
Request Body (JSON): { "title", "author", "description", ... }
Success Response (2xx): { "_id", "title", "author", ... }

Method: DELETE
Endpoint: /api/books/:id
Description: Delete a book added by the logged-in user.
Protected: Yes
Request Body (JSON): (None)
Success Response (2xx): { "message": "Book removed" }

Method: GET
Endpoint: /api/reviews/:bookId
Description: Get all reviews for a specific book.
Protected: No
Request Body (JSON): (None)
Success Response (2xx): [ { "rating", "reviewText", ... } ]

Method: POST
Endpoint: /api/reviews/:bookId
Description: Add a new review for a specific book.
Protected: Yes
Request Body (JSON): { "rating", "reviewText" }
Success Response (2xx): { "_id", "rating", "reviewText", ... }

AUTHOR

Umang Jain

GitHub: @Umangjain-9 (https://github.com/Umangjain-9)
