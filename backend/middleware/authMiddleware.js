const { verifyToken } = require("../services/authService");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized, no token");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Not authorized, invalid token";
    next(error);
  }
};

module.exports = { protect };
