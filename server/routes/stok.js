const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Tüm stok durumunu getir
router.get('/', (req, res) => {
    const data = readJSON('urunler.json');
    if (data) {
        const stokDurumu = data.urunler.map(u => ({
            id: u.id,
            adi: u.adi,
            stok: u.stok || 0,
            kritik_stok: u.stok && u.stok < 5 ? true : false
        }));
        res.json(stokDurumu);
    } else {
        res.status(500).json({ error: 'Stok bilgileri okunamadı' });
    }
});

// Kritik stok uyarıları
router.get('/kritik', (req, res) => {
    const data = readJSON('urunler.json');
    if (data) {
        const kritikStoklar = data.urunler.filter(u => u.stok && u.stok < 5);
        res.json(kritikStoklar);
    } else {
        res.status(500).json({ error: 'Stok bilgileri okunamadı' });
    }
});

module.exports = router;
