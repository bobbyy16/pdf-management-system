# PDF Management System - Backend Documentation

## Table of Contents

- [Database Design](#database-design)
- [Authentication](#authentication)
- [Controllers](#controllers)
- [API Endpoints](#api-endpoints)
- [File Handling](#file-handling)
- [Environment Variables](#environment-variables)

## Database Design

The system uses MongoDB with Mongoose as the ODM (Object Document Mapper). There are three main models:

### User Model

```javascript
{
userName: { type: String, required: true, unique: true },
name: { type: String, required: true },
email: {
type: String,
required: true,
unique: true,
match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
},
password: { type: String, required: true },
},
{ timestamps: true }

```

### PDF Model

```javascript
{
title: { type: String, required: true },
fileId: { type: String, required: true },
fileUrl: { type: String, required: true },
uploadedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},

    // Public sharing
    publicAccessToken: { type: String },

    // Email sharing
    sharedWith: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        email: { type: String, required: true },
        accessToken: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

},
{ timestamps: true }

```

### Comment Model

```javascript
{
pdf: {
type: mongoose.Schema.Types.ObjectId,
ref: "Pdf",
required: true,
},
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
text: {
type: String,
required: true,
},
},
{ timestamps: true }

```

### Database Relationships

1. **User to PDF (One-to-Many)**:

   - A user can upload multiple PDFs
   - Each PDF has one uploader (owner)
   - Relationship field: `uploadedBy` in PDF model

2. **PDF to User (Many-to-Many)**:

   - A PDF can be shared with multiple users
   - A user can have access to multiple shared PDFs
   - Relationship field: `sharedWith` array in PDF model

3. **PDF to Comment (One-to-Many)**:

   - A PDF can have multiple comments
   - Each comment belongs to one PDF
   - Relationship field: `pdf` in Comment model

4. **User to Comment (One-to-Many)**:
   - A user can create multiple comments
   - Each comment is created by one user
   - Relationship field: `user` in Comment model

## Authentication

The system uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Short-lived token (15 minutes) for API access
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

## Controllers

### User Controller

Handles user registration and authentication:

- `registerUser`: Creates a new user account
- `loginUser`: Authenticates a user and provides tokens

### PDF Controller

Manages PDF document operations:

- `uploadPdf`: Uploads a PDF to Google Drive and stores metadata
- `getMyPdfs`: Retrieves all PDFs uploaded by the authenticated user
- `getPdfDetails`: Gets details of a specific PDF
- `updatePdf`: Updates PDF title (and in Google Drive)
- `deletePdf`: Deletes a PDF from both Google Drive and the database

### PDF Sharing Controller

Handles PDF sharing functionality:

- `shareWithEmail`: Shares a PDF with a specific user
- `generatePublicLink`: Creates a public access link
- `viewPublicPdf`: Allows viewing a PDF via public link
- `getExternalAccess`: Provides access to a shared PDF for authenticated users
- `getSharedWithMe`: Lists all PDFs shared with the current user
- `getAllUsers`: Gets all users for the sharing dropdown

### Comment Controller

Manages comments on PDFs:

- `createComment`: Adds a new comment to a PDF
- `getComments`: Retrieves all comments for a PDF
- `updateComment`: Updates an existing comment
- `deleteComment`: Removes a comment

## API Endpoints

### Authentication Routes

```
POST /api/users/register - Register a new user
POST /api/users/login - Login a user
GET /api/users/all - Get all users (requires authentication)
```

### PDF Management Routes

```
POST /api/pdfs/upload - Upload a new PDF (requires authentication)
GET /api/pdfs/my-pdfs - Get all PDFs uploaded by the user (requires authentication)
GET /api/pdfs/:id - Get details of a specific PDF (requires authentication)
PUT /api/pdfs/:id - Update PDF title (requires authentication)
DELETE /api/pdfs/:id - Delete a PDF (requires authentication)
```

### PDF Sharing Routes

```
POST /api/pdf-sharing/:id/share/email - Share PDF with a specific user (requires authentication)
POST /api/pdf-sharing/:id/share/public - Generate a public link (requires authentication)
GET /api/pdf-sharing/:id/view - View PDF via public link (no authentication required)
GET /api/pdf-sharing/:id/external-access - Access shared PDF (requires authentication)
GET /api/pdf-sharing/shared-with-me - Get PDFs shared with the user (requires authentication)
GET /api/pdf-sharing/users - Get all users for sharing (requires authentication)
```

### Comment Routes

```
POST /api/pdf/:pdfId/comments - Create a new comment (requires authentication)
GET /api/pdf/:pdfId/comments - Get all comments for a PDF
PUT /api/pdf/comments/:commentId - Update a comment (requires authentication)
DELETE /api/pdf/comments/:commentId - Delete a comment (requires authentication)
```

## File Handling

### Google Drive Integration

The system uses Google Drive for PDF storage:

```bash
// Google Drive Authentication
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});
```

### File Operations

- `uploadToDrive`: Uploads a file to Google Drive
- `deleteFromDrive`: Deletes a file from Google Drive
- `renameInDrive`: Renames a file in Google Drive

## Environment Variables

The backend requires the following environment variables:

# Server Configuration

```bash
PORT=5000
NODE_ENV=production
```

# MongoDB Connection

```bash
MONGODB_URI=mongodb+srv://...
```

# JWT Authentication

```bash
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

# Google Drive API

```bash
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_EMAIL=your_client_email
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_CERT_URL=your_client_cert_url
GOOGLE_UNIVERSE_DOMAIN=googleapis.com
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

# Frontend URL (for generating sharing links)

```bash
FRONTEND_URL=https://your-frontend-url.vercel.app
```
