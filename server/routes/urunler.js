const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Multer konfigürasyonu (görsel yükleme)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/urunler');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'urun-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        if (ext && mime) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
    }
});

// Tüm ürünleri getir
router.get('/', (req, res) => {
    const data = readJSON('urunler.json');
    if (data) {
        res.json(data.urunler);
    } else {
        res.status(500).json({ error: 'Ürünler okunamadı' });
    }
});

// Tek ürün getir
router.get('/:id', (req, res) => {
    const data = readJSON('urunler.json');
    if (data) {
        const urun = data.urunler.find(u => u.id == req.params.id);
        if (urun) {
            res.json(urun);
        } else {
            res.status(404).json({ error: 'Ürün bulunamadı' });
        }
    } else {
        res.status(500).json({ error: 'Ürünler okunamadı' });
    }
});

// Yeni ürün ekle (admin yetkisi gerekli)
router.post('/', verifyToken, isAdmin, upload.array('gorseller', 5), (req, res) => {
    const data = readJSON('urunler.json');
    if (!data) {
        return res.status(500).json({ error: 'Ürünler okunamadı' });
    }
    
    // Yeni ID oluştur
    const newId = data.urunler.length > 0 
        ? Math.max(...data.urunler.map(u => u.id)) + 1 
        : 1;
    
    // Dosya yollarını oluştur - DÜZELTİLDİ
    const gorseller = req.files ? req.files.map(f => '/uploads/urunler/' + f.filename) : [];
    
    const yeniUrun = {
        id: newId,
        ...req.body,
        gorseller: gorseller,
        slug: req.body.adi ? req.body.adi.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : '',
        eklenme_tarihi: new Date().toISOString()
    };
    
    // Kategori ID'lerini sayıya çevir
    if (yeniUrun.kategori_id) yeniUrun.kategori_id = parseInt(yeniUrun.kategori_id);
    if (yeniUrun.altkategori_id) yeniUrun.altkategori_id = parseInt(yeniUrun.altkategori_id);
    if (yeniUrun.sonaltkategori_id) yeniUrun.sonaltkategori_id = parseInt(yeniUrun.sonaltkategori_id);
    if (yeniUrun.fiyat) yeniUrun.fiyat = parseFloat(yeniUrun.fiyat);
    
    data.urunler.push(yeniUrun);
    
    if (writeJSON('urunler.json', data)) {
        res.status(201).json({ 
            message: 'Ürün başarıyla eklendi', 
            urun: yeniUrun 
        });
    } else {
        res.status(500).json({ error: 'Ürün kaydedilemedi' });
    }
});

// Ürün güncelle
router.put('/:id', verifyToken, isAdmin, upload.array('gorseller', 5), (req, res) => {
    const data = readJSON('urunler.json');
    if (!data) {
        return res.status(500).json({ error: 'Ürünler okunamadı' });
    }
    
    const index = data.urunler.findIndex(u => u.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Mevcut ürünü al
    const mevcutUrun = data.urunler[index];
    
    // Yeni görseller varsa ekle - DÜZELTİLDİ
    let gorseller = mevcutUrun.gorseller || [];
    if (req.files && req.files.length > 0) {
        const yeniGorseller = req.files.map(f => '/uploads/urunler/' + f.filename);
        gorseller = [...gorseller, ...yeniGorseller];
    }
    
    // Ürünü güncelle
    data.urunler[index] = {
        ...mevcutUrun,
        ...req.body,
        gorseller: gorseller,
        guncellenme_tarihi: new Date().toISOString()
    };
    
    if (writeJSON('urunler.json', data)) {
        res.json({ 
            message: 'Ürün başarıyla güncellendi', 
            urun: data.urunler[index] 
        });
    } else {
        res.status(500).json({ error: 'Ürün güncellenemedi' });
    }
});

// Ürün sil
router.delete('/:id', verifyToken, isAdmin, (req, res) => {
    const data = readJSON('urunler.json');
    if (!data) {
        return res.status(500).json({ error: 'Ürünler okunamadı' });
    }
    
    const index = data.urunler.findIndex(u => u.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Görselleri sil (opsiyonel)
    const urun = data.urunler[index];
    if (urun.gorseller) {
        urun.gorseller.forEach(gorsel => {
            const gorselPath = path.join(__dirname, '..', gorsel);
            if (fs.existsSync(gorselPath)) {
                fs.unlinkSync(gorselPath);
            }
        });
    }
    
    data.urunler.splice(index, 1);
    
    if (writeJSON('urunler.json', data)) {
        res.json({ message: 'Ürün başarıyla silindi' });
    } else {
        res.status(500).json({ error: 'Ürün silinemedi' });
    }
});

// Stok güncelle
router.patch('/:id/stok', verifyToken, isAdmin, (req, res) => {
    const { stok } = req.body;
    const data = readJSON('urunler.json');
    
    if (!data) {
        return res.status(500).json({ error: 'Ürünler okunamadı' });
    }
    
    const urun = data.urunler.find(u => u.id == req.params.id);
    if (!urun) {
        return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    urun.stok = parseInt(stok);
    urun.stok_guncelleme = new Date().toISOString();
    
    if (writeJSON('urunler.json', data)) {
        res.json({ 
            message: 'Stok başarıyla güncellendi',
            stok: urun.stok
        });
    } else {
        res.status(500).json({ error: 'Stok güncellenemedi' });
    }
});

module.exports = router;
