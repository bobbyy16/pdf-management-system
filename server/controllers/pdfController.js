const Pdf = require("../models/pdfModels");
const {
  uploadToDrive,
  deleteFromDrive,
  renameInDrive,
} = require("../config/googleDriveConfig");

// Upload PDF
exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const driveFile = await uploadToDrive(req.file);

    // Create PDF document in your DB
    const pdf = new Pdf({
      title: req.body.title || req.file.originalname,
      fileId: driveFile.fileId,
      viewLink: driveFile.viewLink,
      fileUrl: driveFile.viewLink,
      uploadedBy: req.user._id,
    });

    await pdf.save();

    res.status(201).json(pdf);
  } catch (error) {
    console.error("Upload PDF error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get current PDFs for authenticated user
exports.getMyPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find({ uploadedBy: req.user._id });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get PDF details (owner only)
exports.getPdfDetails = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(pdf);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update PDF title
exports.updatePdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await renameInDrive(pdf.fileId, req.body.title);
    pdf.title = req.body.title;
    await pdf.save();

    res.json(pdf);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete PDF
exports.deletePdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await deleteFromDrive(pdf.fileId);
    // await Comment.deleteMany({ pdf: req.params.id });

    await pdf.deleteOne();

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
