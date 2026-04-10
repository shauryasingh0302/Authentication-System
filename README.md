# Authentication System

Full-stack authentication project built with React + Vite on the frontend and Node.js + Express + MongoDB on the backend.

It includes:

- Signup and login
- JWT authentication with HTTP-only cookies
- Email verification with OTP
- Password reset with OTP
- Protected user profile endpoint

## Table of Contents

- Overview
- Tech Stack
- Features
- Architecture
- Folder Structure
- Environment Variables
- Installation
- Running the App
- API Reference
- End-to-End Flows
- Security Notes
- Common Issues and Fixes
- Available Scripts
- Future Improvements

## Overview

This project demonstrates a complete auth workflow commonly used in real web apps:

1. User creates account
2. Password is hashed with bcrypt
3. JWT is generated and stored in cookie
4. User can verify email with a one-time password
5. User can reset password via OTP email
6. Protected routes read JWT from cookie and authorize access

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- React Toastify

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Token (jsonwebtoken)
- bcryptjs
- cookie-parser
- CORS
- Nodemailer (Brevo SMTP relay)

## Features

- Account registration and login
- Encrypted password storage
- Cookie-based session handling using JWT
- Email verification OTP generation and validation
- Password reset OTP generation and validation
- OTP expiry checks on backend
- Protected route middleware
- Auth state check endpoint for frontend session recovery

## Architecture

### Frontend responsibilities

- Render auth screens and forms
- Validate user input at UI level
- Send API requests with credentials
- Display success/error toasts
- Redirect based on auth state

### Backend responsibilities

- Validate payloads
- Manage user data in MongoDB
- Hash and compare passwords
- Sign and verify JWTs
- Send OTP emails
- Enforce authorization on protected routes

### Auth model

- JWT payload includes user id
- JWT stored in HTTP-only cookie named token
- Middleware reads and verifies token
- User id is attached to request object as req.userId

## Folder Structure

```text
Authentication-System/
  backend/
    config/
      mongodb.js
      nodemailer.js
    controllers/
      auth.controller.js
      user.controller.js
    middleware/
      user.middleware.js
    models/
      user.model.js
    routes/
      auth.routes.js
      user.routes.js
    server.js
    package.json

  frontend/
    src/
      assets/
      components/
      context/
      pages/
      App.jsx
      main.jsx
      index.css
    package.json
```

## Environment Variables

Create this file: backend/.env

```env
PORT=4000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_password
SENDER_EMAIL=your_verified_sender_email
```

Create this file: frontend/.env

```env
VITE_BACKEND_URL=http://localhost:4000
```

## Installation

### 1) Clone repository

```bash
git clone <your-repo-url>
cd Authentication-System
```

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running the App

Start backend in one terminal:

```bash
cd backend
npm run dev
```

Start frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## API Reference

Base URL: http://localhost:4000

### Auth Routes

#### POST /api/auth/register

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

Success response:

```json
{
  "success": true
}
```

#### POST /api/auth/login

Request body:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

#### POST /api/auth/logout

Clears auth cookie.

#### POST /api/auth/send-verify-otp (Protected)

Sends verification OTP to logged-in user email.

#### POST /api/auth/verify-account (Protected)

Request body:

```json
{
  "otp": "123456"
}
```

#### GET /api/auth/is-auth (Protected)

Checks whether current cookie token is valid.

#### POST /api/auth/send-reset-otp

Request body:

```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password

Request body:

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newStrongPassword"
}
```

### User Routes

#### GET /api/user/data (Protected)

Returns user profile summary.

## End-to-End Flows

### Signup flow

1. User submits name/email/password
2. Backend hashes password and creates user
3. JWT cookie is set
4. Frontend updates auth state

### Email verification flow

1. User clicks Verify Email
2. Backend creates 6-digit OTP and expiry
3. OTP email sent via SMTP
4. User submits OTP
5. Backend marks account as verified

### Password reset flow

1. User submits email on reset screen
2. Backend sends reset OTP email
3. User enters OTP and new password
4. Backend validates OTP + expiry
5. Password is re-hashed and updated

## Security Notes

- Passwords are stored as bcrypt hashes
- JWT token is stored in HTTP-only cookie
- OTPs are time-limited
- Protected endpoints require verified JWT
- In production, secure cookie and strict CORS config are required

## Common Issues and Fixes

### Invalid URL errors on frontend

Ensure frontend/.env has:

```env
VITE_BACKEND_URL=http://localhost:4000
```

Then restart Vite dev server after changing env.

### CORS or cookie not working

- Confirm frontend origin is included in allowedOrigins in backend/server.js
- Use axios with credentials enabled
- Do not use wildcard origin when credentials are enabled

### OTP not arriving in inbox

- Check SMTP_USER and SMTP_PASS
- Check spam folder
- Verify sender email matches SMTP provider rules

### Mongo connection error

- Verify MONGO_URI
- Ensure IP/network access is allowed in MongoDB provider

## Available Scripts

### Backend scripts

- npm run dev: run backend with nodemon
- npm start: run backend with node

### Frontend scripts

- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build
- npm run lint: run ESLint

## Future Improvements

- Add refresh token flow
- Add rate limiting on OTP and auth routes
- Add request validation middleware
- Add unit and integration tests
- Add Docker support
- Add account lockout after repeated failed attempts

## Author

Shaurya Singh
