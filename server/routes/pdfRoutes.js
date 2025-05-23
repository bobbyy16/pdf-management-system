const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddlewares");
const { upload } = require("../config/multerConfig");
const {
  uploadPdf,
  getMyPdfs,
  getPdfDetails,
  updatePdf,
  deletePdf,
} = require("../controllers/pdfController");

// PDF Management Routes (require authentication)
router.post("/upload", auth, upload.single("pdf"), uploadPdf);
router.get("/my-pdfs", auth, getMyPdfs);
router.get("/:id", auth, getPdfDetails);
router.put("/:id", auth, updatePdf);
router.delete("/:id", auth, deletePdf);

module.exports = router;
