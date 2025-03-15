const jwt = require('jsonwebtoken');

// JWT Verification Middleware (Already implemented)
const authenticateUser = (req, res, next) => {
  const token = req.cookies?.token || req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Role Authorization Middleware (New implementation)
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.hostels) {
      return res.status(403).json({ message: 'Access denied: No roles found' });
    }

    // Check if the user has at least one matching role
    const hasAccess = req.user.hostels.some((hostel) =>
      allowedRoles.includes(hostel.role)
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next(); // Proceed if authorized
  };
};

module.exports = { authenticateUser, authorizeRole };
