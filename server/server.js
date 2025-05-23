const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { ConnectDB } = require("./config/db");

// Connect to MongoDB
ConnectDB();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Define home route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>PDF Drive - Success!</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>🚀 PDF Drive Server is Running!</h1>
        <p>Your PDF sharing application with Google Drive integration is ready.</p>
        <img src="https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif" alt="Success!" style="margin-top: 20px;" />
      </body>
    </html>
  `);
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const pdfSharingRoutes = require("./routes/pdfSharingRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/pdf-sharing", pdfSharingRoutes);
app.use("/api/pdf", commentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 50MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.message === "Only PDF files are allowed!") {
    return res.status(400).json({ message: "Only PDF files are allowed" });
  }

  return res
    .status(500)
    .json({ message: err.message || "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
