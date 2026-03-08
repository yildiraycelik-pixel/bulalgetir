const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Tüm son alt kategorileri getir
router.get('/', (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (data) {
        res.json(data.sonaltkategoriler);
    } else {
        res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
});

// Alt kategori ID'ye göre son alt kategorileri getir
router.get('/altkategori/:altKategoriId', (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (data) {
        const filtered = data.sonaltkategoriler.filter(s => s.altkategori_id == req.params.altKategoriId);
        res.json(filtered);
    } else {
        res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
});

// Tek son alt kategori getir
router.get('/:id', (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (data) {
        const sonAltKategori = data.sonaltkategoriler.find(s => s.id == req.params.id);
        if (sonAltKategori) {
            res.json(sonAltKategori);
        } else {
            res.status(404).json({ error: 'Son alt kategori bulunamadı' });
        }
    } else {
        res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
});

// Yeni son alt kategori ekle (admin yetkisi gerekli)
router.post('/', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
    
    // Yeni ID oluştur
    const newId = data.sonaltkategoriler.length > 0 
        ? Math.max(...data.sonaltkategoriler.map(s => s.id)) + 1 
        : 10001; // 10000'den başlasın
    
    // Slug oluştur
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : '';
    
    const yeniSonAltKategori = {
        id: newId,
        adi: req.body.adi,
        slug: slug,
        altkategori_id: parseInt(req.body.altkategori_id),
        sira: req.body.sira || newId,
        eklenme_tarihi: new Date().toISOString()
    };
    
    data.sonaltkategoriler.push(yeniSonAltKategori);
    
    if (writeJSON('sonaltkategoriler.json', data)) {
        res.status(201).json({ 
            message: 'Son alt kategori başarıyla eklendi', 
            sonAltKategori: yeniSonAltKategori 
        });
    } else {
        res.status(500).json({ error: 'Son alt kategori kaydedilemedi' });
    }
});

// Son alt kategori güncelle
router.put('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
    
    const index = data.sonaltkategoriler.findIndex(s => s.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Son alt kategori bulunamadı' });
    }
    
    // Slug güncelle
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : data.sonaltkategoriler[index].slug;
    
    data.sonaltkategoriler[index] = {
        ...data.sonaltkategoriler[index],
        adi: req.body.adi || data.sonaltkategoriler[index].adi,
        slug: slug,
        altkategori_id: req.body.altkategori_id ? parseInt(req.body.altkategori_id) : data.sonaltkategoriler[index].altkategori_id,
        sira: req.body.sira || data.sonaltkategoriler[index].sira,
        guncellenme_tarihi: new Date().toISOString()
    };
    
    if (writeJSON('sonaltkategoriler.json', data)) {
        res.json({ 
            message: 'Son alt kategori başarıyla güncellendi', 
            sonAltKategori: data.sonaltkategoriler[index] 
        });
    } else {
        res.status(500).json({ error: 'Son alt kategori güncellenemedi' });
    }
});

// Son alt kategori sil
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('sonaltkategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Son alt kategoriler okunamadı' });
    }
    
    const index = data.sonaltkategoriler.findIndex(s => s.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Son alt kategori bulunamadı' });
    }
    
    // Ürünleri kontrol et
    const urunData = readJSON('urunler.json');
    if (urunData) {
        const urunler = urunData.urunler.filter(u => u.sonaltkategori_id == req.params.id);
        if (urunler.length > 0) {
            return res.status(400).json({ 
                error: 'Bu son alt kategoriye ait ürünler var. Önce onları silin!',
                urunler: urunler
            });
        }
    }
    
    data.sonaltkategoriler.splice(index, 1);
    
    if (writeJSON('sonaltkategoriler.json', data)) {
        res.json({ message: 'Son alt kategori başarıyla silindi' });
    } else {
        res.status(500).json({ error: 'Son alt kategori silinemedi' });
    }
});

module.exports = router;
