const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: 'Token gerekli' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bulalgetir_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
};

module.exports = { verifyToken, isAdmin };
