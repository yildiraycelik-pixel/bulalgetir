const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Tüm kategorileri getir
router.get('/', (req, res) => {
    const data = readJSON('kategoriler.json');
    if (data) {
        res.json(data.kategoriler);
    } else {
        res.status(500).json({ error: 'Kategoriler okunamadı' });
    }
});

// Tek kategori getir
router.get('/:id', (req, res) => {
    const data = readJSON('kategoriler.json');
    if (data) {
        const kategori = data.kategoriler.find(k => k.id == req.params.id);
        if (kategori) {
            res.json(kategori);
        } else {
            res.status(404).json({ error: 'Kategori bulunamadı' });
        }
    } else {
        res.status(500).json({ error: 'Kategoriler okunamadı' });
    }
});

// Yeni kategori ekle (admin yetkisi gerekli)
router.post('/', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('kategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Kategoriler okunamadı' });
    }
    
    // Yeni ID oluştur
    const newId = data.kategoriler.length > 0 
        ? Math.max(...data.kategoriler.map(k => k.id)) + 1 
        : 1;
    
    // Slug oluştur
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : '';
    
    const yeniKategori = {
        id: newId,
        adi: req.body.adi,
        slug: slug,
        sira: req.body.sira || newId,
        eklenme_tarihi: new Date().toISOString()
    };
    
    data.kategoriler.push(yeniKategori);
    
    if (writeJSON('kategoriler.json', data)) {
        res.status(201).json({ 
            message: 'Kategori başarıyla eklendi', 
            kategori: yeniKategori 
        });
    } else {
        res.status(500).json({ error: 'Kategori kaydedilemedi' });
    }
});

// Kategori güncelle
router.put('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('kategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Kategoriler okunamadı' });
    }
    
    const index = data.kategoriler.findIndex(k => k.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    // Slug güncelle
    const slug = req.body.adi 
        ? req.body.adi.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
        : data.kategoriler[index].slug;
    
    data.kategoriler[index] = {
        ...data.kategoriler[index],
        adi: req.body.adi || data.kategoriler[index].adi,
        slug: slug,
        sira: req.body.sira || data.kategoriler[index].sira,
        guncellenme_tarihi: new Date().toISOString()
    };
    
    if (writeJSON('kategoriler.json', data)) {
        res.json({ 
            message: 'Kategori başarıyla güncellendi', 
            kategori: data.kategoriler[index] 
        });
    } else {
        res.status(500).json({ error: 'Kategori güncellenemedi' });
    }
});

// Kategori sil
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('kategoriler.json');
    if (!data) {
        return res.status(500).json({ error: 'Kategoriler okunamadı' });
    }
    
    const index = data.kategoriler.findIndex(k => k.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    // Alt kategorileri kontrol et (opsiyonel)
    const altKategoriData = readJSON('altkategoriler.json');
    if (altKategoriData) {
        const altKategoriler = altKategoriData.altkategoriler.filter(a => a.kategori_id == req.params.id);
        if (altKategoriler.length > 0) {
            return res.status(400).json({ 
                error: 'Bu kategoriye ait alt kategoriler var. Önce onları silin!',
                altKategoriler: altKategoriler
            });
        }
    }
    
    data.kategoriler.splice(index, 1);
    
    if (writeJSON('kategoriler.json', data)) {
        res.json({ message: 'Kategori başarıyla silindi' });
    } else {
        res.status(500).json({ error: 'Kategori silinemedi' });
    }
});

module.exports = router;
