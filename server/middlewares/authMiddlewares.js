const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Fixed: decoded.id

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    let message = "Token is not valid";
    if (error.name === "TokenExpiredError") {
      message = "Access token expired";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token";
    }
    res.status(401).json({ message });
  }
};

module.exports = auth;
