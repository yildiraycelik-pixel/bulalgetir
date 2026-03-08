const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Basit admin kullanıcı
const ADMIN_USER = {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
};

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt:', username);
    
    if (username !== ADMIN_USER.username || password !== ADMIN_USER.password) {
        return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    const token = jwt.sign(
        { username: ADMIN_USER.username, role: ADMIN_USER.role },
        process.env.JWT_SECRET || 'bulalgetir_secret_key',
        { expiresIn: '24h' }
    );
    
    res.json({
        message: 'Giriş başarılı',
        token,
        user: {
            username: ADMIN_USER.username,
            role: ADMIN_USER.role
        }
    });
});

// Token doğrula
router.get('/verify', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ valid: false });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bulalgetir_secret_key');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
