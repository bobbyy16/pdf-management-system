const Pdf = require("../models/pdfModels");
const User = require("../models/userModels");
const { v4: uuidv4 } = require("uuid");

// Share with specific user via email (no link generation)
exports.shareWithEmail = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { userId, email } = req.body;

    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has access
    const existingAccess = pdf.sharedWith.find(
      (share) => share.userId.toString() === userId.toString()
    );

    if (existingAccess) {
      return res
        .status(400)
        .json({ error: "User already has access to this PDF" });
    }

    const accessToken = uuidv4();

    pdf.sharedWith.push({
      userId: user._id,
      email: user.email,
      accessToken,
      createdAt: new Date(),
    });

    await pdf.save();

    res.json({
      message: `Access granted to ${user.name || user.email}`,
    });
  } catch (error) {
    console.error("Share with email error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Generate public link (no expiration)
exports.generatePublicLink = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const publicToken = uuidv4();
    pdf.publicAccessToken = publicToken;
    pdf.publicLinkExpiresAt = null; // No expiration
    await pdf.save();

    res.json({
      message: "Public link generated",
      publicLink: `${"https://pdf-management-system.vercel.app"}/shared/${
        pdf._id
      }?token=${publicToken}`,
    });
  } catch (error) {
    console.error("Generate public link error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// View PDF via public link (no auth required, no expiration check)
exports.viewPublicPdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    if (!pdf.publicAccessToken || pdf.publicAccessToken !== req.query.token) {
      return res.status(403).json({ error: "Invalid public link" });
    }

    res.json({
      title: pdf.title,
      fileId: pdf.fileId,
      fileUrl: pdf.fileUrl,
      createdAt: pdf.createdAt,
    });
  } catch (error) {
    console.error("View public PDF error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Access PDF via email sharing (for logged-in users)
exports.getExternalAccess = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    const userId = req.user._id;

    // Check if user has access through email sharing
    const sharedAccess = pdf.sharedWith.find(
      (share) => share.userId.toString() === userId.toString()
    );

    if (!sharedAccess) {
      return res
        .status(403)
        .json({ error: "You don't have access to this PDF" });
    }

    res.json({
      title: pdf.title,
      fileId: pdf.fileId,
      fileUrl: pdf.fileUrl,
      createdAt: pdf.createdAt,
    });
  } catch (error) {
    console.error("Get external access error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW: Get PDFs shared with the current user
exports.getSharedWithMe = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all PDFs where the current user is in the sharedWith array
    const sharedPdfs = await Pdf.find({
      "sharedWith.userId": userId,
    })
      .populate("uploadedBy", "name email") // Populate the owner info
      .sort({ createdAt: -1 });

    // Transform the data to include sharing info
    const transformedPdfs = sharedPdfs.map((pdf) => {
      const shareInfo = pdf.sharedWith.find(
        (share) => share.userId.toString() === userId.toString()
      );

      return {
        _id: pdf._id,
        title: pdf.title,
        fileId: pdf.fileId,
        fileUrl: pdf.fileUrl,
        createdAt: pdf.createdAt,
        owner: pdf.uploadedBy, // The person who shared it
        sharedAt: shareInfo.createdAt, // When it was shared
        accessToken: shareInfo.accessToken,
      };
    });

    res.json(transformedPdfs);
  } catch (error) {
    console.error("Get shared with me error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users (for the dropdown search)
exports.getAllUsers = async (req, res) => {
  try {
    // Only return users other than the current user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email")
      .sort({ name: 1, email: 1 });

    res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
