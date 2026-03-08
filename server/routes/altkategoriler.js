const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Tüm alt kategorileri getir
router.get('/', (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (data) {
        res.json(data.altkategoriler);
    } else {
        res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
});

// Kategori ID'ye göre alt kategorileri getir
router.get('/kategori/:kategoriId', (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (data) {
        const filtered = data.altkategoriler.filter(a => a.kategori_id == req.params.kategoriId);
        res.json(filtered);
    } else {
        res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
});

// Tek alt kategori getir
router.get('/:id', (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (data) {
        const altKategori = data.altkategoriler.find(a => a.id == req.params.id);
        if (altKategori) {
            res.json(altKategori);
        } else {
            res.status(404).json({ error: 'Alt kategori bulunamadı' });
        }
    } else {
        res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
});

// Yeni alt kategori ekle (admin yetkisi gerekli)
router.post('/', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
    
    // Yeni ID oluştur
    const newId = data.altkategoriler.length > 0 
        ? Math.max(...data.altkategoriler.map(a => a.id)) + 1 
        : 101; // 100'den başlasın
    
    // Slug oluştur
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : '';
    
    const yeniAltKategori = {
        id: newId,
        adi: req.body.adi,
        slug: slug,
        kategori_id: parseInt(req.body.kategori_id),
        sira: req.body.sira || newId,
        eklenme_tarihi: new Date().toISOString()
    };
    
    data.altkategoriler.push(yeniAltKategori);
    
    if (writeJSON('altkategoriler.json', data)) {
        res.status(201).json({ 
            message: 'Alt kategori başarıyla eklendi', 
            altKategori: yeniAltKategori 
        });
    } else {
        res.status(500).json({ error: 'Alt kategori kaydedilemedi' });
    }
});

// Alt kategori güncelle
router.put('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
    
    const index = data.altkategoriler.findIndex(a => a.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Alt kategori bulunamadı' });
    }
    
    // Slug güncelle
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : data.altkategoriler[index].slug;
    
    data.altkategoriler[index] = {
        ...data.altkategoriler[index],
        adi: req.body.adi || data.altkategoriler[index].adi,
        slug: slug,
        kategori_id: req.body.kategori_id ? parseInt(req.body.kategori_id) : data.altkategoriler[index].kategori_id,
        sira: req.body.sira || data.altkategoriler[index].sira,
        guncellenme_tarihi: new Date().toISOString()
    };
    
    if (writeJSON('altkategoriler.json', data)) {
        res.json({ 
            message: 'Alt kategori başarıyla güncellendi', 
            altKategori: data.altkategoriler[index] 
        });
    } else {
        res.status(500).json({ error: 'Alt kategori güncellenemedi' });
    }
});

// Alt kategori sil
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('altkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Alt kategoriler okunamadı' });
    }
    
    const index = data.altkategoriler.findIndex(a => a.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Alt kategori bulunamadı' });
    }
    
    // Son alt kategorileri kontrol et
    const sonAltData = readJSON('sonaltkategoriler.json');
    if (sonAltData) {
        const sonAltKategoriler = sonAltData.sonaltkategoriler.filter(s => s.altkategori_id == req.params.id);
        if (sonAltKategoriler.length > 0) {
            return res.status(400).json({ 
                error: 'Bu alt kategoriye ait son alt kategoriler var. Önce onları silin!',
                sonAltKategoriler: sonAltKategoriler
            });
        }
    }
    
    data.altkategoriler.splice(index, 1);
    
    if (writeJSON('altkategoriler.json', data)) {
        res.json({ message: 'Alt kategori başarıyla silindi' });
    } else {
        res.status(500).json({ error: 'Alt kategori silinemedi' });
    }
});

module.exports = router;
