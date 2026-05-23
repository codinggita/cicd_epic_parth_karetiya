// ─────────────────────────────────────────────────────────────────────────────
//  Auth Service – Handles pure business logic for authentication
// ─────────────────────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

exports.generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE || '7d' 
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' 
  });

  return { token, refreshToken };
};

exports.createSession = (token, req) => {
  return {
    token,
    device: req.headers['user-agent'] || 'unknown',
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 86400000)
  };
};
