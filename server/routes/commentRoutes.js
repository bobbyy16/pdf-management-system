const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddlewares");

const {
  createComment,
  getComments,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

router.post("/:pdfId/comments", auth, createComment);
router.get("/:pdfId/comments", getComments);
router.put("/comments/:commentId", auth, updateComment);
router.delete("/comments/:commentId", auth, deleteComment);

module.exports = router;
