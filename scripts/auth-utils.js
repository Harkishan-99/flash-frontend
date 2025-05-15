const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a secure random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Calculate token expiry time (1 hour from now)
 */
function getTokenExpiry() {
  return new Date(Date.now() + 1000 * 60 * 60); // 1 hour
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  getTokenExpiry
}; 