# HelpOthers – Backend API

This repository contains the backend API for the HelpOthers platform.

The backend is built with **Node.js and Express** and provides authentication, donation handling, image management, and other services required by the frontend application.

The API is deployed on **Railway** and connects to **MongoDB Atlas**.

---

## Live Backend API

https://myprojectadiyuvanbackend-production.up.railway.app


for demo purpose 
email => admin@gmail.com , volunteer@gmail.com , user@gmail.com , 
password => admin123 , volunteer123 , user123 ,
username => admin , volunteer , user ,

verification code => 123456

---

## Tech Stack

Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

Authentication
- JWT
- Google OAuth

Security
- Helmet
- Express Rate Limit
- CORS Configuration
- Cookie Parser

Integrations
- Razorpay (Payments)
- Cloudinary (Image Storage)
- Nodemailer (Email Service)

Deployment
- Railway

---

## Features

### Authentication & Authorization
- JWT based authentication
- Google OAuth login integration
- Role based access control for protected routes

### User Management
- Password reset functionality
- Email notifications using Nodemailer
- Secure cookie handling

### Payment Integration
- Razorpay order creation
- Payment verification
- Secure payment flow

### Image Management
- Image upload using Multer
- Cloudinary integration for cloud image storage
- API endpoints for retrieving uploaded images

### Security
- Helmet for HTTP security headers
- Express rate limiting to prevent abuse
- Secure CORS configuration
- Input validation

### Database
- MongoDB Atlas integration
- Mongoose models for structured data handling

### Deployment
- Backend deployed on Railway
- Environment variables for sensitive configuration

## Environment Variables

Create a `.env` file in the root of the backend project.

PORT=8080
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=my_google_client_id
GOOGLE_CLIENT_SECRET=my_google_client_secret

RAZORPAY_KEY_ID=my_razorpay_key
RAZORPAY_KEY_SECRET=my_razorpay_secret

CLOUDINARY_CLOUD_NAME=my_cloudinary_name
CLOUDINARY_API_KEY=my_cloudinary_api_key
CLOUDINARY_API_SECRET=my_cloudinary_api_secret

EMAIL_USER=my_email
EMAIL_PASS=my_email_password

Example configuration:

## Installation

Clone the repository

git clone https://github.com/RahulShukla387/helpOthersBackend


Navigate to the project directory

cd MyProjectAdiYuvanBackend


Install dependencies

npm install


Run the development server

npm run server


---

## Deployment

The backend API is deployed on **Railway**.

Steps used:

1. Push project to GitHub
2. Import repository into Railway
3. Configure environment variables
4. Deploy the service

---

## Author

Rahul Shukla

GitHub

https://github.com/RahulShukla387


