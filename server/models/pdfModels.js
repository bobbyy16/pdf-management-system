const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
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
);

// once pdf gets deleted, delete all comments related to it
pdfSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await Comment.deleteMany({ pdf: this._id });
    next();
  }
);

module.exports = mongoose.model("Pdf", pdfSchema);
