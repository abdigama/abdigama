// ===================== State =====================
let allApplications = [];
let currentPage = 1;
let currentDetailId = null;
let searchTimeout = null;

// ===================== Initialization =====================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// ===================== Navigation =====================
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (section === 'dashboard') {
        document.getElementById('sectionDashboard').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Dashboard';
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else {
        document.getElementById('sectionTable').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Data Pelamar';
        document.querySelectorAll('.nav-item')[1].classList.add('active');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

// Close sidebar on clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    if (window.innerWidth <= 768 && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// ===================== Data Loading =====================
async function loadData() {
    try {
        const search = document.getElementById('searchInput')?.value || '';
        const status = document.getElementById('statusFilter')?.value || 'semua';

        const params = new URLSearchParams({
            search,
            status,
            page: currentPage,
            limit: 20
        });

        const response = await fetch(`/api/applications?${params}`);
        const result = await response.json();

        if (result.success) {
            allApplications = result.data;
            updateStats(result.data, result.pagination.total);
            renderRecentTable(result.data.slice(0, 5));
            renderFullTable(result.data, result.pagination);
            renderPagination(result.pagination);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateStats(data, total) {
    // We need total counts per status, so fetch all if needed
    fetchStats();
}

async function fetchStats() {
    try {
        const res = await fetch('/api/applications?limit=1000');
        const result = await res.json();
        if (result.success) {
            const data = result.data;
            document.getElementById('statTotal').textContent = data.length;
            document.getElementById('statBaru').textContent = data.filter(d => d.status === 'baru').length;
            document.getElementById('statReview').textContent = data.filter(d => d.status === 'review').length;
            document.getElementById('statDiterima').textContent = data.filter(d => d.status === 'diterima').length;
        }
    } catch (e) { }
}

// ===================== Table Rendering =====================
function renderRecentTable(data) {
    const tbody = document.getElementById('recentTableBody');

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Belum ada data pelamar</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((app, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong style="color:var(--text-primary)">${escHtml(app.nama_lengkap)}</strong></td>
      <td>${escHtml(app.posisi_dilamar || '-')}</td>
      <td>${escHtml(app.email || '-')}</td>
      <td><span class="status-badge status-${app.status}">${app.status}</span></td>
      <td>${formatDate(app.created_at)}</td>
      <td><button class="btn-action" onclick="viewDetail(${app.id})">Detail</button></td>
    </tr>
  `).join('');
}

function renderFullTable(data, pagination) {
    const tbody = document.getElementById('fullTableBody');

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Tidak ada data yang ditemukan</td></tr>';
        return;
    }

    const startIdx = (pagination.page - 1) * pagination.limit;

    tbody.innerHTML = data.map((app, i) => `
    <tr>
      <td>${startIdx + i + 1}</td>
      <td><strong style="color:var(--text-primary)">${escHtml(app.nama_lengkap)}</strong></td>
      <td>${escHtml(app.posisi_dilamar || '-')}</td>
      <td>${escHtml(app.no_hp || '-')}</td>
      <td>${escHtml(app.email || '-')}</td>
      <td><span class="status-badge status-${app.status}">${app.status}</span></td>
      <td>${formatDate(app.created_at)}</td>
      <td>
        <button class="btn-action" onclick="viewDetail(${app.id})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Detail
        </button>
      </td>
    </tr>
  `).join('');
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="page-btn" onclick="goToPage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>← Prev</button>`;

    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 2) {
            html += `<button class="page-btn ${i === pagination.page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (Math.abs(i - pagination.page) === 3) {
            html += `<span class="page-info">...</span>`;
        }
    }

    html += `<button class="page-btn" onclick="goToPage(${pagination.page + 1})" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next →</button>`;

    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadData();
}

// ===================== Search =====================
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        loadData();
    }, 400);
}

// ===================== Detail Modal =====================
async function viewDetail(id) {
    try {
        const response = await fetch(`/api/applications/${id}`);
        const result = await response.json();

        if (!result.success) {
            alert('Data tidak ditemukan.');
            return;
        }

        const app = result.data;
        currentDetailId = id;

        // Set status select
        document.getElementById('detailStatusSelect').value = app.status || 'baru';

        let pendidikan = [];
        let pengalaman = [];
        try { pendidikan = JSON.parse(app.pendidikan || '[]'); } catch (e) { }
        try { pengalaman = JSON.parse(app.pengalaman || '[]'); } catch (e) { }

        let html = `
      <div class="detail-section">
        <h3>Data Pribadi</h3>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">Nama Lengkap</span><span class="detail-value">${escHtml(app.nama_lengkap)}</span></div>
          <div class="detail-item"><span class="detail-label">NIK</span><span class="detail-value">${escHtml(app.nik || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Tempat & Tanggal Lahir</span><span class="detail-value">${escHtml(app.tempat_lahir || '-')}, ${formatDate(app.tanggal_lahir)}</span></div>
          <div class="detail-item"><span class="detail-label">Usia</span><span class="detail-value">${escHtml(app.usia || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Jenis Kelamin</span><span class="detail-value">${escHtml(app.jenis_kelamin || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Agama</span><span class="detail-value">${escHtml(app.agama || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Status Pernikahan</span><span class="detail-value">${escHtml(app.status_pernikahan || '-')}</span></div>
          ${app.jumlah_anak ? `<div class="detail-item"><span class="detail-label">Jumlah Anak</span><span class="detail-value">${escHtml(app.jumlah_anak)}</span></div>` : ''}
          <div class="detail-item"><span class="detail-label">Tinggi Badan</span><span class="detail-value">${app.tinggi_badan ? escHtml(app.tinggi_badan) + ' cm' : '-'}</span></div>
          <div class="detail-item"><span class="detail-label">Berat Badan</span><span class="detail-value">${app.berat_badan ? escHtml(app.berat_badan) + ' kg' : '-'}</span></div>
          <div class="detail-item full"><span class="detail-label">Alamat Sesuai KTP</span><span class="detail-value">${escHtml(app.alamat_ktp || '-')}</span></div>
          <div class="detail-item full"><span class="detail-label">Alamat Domisili</span><span class="detail-value">${escHtml(app.alamat_domisili || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">No HP</span><span class="detail-value">${escHtml(app.no_hp || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">${escHtml(app.email || '-')}</span></div>
        </div>
      </div>
    `;

        if (pendidikan.length > 0) {
            html += `<div class="detail-section"><h3>Riwayat Pendidikan</h3>`;
            pendidikan.forEach((p, i) => {
                html += `
          <div class="detail-grid" style="margin-bottom:12px; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Jenjang</span><span class="detail-value">${escHtml(p.jenjang || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Institusi</span><span class="detail-value">${escHtml(p.institusi || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Jurusan</span><span class="detail-value">${escHtml(p.jurusan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Tahun Lulus</span><span class="detail-value">${escHtml(p.tahun || '-')}</span></div>
          </div>
        `;
            });
            html += `</div>`;
        }

        if (pengalaman.length > 0) {
            html += `<div class="detail-section"><h3>Pengalaman Kerja</h3>`;
            pengalaman.forEach((p, i) => {
                html += `
          <div class="detail-grid" style="margin-bottom:12px; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Perusahaan</span><span class="detail-value">${escHtml(p.perusahaan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Jabatan</span><span class="detail-value">${escHtml(p.jabatan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Periode</span><span class="detail-value">${escHtml(p.mulai || '?')} — ${escHtml(p.selesai || '?')}</span></div>
            <div class="detail-item"><span class="detail-label">Alasan Keluar</span><span class="detail-value">${escHtml(p.alasan || '-')}</span></div>
          </div>
        `;
            });
            html += `</div>`;
        }

        html += `
      <div class="detail-section">
        <h3>Posisi & Dokumen</h3>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">Posisi Dilamar</span><span class="detail-value">${escHtml(app.posisi_dilamar || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Gaji Diharapkan</span><span class="detail-value">${escHtml(app.gaji_diharapkan || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Tanggal Bisa Mulai</span><span class="detail-value">${formatDate(app.tanggal_mulai)}</span></div>
          <div class="detail-item"><span class="detail-label">Tanggal Daftar</span><span class="detail-value">${formatDate(app.created_at)}</span></div>
        </div>
    `;

        // File links
        const files = [];
        if (app.foto) files.push({ label: 'Pas Foto', file: app.foto });
        if (app.ktp_file) files.push({ label: 'Scan KTP', file: app.ktp_file });
        if (app.cv_file) files.push({ label: 'CV / Resume', file: app.cv_file });

        if (files.length > 0) {
            html += `<div class="detail-grid" style="margin-top:16px;">`;
            files.forEach(f => {
                html += `
          <div class="detail-item">
            <span class="detail-label">${f.label}</span>
            <span class="detail-value"><a href="/uploads/${f.file}" target="_blank">📎 Download File</a></span>
          </div>
        `;
            });
            html += `</div>`;
        }

        html += `</div>`;

        document.getElementById('detailBody').innerHTML = html;
        document.getElementById('detailModal').classList.add('active');
    } catch (error) {
        console.error('Error loading detail:', error);
        alert('Gagal memuat detail pelamar.');
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
    currentDetailId = null;
}

// Close modal on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailModal();
});

// Close modal on overlay click
document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) closeDetailModal();
});

// ===================== Status Update =====================
async function updateStatusFromModal() {
    if (!currentDetailId) return;
    const status = document.getElementById('detailStatusSelect').value;

    try {
        const response = await fetch(`/api/applications/${currentDetailId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        if (result.success) {
            loadData(); // Refresh data
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Gagal memperbarui status.');
    }
}

// ===================== Delete =====================
async function deleteFromModal() {
    if (!currentDetailId) return;
    if (!confirm('Apakah Anda yakin ingin menghapus data pelamar ini?')) return;

    try {
        const response = await fetch(`/api/applications/${currentDetailId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            closeDetailModal();
            loadData();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error deleting:', error);
        alert('Gagal menghapus data.');
    }
}

// ===================== Export =====================
function exportCSV() {
    window.location.href = '/api/export/csv';
}

// ===================== Helpers =====================
function escHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}
