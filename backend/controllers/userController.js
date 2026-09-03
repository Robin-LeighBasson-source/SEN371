const User = require("../models/User");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe };
