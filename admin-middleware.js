const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token is provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.SECRET);

    // Attach decoded payload to request
    req.user = decoded;

    next(); // Proceed to next middleware/controller
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
