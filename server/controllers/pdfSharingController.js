const Pdf = require("../models/pdfModels");
const User = require("../models/userModels");
const { v4: uuidv4 } = require("uuid");

// Share with specific user via email (no link generation)
exports.shareWithEmail = async (req, res) => {
  try {
    console.log("ShareWithEmail request:", {
      pdfId: req.params.id,
      userId: req.user._id,
      body: req.body,
    });

    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      console.log("PDF not found:", req.params.id);
      return res.status(404).json({ error: "PDF not found" });
    }

    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      console.log("Unauthorized access attempt:", {
        pdfOwner: pdf.uploadedBy,
        requestUser: req.user._id,
      });
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "UserId and email are required" });
    }

    const user = await User.findById(userId);
    if (!user || user.email !== email) {
      console.log("User not found or email mismatch:", {
        userId,
        email,
        foundUser: user,
      });
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

    console.log("Successfully shared PDF:", {
      pdfId: pdf._id,
      sharedWith: user.email,
    });

    res.json({
      message: `Access granted to ${user.name || user.email}`,
      success: true,
    });
  } catch (error) {
    console.error("Share with email error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Generate public link (no expiration)
exports.generatePublicLink = async (req, res) => {
  try {
    console.log("GeneratePublicLink request:", {
      pdfId: req.params.id,
      userId: req.user._id,
    });

    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      console.log("PDF not found:", req.params.id);
      return res.status(404).json({ error: "PDF not found" });
    }

    if (pdf.uploadedBy.toString() !== req.user._id.toString()) {
      console.log("Unauthorized public link generation:", {
        pdfOwner: pdf.uploadedBy,
        requestUser: req.user._id,
      });
      return res.status(403).json({ error: "Unauthorized" });
    }

    const publicToken = uuidv4();
    pdf.publicAccessToken = publicToken;
    pdf.publicLinkExpiresAt = null; // No expiration
    await pdf.save();

    // Use environment variable for frontend URL in production
    const frontendUrl =
      process.env.FRONTEND_URL || "https://pdf-management-system.vercel.app";
    const publicLink = `${frontendUrl}/shared/${pdf._id}?token=${publicToken}`;

    console.log("Generated public link:", publicLink);

    res.json({
      message: "Public link generated",
      publicLink,
      success: true,
    });
  } catch (error) {
    console.error("Generate public link error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// View PDF via public link (no auth required, no expiration check)
exports.viewPublicPdf = async (req, res) => {
  try {
    console.log("ViewPublicPdf request:", {
      pdfId: req.params.id,
      token: req.query.token ? "present" : "missing",
    });

    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      console.log("PDF not found:", req.params.id);
      return res.status(404).json({ error: "PDF not found" });
    }

    if (!pdf.publicAccessToken || pdf.publicAccessToken !== req.query.token) {
      console.log("Invalid public link access:", {
        hasPublicToken: !!pdf.publicAccessToken,
        tokenMatch: pdf.publicAccessToken === req.query.token,
      });
      return res.status(403).json({ error: "Invalid public link" });
    }

    console.log("Successfully accessed public PDF:", pdf._id);

    res.json({
      title: pdf.title,
      fileId: pdf.fileId,
      fileUrl: pdf.fileUrl,
      createdAt: pdf.createdAt,
      success: true,
    });
  } catch (error) {
    console.error("View public PDF error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Access PDF via email sharing (for logged-in users)
exports.getExternalAccess = async (req, res) => {
  try {
    console.log("GetExternalAccess request:", {
      pdfId: req.params.id,
      userId: req.user._id,
    });

    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      console.log("PDF not found:", req.params.id);
      return res.status(404).json({ error: "PDF not found" });
    }

    const userId = req.user._id;

    // Check if user has access through email sharing
    const sharedAccess = pdf.sharedWith.find(
      (share) => share.userId.toString() === userId.toString()
    );

    if (!sharedAccess) {
      console.log("User doesn't have access:", {
        userId,
        sharedWith: pdf.sharedWith.map((s) => s.userId.toString()),
      });
      return res
        .status(403)
        .json({ error: "You don't have access to this PDF" });
    }

    console.log("Successfully accessed shared PDF:", pdf._id);

    res.json({
      title: pdf.title,
      fileId: pdf.fileId,
      fileUrl: pdf.fileUrl,
      createdAt: pdf.createdAt,
      success: true,
    });
  } catch (error) {
    console.error("Get external access error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get PDFs shared with the current user
exports.getSharedWithMe = async (req, res) => {
  try {
    console.log("GetSharedWithMe request:", {
      userId: req.user._id,
    });

    const userId = req.user._id;

    // Find all PDFs where the current user is in the sharedWith array
    const sharedPdfs = await Pdf.find({
      "sharedWith.userId": userId,
    })
      .populate("uploadedBy", "name email") // Populate the owner info
      .sort({ createdAt: -1 });

    console.log("Found shared PDFs:", sharedPdfs.length);

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

    res.json({
      pdfs: transformedPdfs,
      count: transformedPdfs.length,
      success: true,
    });
  } catch (error) {
    console.error("Get shared with me error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get all users (for the dropdown search)
exports.getAllUsers = async (req, res) => {
  try {
    console.log("GetAllUsers request:", {
      currentUserId: req.user._id,
    });

    // Only return users other than the current user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email")
      .sort({ name: 1, email: 1 });

    console.log("Found users:", users.length);

    res.json({
      users,
      count: users.length,
      success: true,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
