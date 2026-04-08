const User = require("../models/user.model");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.create({ email, password });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json(user);
};