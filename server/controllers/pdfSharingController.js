const Pdf = require("../models/pdfModels");
const User = require("../models/userModels");
const { v4: uuidv4 } = require("uuid");

// Share with specific user via email
exports.shareWithEmail = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: "PDF not found" });
    }

    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ error: "UserId and email are required" });
    }

    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      return res.status(404).json({ error: "User not found" });
    }

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
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Generate public link
exports.generatePublicLink = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: "PDF not found" });
    }

    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const publicToken = uuidv4();
    pdf.publicAccessToken = publicToken;
    await pdf.save();

    const frontendUrl =
      process.env.FRONTEND_URL || "https://pdf-management-system.vercel.app";
    const publicLink = `${frontendUrl}/shared/${pdf._id}?token=${publicToken}`;

    res.json({
      message: "Public link generated",
      publicLink,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// View PDF via public link
exports.viewPublicPdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: "PDF not found" });
    }

    if (!pdf.publicAccessToken || pdf.publicAccessToken !== req.query.token) {
      return res.status(403).json({ error: "Invalid public link" });
    }

    res.json({
      title: pdf.title,
      fileId: pdf.fileId,
      fileUrl: pdf.fileUrl,
      createdAt: pdf.createdAt,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Access PDF via email sharing
exports.getExternalAccess = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const userId = req.user._id;

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
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get PDFs shared with the current user

exports.getSharedWithMe = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all PDFs where the current user is included in the sharedWith array
    const pdfsSharedWithUser = await Pdf.find({
      "sharedWith.userId": currentUserId,
    })
      // Populate the 'uploadedBy' field with the owner's name and email
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    // Map over the PDFs to extract relevant info along with sharing metadata for the current user
    const pdfsWithSharingDetails = pdfsSharedWithUser.map((pdf) => {
      // Find sharing details specific to the current user
      const userShareDetails = pdf.sharedWith.find(
        (share) => share.userId.toString() === currentUserId.toString()
      );

      return {
        _id: pdf._id,
        title: pdf.title,
        fileId: pdf.fileId,
        fileUrl: pdf.fileUrl,
        createdAt: pdf.createdAt,
        owner: pdf.uploadedBy,
        sharedAt: userShareDetails.createdAt,
        accessToken: userShareDetails.accessToken,
      };
    });

    res.json({
      pdfs: pdfsWithSharingDetails,
      count: pdfsWithSharingDetails.length,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Finds all users except the currently logged-in user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email")
      .sort({ name: 1, email: 1 });

    res.json({
      users,
      count: users.length,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
