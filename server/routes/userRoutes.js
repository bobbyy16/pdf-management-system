const express = require("express");
const { registerUser, loginUser } = require("../controllers/userControllers");
const auth = require("../middlewares/authMiddlewares");
const { getAllUsers } = require("../controllers/pdfSharingController");
const router = express.Router();
router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/all", auth, getAllUsers);

module.exports = router;
