const authenticate = (req, res, next) => {
    const apiKey = req.headers.authorization?.split('Bearer ')[1] || req.query.apiKey;

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is missing' });
    }

    if (apiKey !== process.env.MAIL_API_KEY) {
        return res.status(401).json({ message: 'Invalid API key' });
    }

    next();  // Proceed if API key is valid
};

module.exports = { authenticate };
