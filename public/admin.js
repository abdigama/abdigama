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
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }

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
    if (res.status === 401) return; // Silent fail, loadData will handle redirect

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
      <td>${escHtml(app.app_id || '-')}</td>
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
      <td>${escHtml(app.app_id || '-')}</td>
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
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }

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
    let keluarga = [];
    try { pendidikan = JSON.parse(app.pendidikan || '[]'); } catch (e) { }
    try { pengalaman = JSON.parse(app.pengalaman || '[]'); } catch (e) { }
    try { keluarga = JSON.parse(app.keluarga || '[]'); } catch (e) { }

    let html = `
      <div class="detail-section">
        <h3>Data Pribadi</h3>
        <p style="color:var(--text-secondary); margin-bottom:16px;"><strong>ID Lamaran:</strong> ${escHtml(app.app_id || '-')}</p>
        <div class="detail-grid">
          <div class="detail-item"><span class="detail-label">Nama Lengkap</span><span class="detail-value">${escHtml(app.nama_lengkap)}</span></div>
          <div class="detail-item"><span class="detail-label">NIK</span><span class="detail-value">${escHtml(app.nik || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Tempat & Tanggal Lahir</span><span class="detail-value">${escHtml(app.tempat_lahir || '-')}, ${formatDate(app.tanggal_lahir)}</span></div>
          <div class="detail-item"><span class="detail-label">Usia</span><span class="detail-value">${escHtml(app.usia || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Jenis Kelamin</span><span class="detail-value">${escHtml(app.jenis_kelamin || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Agama</span><span class="detail-value">${escHtml(app.agama || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Status Pernikahan</span><span class="detail-value">${escHtml(app.status_pernikahan || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Kewarganegaraan</span><span class="detail-value">${escHtml(app.kewarganegaraan || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Keturunan</span><span class="detail-value">${escHtml(app.keturunan || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">NPWP</span><span class="detail-value">${escHtml(app.npwp || '-')}</span></div>
          ${app.jumlah_anak ? `<div class="detail-item"><span class="detail-label">Jumlah Anak</span><span class="detail-value">${escHtml(app.jumlah_anak)}</span></div>` : ''}
          <div class="detail-item"><span class="detail-label">Tinggi Badan</span><span class="detail-value">${app.tinggi_badan ? escHtml(app.tinggi_badan) + ' cm' : '-'}</span></div>
          <div class="detail-item"><span class="detail-label">Berat Badan</span><span class="detail-value">${app.berat_badan ? escHtml(app.berat_badan) + ' kg' : '-'}</span></div>
          <div class="detail-item full"><span class="detail-label">Alamat Sesuai KTP</span><span class="detail-value">${escHtml(app.alamat_ktp || '-')}</span></div>
          <div class="detail-item full"><span class="detail-label">Alamat Domisili</span><span class="detail-value">${escHtml(app.alamat_domisili || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Tempat Tinggal</span><span class="detail-value">${escHtml(app.tempat_tinggal || '-')}</span></div>
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
            <div class="detail-item"><span class="detail-label">Institusi</span><span class="detail-value">${escHtml(p.sekolah || p.institusi || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Periode</span><span class="detail-value">${escHtml(p.dari || '-')} - ${escHtml(p.ke || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Jurusan</span><span class="detail-value">${escHtml(p.jurusan || p.kualifikasi || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Gelar</span><span class="detail-value">${escHtml(p.gelar || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">IPK</span><span class="detail-value">${escHtml(p.ipk || '-')}</span></div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `
        <div class="detail-section">
          <h3>Keterampilan Lainnya</h3>
          <div class="detail-grid">
            <div class="detail-item full"><span class="detail-label">Aplikasi Komputer</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.komputer || '-')}</span></div>
            <div class="detail-item full"><span class="detail-label">Kemampuan Lainnya</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.kemampuan_lain || '-')}</span></div>
            
            <div class="detail-item full" style="margin-top:12px;">
              <span class="detail-label">Kemahiran dalam Bahasa</span>
              <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; margin-top:8px;">
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:var(--text-light); font-size:0.85rem;">
                      <th style="padding-bottom:8px;">Bahasa</th>
                      <th style="padding-bottom:8px;">Berbicara</th>
                      <th style="padding-bottom:8px;">Menulis</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${JSON.parse(app.bahasa || '[]').length > 0 ?
        JSON.parse(app.bahasa || '[]').map(b => `
                      <tr style="border-bottom:1px dashed rgba(255,255,255,0.05); font-size:0.9rem;">
                        <td style="padding:6px 0; color:#fff;">${escHtml(b.nama || '-')}</td>
                        <td style="padding:6px 0; color:#fff;">${escHtml(b.bicara || '-')}</td>
                        <td style="padding:6px 0; color:#fff;">${escHtml(b.nulis || '-')}</td>
                      </tr>
                      `).join('')
        : `<tr><td colspan="3" style="padding:6px 0; color:var(--text-light);">Tidak ada data bahasa</td></tr>`
      }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="detail-item full"><span class="detail-label">Hobby</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.hobby || '-')}</span></div>
            <div class="detail-item full"><span class="detail-label">Kelompok & Kegiatan Sosial</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.kegiatan_sosial || '-')}</span></div>
          </div>
        </div>
        `;

    if (pengalaman.length > 0) {
      html += `<div class="detail-section"><h3>Pengalaman Kerja</h3>`;
      pengalaman.forEach((p, i) => {
        html += `
          <div style="margin-bottom:12px; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <h4 style="font-size:0.9rem; color:var(--text-light); margin-bottom:12px;">Pengalaman #${i + 1}</h4>
            <div class="detail-grid">
              <div class="detail-item full"><span class="detail-label">Perusahaan</span><span class="detail-value">${escHtml(p.perusahaan || '-')}</span></div>
              <div class="detail-item"><span class="detail-label">Posisi / Jabatan</span><span class="detail-value">${escHtml(p.jabatan || '-')}</span></div>
              <div class="detail-item"><span class="detail-label">Periode</span><span class="detail-value">${escHtml(p.mulai || '?')} — ${escHtml(p.selesai || '?')}</span></div>
              <div class="detail-item full"><span class="detail-label">Alamat</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(p.alamat || '-')}</span></div>
              <div class="detail-item"><span class="detail-label">Telepon</span><span class="detail-value">${escHtml(p.telp || '-')}</span></div>
              <div class="detail-item full"><span class="detail-label">Kesimpulan Tugas dan Tanggung Jawab</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(p.tugas || '-')}</span></div>
              <div class="detail-item"><span class="detail-label">Gaji Dimulai</span><span class="detail-value">${escHtml(p.gaji_mulai || '-')}</span></div>
              <div class="detail-item"><span class="detail-label">Gaji Terakhir</span><span class="detail-value">${escHtml(p.gaji_akhir || '-')}</span></div>
              <div class="detail-item full"><span class="detail-label">Alasan Keluar</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(p.alasan || '-')}</span></div>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (app.pencapaian) {
      html += `
          <div class="detail-section">
            <h3>Pencapaian & Prestasi</h3>
            <div class="detail-grid">
              <div class="detail-item full"><span class="detail-label">Detail Pencapaian</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.pencapaian || '-')}</span></div>
            </div>
          </div>
          `;
    }

    html += `
      <div class="detail-section">
        <h3>Keluarga & Referensi</h3>

        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.9rem; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Data Pasangan</h4>
          <div class="detail-grid" style="padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Nama</span><span class="detail-value">${escHtml(app.pasangan_nama || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Pekerjaan</span><span class="detail-value">${escHtml(app.pasangan_pekerjaan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Perusahaan</span><span class="detail-value">${escHtml(app.pasangan_perusahaan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Telepon</span><span class="detail-value">${escHtml(app.pasangan_telp || '-')}</span></div>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.9rem; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Kontak Darurat</h4>
          <div class="detail-grid" style="padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Nama</span><span class="detail-value">${escHtml(app.darurat_nama || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Hubungan</span><span class="detail-value">${escHtml(app.darurat_hubungan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Telepon Rumah</span><span class="detail-value">${escHtml(app.darurat_telp_rumah || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Telepon Kantor</span><span class="detail-value">${escHtml(app.darurat_telp_kantor || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Nomor HP</span><span class="detail-value">${escHtml(app.darurat_hp || '-')}</span></div>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.9rem; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Referensi 1</h4>
          <div class="detail-grid" style="padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Nama</span><span class="detail-value">${escHtml(app.ref1_nama || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Telepon</span><span class="detail-value">${escHtml(app.ref1_tel || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Jabatan</span><span class="detail-value">${escHtml(app.ref1_jabatan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Nama & Alamat Karyawan</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.ref1_alamat || '-')}</span></div>
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <h4 style="font-size:0.9rem; color:var(--text-light); text-transform:uppercase; margin-bottom:8px;">Referensi 2</h4>
          <div class="detail-grid" style="padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Nama</span><span class="detail-value">${escHtml(app.ref2_nama || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Telepon</span><span class="detail-value">${escHtml(app.ref2_tel || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Jabatan</span><span class="detail-value">${escHtml(app.ref2_jabatan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Nama & Alamat Karyawan</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.ref2_alamat || '-')}</span></div>
          </div>
        </div>
      </div>
    `;

    if (keluarga.length > 0) {
      html += `<div class="detail-section"><h3>Data Keluarga</h3>`;
      keluarga.forEach((k, i) => {
        html += `
          <div class="detail-grid" style="margin-bottom:12px; padding:12px; background:rgba(255,255,255,0.02); border-radius:8px;">
            <div class="detail-item"><span class="detail-label">Nama</span><span class="detail-value">${escHtml(k.nama || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Hubungan</span><span class="detail-value">${escHtml(k.hubungan || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Usia</span><span class="detail-value">${escHtml(k.usia || '-')}</span></div>
            <div class="detail-item"><span class="detail-label">Pekerjaan</span><span class="detail-value">${escHtml(k.pekerjaan || '-')}</span></div>
            <div class="detail-item full"><span class="detail-label">Dibawah Dukungan Anda?</span><span class="detail-value">${escHtml(k.dukungan || 'Tidak')}</span></div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `
      <div class="detail-section">
        <h3>Informasi Tambahan</h3>
        <div class="detail-grid">
          <div class="detail-item full"><span class="detail-label">Benefit / Posisi Lain</span><span class="detail-value" style="white-space:pre-wrap;">${escHtml(app.info_posisi || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Cacat Fisik</span><span class="detail-value">${escHtml(app.info_cacat || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Sedang Hamil</span><span class="detail-value">${escHtml(app.info_hamil || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Bangkrut/Pailit</span><span class="detail-value">${escHtml(app.info_pailit || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Kerabat di PT</span><span class="detail-value">${escHtml(app.info_kerabat || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Riwayat Pidana</span><span class="detail-value">${escHtml(app.info_pidana || '-')}</span></div>
          <div class="detail-item"><span class="detail-label">Memiliki SIM</span><span class="detail-value">${escHtml(app.info_sim || '-')}</span></div>
        </div>
      </div>
    `;

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

function editFromModal() {
  if (currentDetailId) {
    window.location.href = `/edit.html?id=${currentDetailId}`;
  }
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

    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }

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

    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }

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

// ===================== API & Export =====================
function exportCSV() {
  window.location.href = '/api/export/csv';
}

async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  } catch (e) {
    window.location.href = '/login.html';
  }
}

async function printPDF() {
  if (!currentDetailId) return;

  try {
    const response = await fetch(`/api/applications/${currentDetailId}`);
    const result = await response.json();
    if (!result.success) {
      alert('Gagal mengambil data untuk PDF');
      return;
    }
    const app = result.data;

    // Helper to format date safely
    const formatDateObj = (dateStr) => {
      if (!dateStr || dateStr === '-') return '';
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : dateStr;
    };

    const parseArray = (field) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try { return JSON.parse(field); } catch { return []; }
      }
      return Array.isArray(field) ? field : [];
    };

    const pend = parseArray(app.pendidikan);
    const peng = parseArray(app.pengalaman);
    const kel = parseArray(app.keluarga);
    const bhs = parseArray(app.bahasa);

    const fotoHtml = app.foto ? `<img src="/uploads/${app.foto}" style="max-width:100%; max-height:100%; object-fit:cover;" />` : `<div style="padding-top:40px; color:#999; text-align:center;">PAS FOTO</div>`;

    const htmlContent = `
      <div id="printContainer" class="pure-html-print">
        
        <!-- PAGE 1 -->
        <div class="pdf-page" style="padding:10px;">
          <!-- HEADER -->
          <div class="print-header-top" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 5px;">
            <div style="flex:1;">
              <div style="font-weight:bold; font-size:10px; font-style:italic; text-align:left;">PRIBADI & RAHASIA</div>
              <div style="display:flex; align-items:center; gap: 15px; margin-top:5px;">
                <img src="/images/weha_agro_logo_f.png" style="width: 70px; height: auto;" />
                <div style="text-align:center; flex:1;">
                  <h1 style="color:#206e4a; margin:0; font-size: 20px; font-weight:800; font-family: Arial, sans-serif;">PT. WEHA AGRO SEJAHTERA</h1>
                  <div style="font-weight:bold; font-size:11px; margin-top:15px;">FORMULIR APLIKASI CALON KARYAWAN BARU (F-PAKB)</div>
                </div>
              </div>
            </div>
            <div style="width: 90px; height: 110px; border: 1px solid #000; position:relative; margin-left:15px; flex-shrink:0;">
              <div style="position:absolute; inset:3px; border:1px solid #000;"></div>
              <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:4px;">
                ${app.foto ? `<img src="/uploads/${app.foto}" style="max-width:100%; max-height:100%; object-fit:cover;" />` : `<span style="font-weight:bold; font-size:10px;">PAS PHOTO</span>`}
              </div>
            </div>
          </div>

          <!-- TABLE DATA PRIBADI -->
          <table class="form-table" style="margin-top:0; border: 2px solid #000;">
            <!-- POSISI -->
            <tr>
               <td colspan="6" style="padding:4px; font-size:9px;">
                  <div style="display:flex; align-items:center;">
                     <div style="display:flex; flex-direction:column; width:200px;">
                        <div style="font-weight:bold;">POSISI YANG DIBUTUHKAN</div>
                        <div style="font-style:italic;">(Permohonan untuk Jabatan)</div>
                     </div>
                     <div class="val" style="font-size:16px; font-weight:bold; font-style:italic; flex:1; text-align:center;">${app.posisi_dilamar || ''}</div>
                  </div>
               </td>
            </tr>

            <!-- HEADER DATA PRIBADI -->
            <tr>
              <td colspan="6" style="background-color:#ccffff; text-align:center; font-weight:bold; font-size:10px; padding:4px; border-top:2px solid #000;">DATA PRIBADI</td>
            </tr>

            <!-- NAMA LENGKAP & NOMOR KTP -->
            <tr>
              <td colspan="3" style="width:50%; vertical-align:top; border-right:1px solid #000;">
                <div style="font-size:9px;">NAMA LENGKAP :</div>
                <div class="val" style="margin-top:2px; margin-bottom:2px;">${app.nama_lengkap || ''}</div>
              </td>
              <td colspan="3" style="width:50%; vertical-align:top;">
                <div style="font-size:9px;">NOMOR KTP :</div>
                <div class="val" style="margin-top:2px; margin-bottom:2px;">${app.nik || ''}</div>
              </td>
            </tr>

            <!-- ALAMAT -->
            <tr>
              <td colspan="3" style="vertical-align:top; border-right:1px solid #000; height:60px; position:relative; padding-bottom: 20px;">
                <div style="font-size:9px;">ALAMAT TETAP (Sesuai KTP) :</div>
                <div class="val" style="margin-top:2px;">${app.alamat_ktp || ''}</div>
                <div style="position:absolute; bottom:4px; left:4px; display:flex; align-items:center; gap:5px; width:calc(100% - 8px);">
                  <span style="font-size:9px;">TEL. NO:</span>
                  <span class="val" style="flex:1;">${app.darurat_telp_rumah || app.no_hp || ''}</span>
                </div>
              </td>
              <td colspan="3" style="vertical-align:top; height:60px; position:relative; padding-bottom: 20px;">
                <div style="font-size:9px;">ALAMAT TEMPAT TINGGAL (Apabila tidak sesuai dengan alamat KTP) :</div>
                <div class="val" style="margin-top:2px;">${app.alamat_domisili || ''}</div>
                <div style="position:absolute; bottom:4px; left:4px; display:flex; align-items:center; gap:5px; width:calc(100% - 8px);">
                  <span style="font-size:9px;">TEL. NO:</span>
                  <span class="val" style="flex:1;">${app.no_hp || ''}</span>
                </div>
              </td>
            </tr>

            <!-- BIOMETRICS -->
            <tr>
              <td style="width:16.66%; vertical-align:top; position:relative;">
                <div style="font-size:9px;">JENIS KELAMIN :</div>
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; font-size:9px; padding-left:10px;">
                  <div>${app.jenis_kelamin === 'Laki-laki' ? '<b>☑ Laki-Laki</b>' : '☐ Laki-Laki'}</div>
                  <div>${app.jenis_kelamin === 'Perempuan' ? '<b>☑ Perempuan</b>' : '☐ Perempuan'}</div>
                </div>
              </td>
              <td style="width:16.66%; vertical-align:top;">
                <div style="font-size:9px;">BERAT BADAN :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${app.berat_badan ? app.berat_badan + ' kg' : ''}</div>
              </td>
              <td style="width:16.66%; vertical-align:top;">
                <div style="font-size:9px;">TINGGI BADAN :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${app.tinggi_badan ? app.tinggi_badan + ' cm' : ''}</div>
              </td>
              <td style="width:16.66%; vertical-align:top;">
                <div style="font-size:9px;">TEMPAT LAHIR :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${app.tempat_lahir || ''}</div>
              </td>
              <td style="width:16.66%; vertical-align:top;">
                <div style="font-size:9px;">TANGGAL LAHIR :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${formatDateObj(app.tanggal_lahir)}</div>
              </td>
              <td style="width:16.66%; vertical-align:top;">
                <div style="font-size:9px;">USIA :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${app.usia ? app.usia + ' thn' : ''}</div>
              </td>
            </tr>

            <!-- KEWARGANEGARAAN & PERNIKAHAN -->
            <tr>
              <td colspan="1" style="vertical-align:top; border-bottom:none;">
                <div style="font-size:9px;">KEWARGANEGARAAN :</div>
                <div class="val" style="margin-top:6px; text-align:center;">${app.kewarganegaraan || ''}</div>
              </td>
              <td colspan="4" style="vertical-align:top;">
                <div style="font-size:9px;">STATUS PERNIKAHAN :</div>
                <div style="display:flex; justify-content:space-around; align-items:center; margin-top:8px; font-size:9px; padding:0 10px;">
                  <div>${app.status_pernikahan === 'Belum Menikah' ? '<b>☑ Belum Menikah</b>' : '☐ Belum Menikah'}</div>
                  <div>${app.status_pernikahan === 'Menikah' ? '<b>☑ Menikah</b>' : '☐ Menikah'}</div>
                  <div>${app.status_pernikahan === 'Cerai' ? '<b>☑ Cerai</b>' : '☐ Cerai'}</div>
                </div>
              </td>
              <td colspan="1" style="vertical-align:top;">
                <div style="font-size:9px;">JUMLAH ANAK :</div>
                <div class="val" style="margin-top:8px; text-align:center;">${app.jumlah_anak || ''}</div>
              </td>
            </tr>

            <!-- AGAMA -->
            <tr>
              <td style="vertical-align:top; border-right:1px solid #000; border-top:none;">
                <div style="font-size:9px;">AGAMA :</div>
                <div class="val" style="margin-top:6px; text-align:center;">${app.agama || ''}</div>
              </td>
              <td style="vertical-align:top; border-right:1px solid #000; border-top:none;">
                <div style="font-size:9px;">KETURUNAN :</div>
                <div class="val" style="margin-top:6px; text-align:center;">${app.keturunan || ''}</div>
              </td>
              <td colspan="4" style="border-top:none; vertical-align:top;">
                <div style="font-size:9px;">NPWP :</div>
                <div class="val" style="margin-top:6px; text-align:left;">${app.npwp || ''}</div>
              </td>
            </tr>

            <!-- CACAT -->
            <tr>
              <td colspan="2" style="vertical-align:top; border-right:1px solid #000; height:45px;">
                <div style="font-size:9px;">Apakah anda memiliki cacat fisik ?</div>
                <div style="display:flex; justify-content:space-around; margin-top:8px; font-size:9px;">
                  <div>${app.info_cacat === 'Ya' ? '<b>☑ Ya</b>' : '☐ Ya'}</div>
                  <div>${app.info_cacat === 'Tidak' ? '<b>☑ Tidak</b>' : '☐ Tidak'}</div>
                </div>
              </td>
              <td colspan="4" style="vertical-align:top;">
                <div style="font-size:9px;">Jika iya, mohon dijelaskan :</div>
                <div class="val" style="margin-top:4px;">${app.cacat_info || ''}</div>
              </td>
            </tr>

            <!-- HAMIL -->
            <tr>
              <td colspan="3" style="vertical-align:top;">
                <div style="font-size:9px;">Silahkan dijelaskan apabila Anda hamil atau</div>
                <div style="font-size:9px; margin-top:1px;">menduga bahwa sedang hamil :</div>
                <div style="display:flex; flex-direction:column; align-items:center; gap:2px; margin-top:6px; font-size:9px;">
                  <div>${app.info_hamil === 'Ya' ? '<b>☑ Ya</b>' : '☐ Ya'}</div>
                  <div>${app.info_hamil === 'Tidak' ? '<b>☑ Tidak</b>' : '☐ Tidak'}</div>
                </div>
                <div class="val" style="margin-top:4px; text-align:center;">${app.hamil_info || ''}</div>
              </td>
              <td colspan="3" style="vertical-align:top;">
                <div style="display:flex;">
                  <div style="font-size:9px; width:70px;">Tempat Tinggal</div>
                  <div style="display:flex; flex-direction:column; gap:4px; font-size:9px; flex:1;">
                    <div>${app.tempat_tinggal === 'Sewa' ? '<b>☑ Sewa</b>' : '☐ Sewa'}</div>
                    <div>${app.tempat_tinggal === 'Bersama Orang Tua / Kerabat' ? '<b>☑ Bersama Orang Tua / Kerabat</b>' : '☐ Bersama Orang Tua / Kerabat'}</div>
                    <div>${app.tempat_tinggal === 'Milik Sendiri' ? '<b>☑ Milik Sendiri</b>' : '☐ Milik Sendiri'}</div>
                    <div>${app.tempat_tinggal === 'Mortage' ? '<b>☑ Mortage</b>' : '☐ Mortage'}</div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- PASANGAN 1 -->
            <tr>
              <td colspan="3" style="vertical-align:top;">
                <div style="font-size:9px;">NAMA PASANGAN (SUAMI/ISTRI) :</div>
                <div class="val" style="margin-top:2px;">${app.pasangan_nama || ''}</div>
              </td>
              <td colspan="3" style="vertical-align:top;">
                <div style="font-size:9px;">NAMA KELUARGA/KERABAT DEKAT YANG BISA DIHUBUNGI :</div>
                <div class="val" style="margin-top:2px;">${app.darurat_nama || ''}</div>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="vertical-align:top;">
                <div style="font-size:9px;">PEKERJAAN :</div>
                <div class="val" style="margin-top:2px;">${app.pasangan_pekerjaan || ''}</div>
              </td>
              <td colspan="3" style="vertical-align:top;">
                <div style="font-size:9px;">HUBUNGAN :</div>
                <div class="val" style="margin-top:2px;">${app.darurat_hubungan || ''}</div>
              </td>
            </tr>
            
            <tr>
              <td colspan="3" rowspan="4" style="vertical-align:top; border-bottom:2px solid #000; position:relative; padding-bottom: 20px;">
                <div style="font-size:9px;">NAMA DAN ALAMAT PERUSAHAAN (Apabila pasangan bekerja) :</div>
                <div class="val" style="margin-top:2px;">${app.pasangan_perusahaan || ''}</div>
                <div style="position:absolute; bottom:4px; left:4px; display:flex; align-items:center; gap:5px; width:calc(100% - 8px);">
                  <span style="font-size:9px;">TEL. NO:</span>
                  <span class="val" style="flex:1;">${app.pasangan_telp || ''}</span>
                </div>
              </td>
              <td colspan="3" style="vertical-align:top;">
                <div style="display:flex; gap:2px;">
                   <div style="font-size:9px; width:120px;">NOMOR TELPON RUMAH :</div>
                   <div class="val" style="flex:1;">${app.darurat_telp_rumah || ''}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="vertical-align:top;">
                <div style="display:flex; gap:2px;">
                   <div style="font-size:9px; width:120px;">NOMOR TELPON KANTOR :</div>
                   <div class="val" style="flex:1;">${app.darurat_telp_kantor || ''}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="3" style="vertical-align:top; border-bottom:2px solid #000;">
                <div style="display:flex; gap:2px;">
                   <div style="font-size:9px; width:120px;">NOMOR HP :</div>
                   <div class="val" style="flex:1;">${app.darurat_hp || ''}</div>
                </div>
              </td>
            </tr>


          <table class="form-table" style="text-align:center; margin-top:0; border:2px solid #000; border-top:1px solid #000;">
             <tr>
                <th width="40%" rowspan="2" style="background-color:#ccffff; text-align:center; vertical-align:middle; border-bottom:1px solid #000;">NAMA SEKOLAH / INSTITUSI / UNIVERSITAS</th>
                <th width="10%" rowspan="2" style="background-color:#ccffff; text-align:center; vertical-align:middle; border-left:1px solid #000; border-bottom:1px solid #000;">DARI</th>
                <th width="10%" rowspan="2" style="background-color:#ccffff; text-align:center; vertical-align:middle; border-left:1px solid #000; border-bottom:1px solid #000;">KE</th>
                <th width="40%" colspan="3" style="background-color:#ccffff; text-align:center; border-left:1px solid #000; border-bottom:1px solid #000;">KUALIFIKASI YANG DIDAPATKAN</th>
             </tr>
             <tr>
                <th width="15%" style="background-color:#ccffff; text-align:center; font-weight:normal; color:red; border-left:1px solid #000; border-bottom:1px solid #000;">Jurusan</th>
                <th width="15%" style="background-color:#ccffff; text-align:center; font-weight:normal; color:red; border-left:1px solid #000; border-bottom:1px solid #000;">Gelar</th>
                <th width="10%" style="background-color:#ccffff; text-align:center; font-weight:normal; color:red; border-left:1px solid #000; border-bottom:1px solid #000;">IPK</th>
             </tr>
             ${[0, 1, 2, 3].map(i => {
      const p = pend[i] || {};
      return `
                  <tr>
                    <td class="val" style="height:25px; text-align:left; border-right:1px solid #000; border-bottom:1px solid #000;">${p.sekolah || ''}</td>
                    <td class="val text-center" style="border-right:1px solid #000; border-bottom:1px solid #000;">${p.dari || ''}</td>
                    <td class="val text-center" style="border-right:1px solid #000; border-bottom:1px solid #000;">${p.ke || ''}</td>
                    <td class="val text-center" style="border-right:1px solid #000; border-bottom:1px solid #000;">${p.jurusan || p.kualifikasi || ''}</td>
                    <td class="val text-center" style="border-right:1px solid #000; border-bottom:1px solid #000;">${p.gelar || ''}</td>
                    <td class="val text-center" style="border-bottom:1px solid #000;">${p.ipk || ''}</td>
                  </tr>
                `;
    }).join('')}
             <tr>
                <td colspan="6" class="val" style="height:100px; text-align:left; vertical-align:top;">
                  <span style="font-weight:normal;">Apakah Anda sedang dalam pendidikan sekarang? Jika ya, sebutkan jenis kursus/pendidikan, di mana diambil dan diharapkan tanggal penyelesaian:</span><br>
                  ${app.pendidikan_skrg || ''}
                </td>
             </tr>
          </table>
        </div>

        <!-- PAGE 2 -->
        <div class="pdf-page" style="padding:10px;">
          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:1px solid #000; margin-bottom:0; font-size:10px; font-weight:bold;">SEJARAH PEKERJAAN</div>
          <div style="border:2px solid #000; border-top:none; padding:4px; font-size:9px;">Jelaskan pengalaman bekerja di tempat/perusahaan sebelumnya. Jika perlu dapat menggunakan lembar terpisah. Slip gaji akan diminta sesuai dengan permintaan.</div>
          
          ${[0, 1, 2].map(i => {
      const p = peng[i] || {};
      return `
           <table class="form-table" style="table-layout: fixed; width: 100%; border-top:none; margin-top:0; border-bottom:2px solid #000; border-left:2px solid #000; border-right:2px solid #000;">
             <tr>
               <td style="width:35%; vertical-align:top; border-bottom:none; border-right:1px solid #000; font-size:9px; padding:4px;"><b>Perusahaan :</b> <span class="val">${p.perusahaan || ''}</span></td>
               <td colspan="2" style="width:30%; text-align:center; font-weight:bold; font-size:9px; border-right:1px solid #000; padding:2px;">BULAN / TAHUN</td>
               <td style="width:35%; vertical-align:top; border-bottom:none; font-size:9px; padding:4px;"><b>Posisi / Jabatan :</b> <span class="val">${p.jabatan || ''}</span></td>
             </tr>
             <tr>
               <td rowspan="5" style="vertical-align:top; border-top:none; border-right:1px solid #000; padding:4px; position:relative; padding-bottom:20px;">
                 <div style="font-size:9px;">Alamat :</div>
                 <div class="val" style="margin-top:2px;">${p.alamat || ''}</div>
                 <div style="position:absolute; bottom:4px; left:4px; font-size:9px;">Telp : <span class="val">${p.telp || ''}</span></div>
               </td>
               <td style="width:15%; text-align:center; font-weight:bold; font-size:9px; border-right:1px solid #000; padding:2px;">Dari</td>
               <td style="width:15%; text-align:center; font-weight:bold; font-size:9px; border-right:1px solid #000; padding:2px;">Ke</td>
               <td rowspan="5" style="vertical-align:top; border-top:none; padding:4px;">
                 <div style="font-size:9px;">Kesimpulan Tugas dan Tanggung Jawab :</div>
                 <div class="val" style="margin-top:2px;">${p.tugas || ''}</div>
               </td>
             </tr>
             <tr>
               <td class="val text-center" style="height:20px; border-right:1px solid #000; font-size:10px;">${p.mulai || ''}</td>
               <td class="val text-center" style="border-right:1px solid #000; font-size:10px;">${p.selesai || ''}</td>
             </tr>
             <tr>
               <td colspan="2" style="text-align:center; font-size:9px; padding:2px; border-right:1px solid #000;">Gaji</td>
             </tr>
             <tr>
               <td style="text-align:center; font-size:9px; border-right:1px solid #000; padding:2px;">Dimulai</td>
               <td style="text-align:center; font-size:9px; border-right:1px solid #000; padding:2px;">Terakhir</td>
             </tr>
             <tr>
               <td class="val text-center" style="height:20px; border-right:1px solid #000; font-size:9px;">${p.gaji_mulai || ''}</td>
               <td class="val text-center" style="border-right:1px solid #000; font-size:9px;">${p.gaji_akhir || ''}</td>
             </tr>
             <tr>
               <td colspan="4" style="font-size:9px; padding:4px;">
                 Alasan mengundurkan diri/meninggalkan pekerjaan :
                 <span class="val" style="margin-left:5px;">${p.alasan || ''}</span>
               </td>
             </tr>
           </table>
           `;
    }).join('')}

          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:none; margin-bottom:0; margin-top:20px; font-size:10px; font-weight:bold;">KETRAMPILAN LAINNYA</div>
          <table class="form-table" style="margin-top:0; border:2px solid #000; border-top:1px solid #000; table-layout: fixed; width: 100%;">
            <tr>
              <td colspan="4" style="height:60px; vertical-align:top; font-size:9px; padding:6px; border-bottom:1px solid #000;">
                 Aplikasi Komputer :<br>
                 <span class="val" style="display:inline-block; margin-top:4px;">${app.komputer || ''}</span>
              </td>
            </tr>
            <tr>
              <td colspan="4" style="height:80px; vertical-align:top; font-size:9px; padding:6px; border-bottom:1px solid #000;">
                 Kemampuan lain yang dapat dijalankan dengan efisien :<br>
                 <span class="val" style="display:inline-block; margin-top:4px;">${app.kemampuan_lain || ''}</span>
              </td>
            </tr>
            <tr>
              <td rowspan="3" colspan="2" style="width:60%; text-align:center; font-size:11px; border-right:1px solid #000; vertical-align:middle; padding:2px;">Bahasa</td>
              <td colspan="2" style="width:40%; text-align:center; font-size:11px; border-bottom:1px solid #000; padding:4px;">Kemahiran dalan bahasa:</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align:center; font-size:11px; border-bottom:1px solid #000; padding:4px;">A - Bagus / Fasih &nbsp;&nbsp; B - Rata - Rata &nbsp;&nbsp; C - Lemah</td>
            </tr>
            <tr>
              <td style="width:20%; text-align:center; font-size:11px; border-right:1px solid #000; padding:4px;">Berbicara</td>
              <td style="width:20%; text-align:center; font-size:11px; padding:4px;">Menulis</td>
            </tr>
            ${[0, 1, 2, 3].map(i => {
      const b = bhs[i] || {};

      const getGrade = (val) => {
        if (!val) return '';
        if (val.includes('A')) return 'A';
        if (val.includes('B')) return 'B';
        if (val.includes('C')) return 'C';
        return val.charAt(0);
      };

      return `
                <tr>
                  <td colspan="2" class="val" style="height:20px; border-right:1px solid #000; padding-left:10px; font-size:11px; font-weight:bold;">${b.nama || ''}</td>
                  <td class="val text-center" style="border-right:1px solid #000; font-size:11px; text-align:center; vertical-align:middle; font-weight:bold;">${getGrade(b.bicara)}</td>
                  <td class="val text-center" style="font-size:11px; text-align:center; vertical-align:middle; font-weight:bold;">${getGrade(b.nulis)}</td>
                </tr>
                `;
    }).join('')}
            <tr>
              <td colspan="4" style="height:60px; font-size:9px; padding:6px; border-top:1px solid #000; vertical-align:top;">
                 Hobby : <br>
                 <span class="val" style="margin-left:0px;">${app.hobby || ''}</span>
              </td>
            </tr>
            <tr>
              <td colspan="4" style="height:60px; font-size:9px; padding:6px; border-top:1px solid #000; vertical-align:top;">
                 Kelompok & Kegiatan Sosial : <br>
                 <span class="val" style="margin-left:0px;">${app.kegiatan_sosial || ''}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- PAGE 3 -->
        <div class="pdf-page" style="padding:10px;">
          <table class="form-table" style="table-layout: fixed; width: 100%; margin-top:20px; border:2px solid #000;">
            <colgroup>
              <col style="width: 40%;">
              <col style="width: 16%;">
              <col style="width: 13%;">
              <col style="width: 13%;">
              <col style="width: 9%;">
              <col style="width: 9%;">
            </colgroup>
            <tr>
              <th colspan="6" style="text-align:center; background-color:#ccffff; color:#000; font-size:10px; font-weight:bold; padding:4px; border-bottom:1px solid #000;">DATA KELUARGA</th>
            </tr>
            <tr>
              <th colspan="4" style="text-align:center; font-size:9px; padding:4px; border-bottom:1px solid #000;">Daftar Keluarga (Orang Tua / Suami / Istri / Anak)</th>
              <th colspan="2" style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Dibawah dukungan anda</th>
            </tr>
            <tr>
              <th style="text-align:center; font-size:9px; padding:4px; border-bottom:1px solid #000;">Nama</th>
              <th style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Hubungan</th>
              <th style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Usia</th>
              <th style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Pekerjaan</th>
              <th style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Ya</th>
              <th style="text-align:center; font-size:9px; padding:4px; border-left:1px solid #000; border-bottom:1px solid #000;">Tidak</th>
            </tr>
            ${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const k = kel[i] || {};
      return `
                  <tr>
                    <td class="val" style="height:18px; padding:2px 4px; font-size:9px; border-right:1px solid #000; border-bottom:1px solid #000;">${k.nama || ''}</td>
                    <td class="val text-center" style="padding:2px 4px; font-size:9px; border-right:1px solid #000; border-bottom:1px solid #000;">${k.hubungan || ''}</td>
                    <td class="val text-center" style="padding:2px 4px; font-size:9px; border-right:1px solid #000; border-bottom:1px solid #000;">${k.usia ? k.usia + ' thn' : ''}</td>
                    <td class="val text-center" style="padding:2px 4px; font-size:9px; border-right:1px solid #000; border-bottom:1px solid #000;">${k.pekerjaan || ''}</td>
                    <td class="val text-center" style="padding:2px 4px; font-size:9px; border-right:1px solid #000; border-bottom:1px solid #000;">${k.dukungan === 'Ya' ? '✓' : ''}</td>
                    <td class="val text-center" style="padding:2px 4px; font-size:9px; border-bottom:1px solid #000;">${k.dukungan === 'Tidak' ? '✓' : ''}</td>
                  </tr>
                `;
    }).join('')}
          </table>

          <!-- INFORMASI TAMBAHAN -->
          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:1px solid #000; margin-bottom:0; margin-top:20px; font-size:10px; font-weight:bold;">INFORMASI TAMBAHAN</div>
          <table class="form-table" style="width: 100%; margin-top:0; border:2px solid #000; border-top:none;">
             <tr>
               <td style="padding:10px 6px; font-size:9px; vertical-align:top; border-bottom:none;">
                 <div style="display:flex;">
                   <div style="width:15px;">1.</div>
                   <div style="flex:1;">Posisi saat ini yang dijabat di perusahaan lain/institusi atau benefit yang didapatkan, mohon penjelasannya :</div>
                 </div>
                 <div class="val" style="margin-top:10px; margin-left:15px; border-bottom:1px solid #000; min-height:15px; padding-bottom:2px;">${app.info_posisi || ''}</div>
               </td>
             </tr>
             <tr>
               <td style="padding:10px 6px; font-size:9px; vertical-align:top; border-bottom:none; border-top:none;">
                 <div style="display:flex;">
                   <div style="width:15px;">2.</div>
                   <div style="flex:1;">Apakah Anda sedang bangkrut atau dinyatakan pailit ? <span class="val" style="margin-left:5px;">${app.info_pailit || 'Tidak'}</span></div>
                 </div>
               </td>
             </tr>
             <tr>
               <td style="padding:10px 6px; font-size:9px; vertical-align:top; border-bottom:none; border-top:none;">
                 <div style="display:flex;">
                   <div style="width:15px;">3.</div>
                   <div style="flex:1;">Apakah Anda memiliki kerabat atau teman-teman yang sebelumnya / saat ini dipekerjakan oleh PT. Weha Agro Sejahtera? Jika ya, sebutkan nama / relasi<br>dan jabatan.</div>
                 </div>
                 <div class="val" style="margin-top:10px; margin-left:15px; border-bottom:1px solid #000; min-height:15px; padding-bottom:2px;">${app.info_kerabat === 'Ya' ? 'Ya, ada.' : 'Tidak'}</div>
               </td>
             </tr>
             <tr>
               <td style="padding:10px 6px; font-size:9px; vertical-align:top; border-bottom:none; border-top:none;">
                 <div style="display:flex;">
                   <div style="width:15px;">4.</div>
                   <div style="flex:1;">Apakah Anda pernah dihukum karena masalah pidana, jika iya silahkan dijelaskan : <span class="val">${app.info_pidana === 'Ya' ? 'Ya' : 'Tidak'}</span></div>
                 </div>
                 
                 <div style="display:flex; align-items:center; margin-top:15px; margin-left:15px; gap:8px;">
                   <div>Apakah Anda mempunyai SIM ?</div>
                   <div class="val" style="width:60px; border-bottom:1px solid #000; text-align:center;">${app.info_sim || 'Tidak'}</div>
                   <div style="margin-left:10px;">Silahkan memberikan klasifikasinya :</div>
                   <select class="val" style="width:60px; border:none; border-bottom:1px solid #000; text-align:center; appearance:none; outline:none; font-family:inherit; font-size:inherit; background:transparent;">
                     <option value="" ${!app.sim_tipe ? 'selected' : ''}></option>
                     <option value="SIM A" ${app.sim_tipe === 'SIM A' ? 'selected' : ''}>SIM A</option>
                     <option value="SIM B1" ${app.sim_tipe === 'SIM B1' ? 'selected' : ''}>SIM B1</option>
                     <option value="SIM B2" ${app.sim_tipe === 'SIM B2' ? 'selected' : ''}>SIM B2</option>
                     <option value="SIM C" ${app.sim_tipe === 'SIM C' ? 'selected' : ''}>SIM C</option>
                     <option value="SIM D" ${app.sim_tipe === 'SIM D' ? 'selected' : ''}>SIM D</option>
                   </select>
                   <div style="margin-left:10px;">Reg No.</div>
                   <div class="val" style="flex:1; border-bottom:1px solid #000;">${app.info_sim === 'Ya' && app.sim_noreg ? app.sim_noreg : ''}</div>
                 </div>

                 <div style="display:flex; align-items:center; margin-top:15px; margin-left:15px; gap:8px;">
                   <div>Pemberitahuan yang diperlukan untuk mulai bekerja</div>
                   <div class="val" style="width:100px; border-bottom:1px solid #000; text-align:center;">${app.tanggal_mulai || ''}</div>
                   <div style="margin-left:20px;">Gaji yang diinginkan :</div>
                   <div class="val" style="flex:1; border-bottom:1px solid #000; text-align:left; padding-left:5px;">${app.gaji_diharapkan || ''}</div>
                 </div>
               </td>
             </tr>
          </table>

          <!-- PETUNJUK -->
          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:1px solid #000; margin-bottom:0; margin-top:20px; font-size:10px; font-weight:bold;">PETUNJUK</div>
          <table class="form-table" style="width: 100%; margin-top:0; border:2px solid #000; border-top:none;">
            <tr>
              <td colspan="2" style="font-size:9px; padding:4px 6px; border-bottom:none;">
                Daftar dua (2) orang yang tahu performa kerja Anda dan rincian pribadi Anda. Jangan daftar anggota Anda keluarga Anda.
              </td>
            </tr>
            <tr>
              <td style="width:50%; vertical-align:top; padding:10px 20px; border-top:none; border-right:none;">
                <div style="display:flex; align-items:flex-end; margin-bottom:10px;">
                  <div style="font-size:9px; width:40px;">Nama :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref1_nama || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-start; margin-bottom:25px;">
                  <div style="font-size:9px; width:110px;">Nama & Alamat Karyawan :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref1_alamat || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-end; margin-bottom:10px;">
                  <div style="font-size:9px; width:45px;">Jabatan :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref1_jabatan || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-end;">
                  <div style="font-size:9px; width:25px;">Tel :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref1_tel || ''}</div>
                </div>
              </td>
              <td style="width:50%; vertical-align:top; padding:10px 20px; border-top:none; border-left:none;">
                <div style="display:flex; align-items:flex-end; margin-bottom:10px;">
                  <div style="font-size:9px; width:40px;">Nama :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref2_nama || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-start; margin-bottom:25px;">
                  <div style="font-size:9px; width:110px;">Nama & Alamat Karyawan :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref2_alamat || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-end; margin-bottom:10px;">
                  <div style="font-size:9px; width:45px;">Jabatan :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref2_jabatan || ''}</div>
                </div>
                <div style="display:flex; align-items:flex-end;">
                  <div style="font-size:9px; width:25px;">Tel :</div>
                  <div class="val" style="flex:1; border-bottom:1px solid #000; min-height:16px;">${app.ref2_tel || ''}</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- PENCAPAIAN -->
          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:1px solid #000; margin-bottom:0; margin-top:20px; font-size:10px; font-weight:bold;">PENCAPAIAN</div>
          <table class="form-table" style="width: 100%; margin-top:0; border:2px solid #000; border-top:none;">
            <tr>
              <td style="font-size:9px; padding:6px; min-height:50px; vertical-align:top;">
                Anda dapat menambahkan informasi terkait dengan fakta-fakta penting lainnya atau prestasi dalam pekerjaan masa lalu Anda.
                <div class="val" style="margin-top:10px; border-bottom:1px solid #000; min-height:16px; padding-bottom:2px;">${app.pencapaian || ''}</div>
                <div style="border-bottom:1px solid #000; min-height:16px; margin-top:10px;"></div>
                <div style="border-bottom:1px solid #000; min-height:16px; margin-top:10px;"></div>
              </td>
            </tr>
          </table>

          <!-- PERNYATAAN -->
          <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border:2px solid #000; border-bottom:1px solid #000; margin-bottom:0; margin-top:20px; font-size:10px; font-weight:bold;">PERNYATAAN</div>
          <table class="form-table" style="width: 100%; margin-top:0; border:2px solid #000; border-top:none;">
            <tr>
              <td style="font-size:8px; padding:8px 10px; text-transform:uppercase; line-height:1.4;">
                SAYA TELAH MEMBACA DAN MEMAHAMI ISI DARI DOKUMEN DI ATAS DAN SAYA MENGIZINKAN KEPADA ORANG, FIRMA ATAU PERUSAHAAN UNTUK MEMBERIKAN INFORMASI LENGKAP KEPADA PERUSAHAAN DARI PT. WEHA AGRO SEJAHTERA BERKAITAN DENGAN KEMAMPUAN KERJA DAN KARAKTER SAYA.<br><br>
                BERSAMA INI, SAYA MENYATAKAN BAHWA SEMUA INFORMASI DI ATAS ADALAH AKURAT DAN SAYA MENGERTI BAHWA APABILA DENGAN SENGAJA MENAHAN INFORMASI ATAU MEMBUAT LAPORAN YANG SALAH DALAM FORMULIR INI MAKA DAPAT MENJADI DASAR PEMBERHENTIAN SAYA DARI PERUSAHAAN DAN MEMBUAT HUBUNGAN KERJA INI MENJADI BATAL DAN TIDAK BERLAKU.

                <div style="display:flex; justify-content:space-between; margin-top:50px; padding:0 20px;">
                    <div style="display:flex; align-items:flex-end;">
                     <div style="width:92px; text-align:center;">TANDA TANGAN PELAMAR :</div>
                     <div style="width:180px; border-bottom:1px solid #000; text-align:center; position:relative; min-height:20px;">
                       <span class="val" style="font-family:'Plus Jakarta Sans', sans-serif; font-size:9px; color:#000; position:absolute; bottom:2px; left:0; right:0;">${app.tanda_tangan || ''}</span>
                     </div>
                  </div>
                  <div style="display:flex; align-items:flex-end;">
                     <div style="width:45px;">TANGGAL :</div>
                     <div class="val" style="width:120px; border-bottom:1px solid #000; text-align:center;">${(function (val) {
        const d = val ? new Date(val) : new Date();
        if (isNaN(d.getTime())) return val || '';
        return String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
      })(app.tanggal_ttd)}</div>
                  </div>
                </div>
                <div style="height:10px;"></div>
              </td>
            </tr>
          </table>
        </div>

        <!-- PAGE 4 (HRD ONLY) -->
        <div class="pdf-page" style="height:100%; box-sizing:border-box; padding-bottom:5px;">
           <div style="border:2px solid #000; height:100%; box-sizing:border-box; display:flex; flex-direction:column;">
             <div class="section-title" style="text-align:center; background-color:#ccffff; color:#000; border-bottom:2px solid #000; margin-bottom:0; padding:8px 0; font-size:10px; font-weight:bold;">HANYA UNTUK HRD</div>
             
             <div style="padding:20px 30px; font-size:9px; flex:1;">
                <div style="margin-bottom:30px;">TANGGAL PENERIMAAN :</div>
                
                <div style="margin-bottom:40px;">DITERIMA OLEH :</div>
                <div style="width:220px; border-bottom:1px solid #000; margin-bottom:25px;"></div>
                
                <div style="display:flex; align-items:flex-end; margin-bottom:20px;">
                   <div style="width:120px;">NAMA</div>
                   <div style="width:20px;">:</div>
                   <div style="width:220px; border-bottom:1px solid #000;"></div>
                </div>
                
                <div style="display:flex; align-items:flex-end; margin-bottom:40px;">
                   <div style="width:120px;">JABATAN</div>
                   <div style="width:20px;">:</div>
                   <div style="width:220px; border-bottom:1px solid #000;"></div>
                </div>
                
                <div style="margin-bottom:15px; display:flex; align-items:center; margin-left:30px;">
                   <div style="width:20px; height:15px; border:2px solid #000; margin-right:30px;"></div>
                   <div>DIPANGGIL UNTUK INTERVIEW</div>
                </div>
                <div style="margin-bottom:15px; display:flex; align-items:center; margin-left:30px;">
                   <div style="width:20px; height:15px; border:2px solid #000; margin-right:30px;"></div>
                   <div>DISIMPAN SEBAGAI REFERENSI</div>
                </div>
                <div style="margin-bottom:50px; display:flex; align-items:center; margin-left:30px;">
                   <div style="width:20px; height:15px; border:2px solid #000; margin-right:30px;"></div>
                   <div>TIDAK SESUAI</div>
                </div>
                
                <div style="margin-bottom:40px; margin-left:50px;">DIREKOMENDASIKAN OLEH :</div>
                <div style="width:150px; border-bottom:1px solid #000; margin-bottom:30px;"></div>
                
                <div style="display:flex; align-items:flex-end; margin-bottom:500px;">
                   <div style="width:30px;">TGL :</div>
                   <div style="width:120px; border-bottom:1px solid #000;"></div>
                </div>
             </div>
           </div>
        </div>
      </div>
    `;

    // Construct a temporary div
    const wrapper = document.createElement('div');
    wrapper.id = 'purePrintWrapper';
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100vw'; // full width
    wrapper.style.background = 'white';
    wrapper.style.zIndex = '999999';
    wrapper.innerHTML = htmlContent;

    document.body.appendChild(wrapper);

    // Call native window print immediately
    setTimeout(() => {
      window.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(wrapper);
      }, 500);
    }, 200);

  } catch (error) {
    console.error('Error printing PDF:', error);
    alert('Terjadi kesalahan saat membuat PDF.');
  }
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
