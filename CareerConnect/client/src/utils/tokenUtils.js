const jwt = require('jsonwebtoken');

/**
 * Generates a JWT for the user.
 * Includes user ID, role, and company ID (if applicable) in the payload.
 *
 * @param {object} user - The user object from the database.
 * @returns {string} The signed JWT.
 */
const generateToken = (user) => {
    // Convert company ObjectId to String for a clean token payload (Crucial for auth checks)
    const companyId = user.company ? user.company.toString() : null;

    return jwt.sign(
        { 
            id: user._id, 
            role: user.role, 
            company: companyId // HR/Company authorization ke liye zaroori
        },
        process.env.JWT_SECRET,
        // FIX: Token expiration set to 7 days (1 week)
        { expiresIn: '7d' } 
    );
};

module.exports = { generateToken };