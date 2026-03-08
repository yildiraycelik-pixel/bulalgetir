const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kategoriler', require('./routes/kategoriler'));
app.use('/api/altkategoriler', require('./routes/altkategoriler'));
app.use('/api/sonaltkategoriler', require('./routes/sonaltkategoriler'));
app.use('/api/urunler', require('./routes/urunler'));
app.use('/api/stok', require('./routes/stok'));

// Admin panel statik dosyaları
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Ana sayfa
app.get('/', (req, res) => {
    res.json({ 
        message: 'BulalGetir API',
        endpoints: {
            auth: '/api/auth',
            kategoriler: '/api/kategoriler',
            altkategoriler: '/api/altkategoriler',
            sonaltkategoriler: '/api/sonaltkategoriler',
            urunler: '/api/urunler',
            stok: '/api/stok'
        }
    });
});

// JSON dosyalarını okuma yardımcı fonksiyonu
global.readJSON = (filePath) => {
    const fullPath = path.join(__dirname, '../src/_data', filePath);
    try {
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading ' + filePath + ':', error.message);
        return null;
    }
};

// JSON dosyalarını yazma yardımcı fonksiyonu
global.writeJSON = (filePath, data) => {
    const fullPath = path.join(__dirname, '../src/_data', filePath);
    try {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing ' + filePath + ':', error.message);
        return false;
    }
};

app.listen(PORT, () => {
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('📊 Admin panel: http://localhost:' + PORT + '/admin');
});
