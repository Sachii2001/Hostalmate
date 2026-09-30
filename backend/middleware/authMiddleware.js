const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
         // Get the authorization header from the request
        const authHeader = req.headers.authorization;
         // Verify that a Bearer token is provided
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Not authorized. Please login first.'
            });
        }

        const token = authHeader.split(' ')[1];
       // Verify the token using the JWT secret
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
  // Attach authenticated user data to the request
        req.user = decoded;

        // Continue to the next middleware or route
        next();

    } catch (error) {
           // Reject invalid or expired authentication tokens
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

module.exports = protect;
