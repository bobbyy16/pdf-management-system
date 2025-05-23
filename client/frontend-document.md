# PDF Management System - Frontend Documentation

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Components](#components)
- [Pages](#pages)
- [Authentication](#authentication)
- [State Management](#state-management)

## Overview

The frontend is built with React.js and uses React Router for navigation. It features a responsive design using Tailwind CSS for styling. The application allows users to upload, view, share, and comment on PDF documents.

## Features

### 1. User Authentication

- User registration with validation
- User login with JWT authentication
- Persistent login state
- Protected routes

### 2. PDF Management

- Upload PDFs
- View list of uploaded PDFs
- View PDF details and preview
- Update PDF titles
- Delete PDFs

### 3. PDF Sharing

- Share PDFs with specific users
- Generate public links for PDFs
- View PDFs shared by others
- Access control for shared PDFs

### 4. Comments

- Add comments to PDFs
- View comments on PDFs
- Edit and delete own comments
- Real-time comment updates

### 5. User Interface

- Responsive design for all devices
- Dashboard with tabs for personal and shared PDFs
- Search functionality for PDFs
- Loading states and error handling
- Toast notifications for user feedback

## Components

### Navigation

- `Navbar.jsx`: Main navigation bar with authentication state

### PDF Management

- `UploadPdfModal.jsx`: Modal for uploading new PDFs
- `ShareModal.jsx`: Modal for sharing PDFs with other users

### Comments

- `CommentSection.jsx`: Component for displaying and managing comments

### PDF Viewing

- `ExternalPdfView.jsx`: Component for viewing PDFs shared with the user
- `SharedPdfView.jsx`: Component for viewing publicly shared PDFs

## Pages

### Authentication Pages

- `Login.jsx`: User login page
- `Register.jsx`: User registration page

### Main Pages

- `Dashboard.jsx`: Main dashboard with tabs for personal and shared PDFs
- `PdfView.jsx`: Page for viewing PDF details, preview, and comments

## Authentication

Authentication is managed through the `AuthContext` which provides:

- User state management
- Login functionality
- Registration functionality
- Logout functionality
- Protected route handling

## State Management

State management is handled through:

1. **React Context API**: For global state like authentication
2. **React useState**: For component-level state
3. **React useEffect**: For side effects and data fetching
