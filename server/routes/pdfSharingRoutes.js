const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddlewares");
const {
  shareWithEmail,
  generatePublicLink,
  viewPublicPdf,
  getExternalAccess,
  getSharedWithMe,
  getAllUsers,
} = require("../controllers/pdfSharingController");

// Generate sharing links (require authentication)
router.post("/:id/share/email", auth, shareWithEmail);
router.post("/:id/share/public", auth, generatePublicLink);

// Access PDFs
router.get("/:id/view", viewPublicPdf); // Public access (no auth required)
router.get("/:id/external-access", auth, getExternalAccess); // Email access (auth required)

router.get("/shared-with-me", auth, getSharedWithMe);

// Get all users for sharing dropdown
router.get("/users", auth, getAllUsers);

module.exports = router;
