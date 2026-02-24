const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedExt = /jpeg|jpg|png|pdf|doc|docx/;
        const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());
        if (ext) cb(null, true);
        else cb(new Error('Tipe file tidak didukung. Gunakan JPG, PNG, PDF, DOC, atau DOCX.'));
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// Initialize database
const db = require('./db');

// ===================== API ROUTES =====================

// Submit application
app.post('/api/applications', upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'ktp_file', maxCount: 1 },
    { name: 'cv_file', maxCount: 1 }
]), (req, res) => {
    try {
        const data = req.body;
        const files = req.files || {};

        const record = {
            nama_lengkap: data.nama_lengkap || '',
            tempat_lahir: data.tempat_lahir || '',
            tanggal_lahir: data.tanggal_lahir || '',
            usia: data.usia || '',
            jenis_kelamin: data.jenis_kelamin || '',
            agama: data.agama || '',
            status_pernikahan: data.status_pernikahan || '',
            jumlah_anak: data.jumlah_anak || '',
            nik: data.nik || '',
            tinggi_badan: data.tinggi_badan || '',
            berat_badan: data.berat_badan || '',
            alamat_ktp: data.alamat_ktp || '',
            alamat_domisili: data.alamat_domisili || '',
            no_hp: data.no_hp || '',
            email: data.email || '',
            pendidikan: data.pendidikan || '[]',
            pengalaman: data.pengalaman || '[]',
            posisi_dilamar: data.posisi_dilamar || '',
            gaji_diharapkan: data.gaji_diharapkan || '',
            tanggal_mulai: data.tanggal_mulai || '',
            foto: files.foto ? files.foto[0].filename : '',
            ktp_file: files.ktp_file ? files.ktp_file[0].filename : '',
            cv_file: files.cv_file ? files.cv_file[0].filename : '',
            persetujuan: data.persetujuan === 'true' || data.persetujuan === '1' ? 1 : 0
        };

        const result = db.insert(record);

        res.json({
            success: true,
            message: 'Formulir berhasil dikirim!',
            id: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'
        });
    }
});

// Get all applications (admin)
app.get('/api/applications', (req, res) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        const result = db.getAll({ search, status, page: parseInt(page), limit: parseInt(limit) });

        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
    }
});

// Get single application
app.get('/api/applications/:id', (req, res) => {
    try {
        const application = db.getById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
        }
        res.json({ success: true, data: application });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
    }
});

// Update application status
app.patch('/api/applications/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['baru', 'review', 'interview', 'diterima', 'ditolak'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid.' });
        }

        const updated = db.updateStatus(req.params.id, status);
        if (updated) {
            res.json({ success: true, message: 'Status berhasil diperbarui.' });
        } else {
            res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status.' });
    }
});

// Delete application
app.delete('/api/applications/:id', (req, res) => {
    try {
        const deleted = db.delete(req.params.id);
        if (deleted) {
            // Delete associated files
            [deleted.foto, deleted.ktp_file, deleted.cv_file].forEach(filename => {
                if (filename) {
                    const filepath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                }
            });
            res.json({ success: true, message: 'Data berhasil dihapus.' });
        } else {
            res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data.' });
    }
});

// Export to CSV
app.get('/api/export/csv', (req, res) => {
    try {
        const applications = db.getAllForExport();

        const headers = [
            'ID', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir', 'Usia', 'Jenis Kelamin',
            'Agama', 'Status Pernikahan', 'Jumlah Anak', 'NIK',
            'Tinggi Badan', 'Berat Badan', 'Alamat KTP', 'Alamat Domisili',
            'No HP', 'Email',
            'Posisi Dilamar', 'Gaji Diharapkan', 'Tanggal Mulai',
            'Status', 'Tanggal Daftar'
        ];

        let csv = '\uFEFF' + headers.join(',') + '\n'; // BOM for Excel UTF-8

        applications.forEach(app => {
            const row = [
                app.id,
                `"${(app.nama_lengkap || '').replace(/"/g, '""')}"`,
                `"${(app.tempat_lahir || '').replace(/"/g, '""')}"`,
                app.tanggal_lahir || '',
                `"${(app.usia || '').replace(/"/g, '""')}"`,
                app.jenis_kelamin || '',
                app.agama || '',
                app.status_pernikahan || '',
                app.jumlah_anak || '',
                app.nik || '',
                app.tinggi_badan || '',
                app.berat_badan || '',
                `"${(app.alamat_ktp || '').replace(/"/g, '""')}"`,
                `"${(app.alamat_domisili || '').replace(/"/g, '""')}"`,
                app.no_hp || '',
                app.email || '',
                `"${(app.posisi_dilamar || '').replace(/"/g, '""')}"`,
                app.gaji_diharapkan || '',
                app.tanggal_mulai || '',
                app.status || '',
                app.created_at || ''
            ];
            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=data-pelamar.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ success: false, message: 'Gagal mengekspor data.' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📋 Form Publik: http://localhost:${PORT}`);
    console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin.html\n`);
});
