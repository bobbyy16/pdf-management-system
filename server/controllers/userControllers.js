const User = require("../models/userModels");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const { userName, name, email, password } = req.body;

  if (!userName || !name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const existingUser =
      (await User.findOne({ email })) && (await User.findOne({ userName }));
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({ userName, name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(201).json({
      _id: user._id,
      userName: user.userName,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return res.status(200).json({
      _id: user._id,
      userName: user.userName,
      name: user.name,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
