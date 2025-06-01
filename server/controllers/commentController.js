const Comment = require("../models/commentModels");
const Pdf = require("../models/pdfModels");

// Create comment (logged-in user only)
const createComment = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) return res.status(400).json({ message: "Text is required" });

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    // Check if the user has access to the PDF
    const hasAccess = pdf.sharedWith.some(
      (share) => share.userId.toString() === userId.toString()
    );
    if (!hasAccess && pdf.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "No access to this PDF" });
    }

    const comment = new Comment({
      pdf: pdfId,
      user: userId,
      text,
    });

    await comment.save();

    // Populate the user data before sending response
    await comment.populate("user", "name email");

    res.status(201).json({ message: "Comment created", comment });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all comments for a PDF
const getComments = async (req, res) => {
  try {
    const { pdfId } = req.params;

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    const comments = await Comment.find({ pdf: pdfId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a comment (only owner)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) return res.status(400).json({ message: "Text is required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    comment.text = text;
    await comment.save();

    // Populate the user data before sending response, look into this, its required or not
    await comment.populate("user", "name email");

    res.json({ message: "Comment updated", comment });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a comment (only owner)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
