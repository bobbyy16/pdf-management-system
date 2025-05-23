# PDF Drive - PDF Management System

PDF Drive is a full-stack web application for uploading, managing, sharing, and collaborating on PDF documents. It provides a secure platform for users to store their PDFs in the cloud, share them with specific users, and engage in discussions through comments.

## 🌟 Features

### 📄 PDF Management

- Upload PDF documents
- View, rename, and delete PDFs
- Organize and search through your document library

### 🔗 Sharing Options

- Share PDFs with specific users via email
- Generate public links for anyone to access
- Control access to your documents

### 💬 Collaboration

- Comment on PDFs to discuss content
- Edit and delete your own comments
- View comments from other users

### 👤 User Management

- Secure user registration and authentication
- Profile management
- View documents shared with you

## 🛠️ Tech Stack

### Backend

- **Node.js** and **Express**: Server framework
- **MongoDB**: Database with Mongoose ODM
- **Google Drive API**: PDF storage
- **JWT**: Authentication
- **Multer**: File upload handling

### Frontend

- **React**: UI library
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Axios**: API requests
- **React Hot Toast**: Notifications

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- MongoDB database
- Google Cloud Platform account with Drive API enabled
- Service account credentials for Google Drive API

## 🚀 Installation

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pdf-management-system.git
   cd pdf-management-system/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # Google Drive API

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

   # Frontend URL (for generating sharing links)

   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

The application is deployed with:

- Backend: [Render](https://render.com)
- Frontend: [Vercel](https://vercel.com)

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `node server.js`
5. Add all environment variables from your `.env` file

### Frontend Deployment

1. Import your project to Vercel
2. Set the framework preset to Vite
3. Add the environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
4. Deploy

## 👥 Contributors

- [bobbyy16](https://github.com/bobbyy16)

## 🙏 Acknowledgements

- [Google Drive API](https://developers.google.com/drive)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hot Toast](https://react-hot-toast.com/)
