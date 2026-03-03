// ===================== State =====================
let currentStep = 1;
const totalSteps = 3;
let pendidikanCount = 1;
let bahasaCount = 1;
let pengalamanCount = 1;
let keluargaCount = 1;

// ===================== Age Calculation =====================
function calculateAge() {
  const dobInput = document.getElementById('tanggal_lahir');
  const usiaInput = document.getElementById('usia');
  if (!dobInput.value) {
    usiaInput.value = '';
    return;
  }
  const dob = new Date(dobInput.value);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  usiaInput.value = `${years} tahun, ${months} bulan, ${days} hari`;
}

// ===================== Conditional Jumlah Anak =====================
function toggleJumlahAnak() {
  const status = document.getElementById('status_pernikahan').value;
  const group = document.getElementById('jumlahAnakGroup');
  if (status === 'Menikah' || status === 'Cerai') {
    group.style.display = 'flex';
    group.style.animation = 'fadeSlideIn 0.3s ease';
  } else {
    group.style.display = 'none';
    document.getElementById('jumlah_anak').value = '';
  }
}

// ===================== Conditional Cacat & Hamil =====================
function toggleCacatInfo() {
  const isYa = document.querySelector('input[name="info_cacat"]:checked').value === 'Ya';
  const infoEl = document.getElementById('cacat_info');
  if (infoEl) {
    if (isYa) {
      infoEl.style.display = 'block';
      infoEl.required = true;
    } else {
      infoEl.style.display = 'none';
      infoEl.required = false;
      infoEl.value = '';
    }
  }
}

function toggleHamilInfo() {
  const isYa = document.querySelector('input[name="info_hamil"]:checked').value === 'Ya';
  const infoEl = document.getElementById('hamil_info');
  if (infoEl) {
    if (isYa) {
      infoEl.style.display = 'block';
      infoEl.required = true;
    } else {
      infoEl.style.display = 'none';
      infoEl.required = false;
      infoEl.value = '';
    }
  }
}

function toggleSimInfo() {
  const isYa = document.querySelector('input[name="info_sim"]:checked').value === 'Ya';
  const infoEl = document.getElementById('simDetails');
  const simTipe = document.getElementById('sim_tipe');
  const simNoreg = document.getElementById('sim_noreg');

  if (infoEl) {
    if (isYa) {
      infoEl.style.display = 'block';
      simTipe.required = true;
      simNoreg.required = true;
    } else {
      infoEl.style.display = 'none';
      simTipe.required = false;
      simNoreg.required = false;
      simTipe.value = '';
      simNoreg.value = '';
    }
  }
}

// ===================== Step Navigation =====================
function updateProgress() {
  const fill = document.getElementById('progressFill');
  fill.style.width = `${(currentStep / totalSteps) * 100}%`;

  document.querySelectorAll('.step').forEach((step, i) => {
    step.classList.remove('active', 'completed');
    if (i + 1 === currentStep) step.classList.add('active');
    else if (i + 1 < currentStep) step.classList.add('completed');
  });

  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
  if (activeStep) activeStep.classList.add('active');

  // Button visibility
  document.getElementById('btnPrev').style.display = currentStep > 1 ? 'inline-flex' : 'none';
  document.getElementById('btnNext').style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
  document.getElementById('btnSubmit').style.display = currentStep === totalSteps ? 'inline-flex' : 'none';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) {
    currentStep++;
    updateProgress();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateProgress();
  }
}

// Step click handler
document.querySelectorAll('.step').forEach(step => {
  step.addEventListener('click', () => {
    const target = parseInt(step.dataset.step);
    // Only allow clicking on completed or current step
    if (target < currentStep) {
      currentStep = target;
      updateProgress();
    } else if (target === currentStep + 1) {
      nextStep();
    }
  });
});

// ===================== Validation =====================
function validateStep(step) {
  let valid = true;
  const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);

  // Clear previous errors
  stepEl.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  stepEl.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

  if (step === 1) {
    const fields = [
      { id: 'nama_lengkap', msg: 'Nama lengkap wajib diisi' },
      { id: 'tempat_lahir', msg: 'Tempat lahir wajib diisi' },
      { id: 'tanggal_lahir', msg: 'Tanggal lahir wajib diisi' },
      { id: 'jenis_kelamin', msg: 'Pilih jenis kelamin' },
      { id: 'agama', msg: 'Pilih agama' },
      { id: 'status_pernikahan', msg: 'Pilih status pernikahan' },
      { id: 'kewarganegaraan', msg: 'Kewarganegaraan wajib diisi' },
      { id: 'keturunan', msg: 'Keturunan wajib diisi' },
      { id: 'nik', msg: 'NIK wajib diisi (16 digit)' },
      { id: 'tinggi_badan', msg: 'Tinggi badan wajib diisi' },
      { id: 'berat_badan', msg: 'Berat badan wajib diisi' },
      { id: 'alamat_ktp', msg: 'Alamat KTP wajib diisi' },
      { id: 'alamat_domisili', msg: 'Alamat domisili wajib diisi' },
      { id: 'no_hp', msg: 'Nomor HP wajib diisi' },
      { id: 'email', msg: 'Email wajib diisi' },
      { id: 'tempat_tinggal', msg: 'Pilih tempat tinggal' },
      { id: 'darurat_nama', msg: 'Nama kontak darurat wajib diisi' },
      { id: 'darurat_hubungan', msg: 'Hubungan kontak darurat wajib diisi' }
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const errEl = document.getElementById(`error-${f.id}`);
      if (el && !el.value.trim()) {
        el.classList.add('invalid');
        if (errEl) { errEl.textContent = f.msg; errEl.classList.add('visible'); }
        valid = false;
      }
    });

    // Validasi condisional 'jumlah_anak'
    const statusPernikahan = document.getElementById('status_pernikahan');
    const jumlahAnak = document.getElementById('jumlah_anak');
    if (statusPernikahan && statusPernikahan.value === 'Menikah') {
      if (!jumlahAnak.value.trim()) {
        jumlahAnak.classList.add('invalid');
        valid = false;
      }
    }

    // Validate NIK length
    const nik = document.getElementById('nik');
    if (nik.value.trim() && nik.value.trim().length !== 16) {
      nik.classList.add('invalid');
      const errNik = document.getElementById('error-nik');
      if (errNik) { errNik.textContent = 'NIK harus 16 digit'; errNik.classList.add('visible'); }
      valid = false;
    }

    // Validate email
    const email = document.getElementById('email');
    if (email.value.trim() && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      email.classList.add('invalid');
      const errEmail = document.getElementById('error-email');
      if (errEmail) { errEmail.textContent = 'Format email tidak valid'; errEmail.classList.add('visible'); }
      valid = false;
    }
  }

  if (step === 3) {
    const posisi = document.getElementById('posisi_dilamar');
    const errPosisi = document.getElementById('error-posisi_dilamar');
    if (!posisi.value.trim()) {
      posisi.classList.add('invalid');
      if (errPosisi) { errPosisi.textContent = 'Posisi yang dilamar wajib diisi'; errPosisi.classList.add('visible'); }
      valid = false;
    }

    // Validasi Pasangan Wajib
    const arrPasanganIds = ['pasangan_nama', 'pasangan_pekerjaan', 'pasangan_perusahaan', 'pasangan_telp'];
    arrPasanganIds.forEach(id => {
      const field = document.getElementById(id);
      const errField = document.getElementById(`error-${id}`);
      if (!field.value.trim()) {
        field.classList.add('invalid');
        if (errField) { errField.textContent = 'Field ini wajib diisi'; errField.classList.add('visible'); }
        valid = false;
      }
    });

    // Validasi Kontak Darurat Tambahan Wajib
    const arrDaruratIds = ['darurat_telp_rumah', 'darurat_telp_kantor', 'darurat_hp'];
    arrDaruratIds.forEach(id => {
      const field = document.getElementById(id);
      const errField = document.getElementById(`error-${id}`);
      if (!field.value.trim()) {
        field.classList.add('invalid');
        if (errField) { errField.textContent = 'Nomor telepon wajib diisi'; errField.classList.add('visible'); }
        valid = false;
      }
    });

    const txtTtd = document.getElementById('tanda_tangan');
    const errTtd = document.getElementById('error-tanda_tangan');
    if (!txtTtd.value.trim()) {
      txtTtd.classList.add('invalid');
      if (errTtd) { errTtd.textContent = 'Nama lengkap tanda tangan wajib diisi'; errTtd.classList.add('visible'); }
      valid = false;
    }

    const tglTtd = document.getElementById('tanggal_ttd');
    const errTglTtd = document.getElementById('error-tanggal_ttd');
    if (!tglTtd.value.trim()) {
      tglTtd.classList.add('invalid');
      if (errTglTtd) { errTglTtd.textContent = 'Tanggal tanda tangan wajib diisi'; errTglTtd.classList.add('visible'); }
      valid = false;
    }
  }

  if (!valid) {
    // Shake animation on first invalid element
    const firstInvalid = stepEl.querySelector('.invalid');
    if (firstInvalid) {
      firstInvalid.style.animation = 'shake 0.5s ease';
      setTimeout(() => firstInvalid.style.animation = '', 500);
      firstInvalid.focus();
    }
  }

  return valid;
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// Clear validation on input
document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('invalid');
    const errEl = document.getElementById(`error-${el.id}`);
    if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
  });
});

// ===================== Dynamic Entries =====================
function addPendidikan() {
  const container = document.getElementById('pendidikanContainer');
  const index = pendidikanCount++;

  const entry = document.createElement('div');
  entry.className = 'education-entry card-entry';
  entry.dataset.index = index;
  entry.innerHTML = `
    <div class="entry-header">
      <h3>Pendidikan #${index + 1}</h3>
      <button type="button" class="btn-remove-entry" onclick="removeEntry('pendidikan', this)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group full-width">
        <label>Nama Sekolah / Institusi / Universitas</label>
        <input type="text" name="pendidikan_sekolah_${index}" placeholder="Nama sekolah/universitas">
      </div>
      <div class="form-group">
        <label>Dari (Tahun)</label>
        <input type="text" name="pendidikan_dari_${index}" placeholder="Contoh: 2010">
      </div>
      <div class="form-group">
        <label>Ke (Tahun)</label>
        <input type="text" name="pendidikan_ke_${index}" placeholder="Contoh: 2013">
      </div>
      <div class="form-group full-width">
        <label>Kualifikasi Yang Didapatkan</label>
        <input type="text" name="pendidikan_kualifikasi_${index}" placeholder="Jurusan, Gelar, nilai, dsb.">
      </div>
    </div>
  `;
  container.appendChild(entry);
  entry.style.animation = 'fadeSlideIn 0.4s ease';

  // Show remove button on first entry if more than one
  updateRemoveButtons('pendidikan');
}

function addBahasa() {
  const container = document.getElementById('bahasaContainer');
  const index = bahasaCount++;

  const tr = document.createElement('tr');
  tr.dataset.index = index;
  tr.innerHTML = `
    <td style="padding:8px; border:1px solid var(--border);">
      <input type="text" name="bahasa_nama_${index}" placeholder="Bahasa" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:4px; margin-bottom:0;">
    </td>
    <td style="padding:8px; border:1px solid var(--border);">
      <select name="bahasa_bicara_${index}" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:4px; margin-bottom:0;">
        <option value="Sangat Baik">Sangat Baik</option>
        <option value="Baik">Baik</option>
        <option value="Rata-Rata" selected>Rata-Rata</option>
        <option value="Kurang">Kurang</option>
      </select>
    </td>
    <td style="padding:8px; border:1px solid var(--border);">
      <select name="bahasa_nulis_${index}" style="width:100%; border:1px solid var(--border); padding:8px; border-radius:4px; margin-bottom:0;">
        <option value="Sangat Baik">Sangat Baik</option>
        <option value="Baik">Baik</option>
        <option value="Rata-Rata" selected>Rata-Rata</option>
        <option value="Kurang">Kurang</option>
      </select>
    </td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center;">
      <button type="button" class="btn-remove-bahasa" onclick="removeBahasa(this)" style="color:var(--error); background:none; border:none; cursor:pointer;" title="Hapus Baris">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </td>
  `;
  container.appendChild(tr);
  tr.style.animation = 'fadeSlideIn 0.3s ease';

  updateRemoveButtonsBahasa();
}

function removeBahasa(btn) {
  const tr = btn.closest('tr');
  tr.style.animation = 'fadeOut 0.2s ease forwards';
  setTimeout(() => {
    tr.remove();
    updateRemoveButtonsBahasa();
  }, 200);
}

function updateRemoveButtonsBahasa() {
  const container = document.getElementById('bahasaContainer');
  const rows = container.querySelectorAll('tr');
  rows.forEach(row => {
    const removeBtn = row.querySelector('.btn-remove-bahasa');
    if (removeBtn) {
      removeBtn.style.display = rows.length > 1 ? 'inline-block' : 'none';
    }
  });
}

function addPengalaman() {
  const container = document.getElementById('pengalamanContainer');
  const index = pengalamanCount++;

  const entry = document.createElement('div');
  entry.className = 'experience-entry card-entry';
  entry.dataset.index = index;
  entry.innerHTML = `
    <div class="entry-header">
      <h3>Pengalaman #${index + 1}</h3>
      <button type="button" class="btn-remove-entry" onclick="removeEntry('pengalaman', this)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
    <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="form-group full-width">
        <label>Perusahaan :</label>
        <input type="text" name="pengalaman_perusahaan_${index}" placeholder="Nama perusahaan">
      </div>
      <div class="form-group full-width">
        <label>Posisi / Jabatan :</label>
        <input type="text" name="pengalaman_jabatan_${index}" placeholder="Jabatan Anda">
      </div>
      <div class="form-group">
        <label>BULAN / TAHUN (Dari) :</label>
        <input type="month" name="pengalaman_mulai_${index}">
      </div>
      <div class="form-group">
        <label>BULAN / TAHUN (Ke) :</label>
        <input type="month" name="pengalaman_selesai_${index}">
      </div>
      <div class="form-group full-width">
        <label>Alamat :</label>
        <textarea name="pengalaman_alamat_${index}" rows="2" placeholder="Alamat Perusahaan"></textarea>
      </div>
      <div class="form-group full-width">
        <label>Telp :</label>
        <input type="text" name="pengalaman_telp_${index}" placeholder="Nomor Telepon Perusahaan">
      </div>
      <div class="form-group full-width">
        <label>Kesimpulan Tugas dan Tanggung Jawab :</label>
        <textarea name="pengalaman_tugas_${index}" rows="3" placeholder="Ringkasan tugas..."></textarea>
      </div>
      <div class="form-group">
        <label>Gaji Dimulai :</label>
        <input type="text" name="pengalaman_gaji_mulai_${index}" placeholder="Contoh: 4.000.000">
      </div>
      <div class="form-group">
        <label>Gaji Terakhir :</label>
        <input type="text" name="pengalaman_gaji_akhir_${index}" placeholder="Contoh: 6.000.000">
      </div>
      <div class="form-group full-width">
        <label>Alasan mengundurkan diri/meninggalkan pekerjaan :</label>
        <textarea name="pengalaman_alasan_${index}" rows="2" placeholder="Alasan Anda keluar..."></textarea>
      </div>
    </div>
  `;
  container.appendChild(entry);
  entry.style.animation = 'fadeSlideIn 0.4s ease';

  updateRemoveButtons('pengalaman');
}

function addKeluarga() {
  const container = document.getElementById('keluargaContainer');
  const index = keluargaCount++;

  const entry = document.createElement('div');
  entry.className = 'card-entry';
  entry.dataset.index = index;
  entry.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3 style="font-size:1rem; color:var(--text);">Anggota Keluarga #${index + 1}</h3>
      <button type="button" class="btn-remove-entry" onclick="removeEntry('keluarga', this)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
    <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="form-group full-width">
        <label>Nama</label>
        <input type="text" name="keluarga_nama_${index}" placeholder="Nama anggota keluarga">
      </div>
      <div class="form-group">
        <label>Hubungan</label>
        <input type="text" name="keluarga_hubungan_${index}" placeholder="Orang tua/suami/istri/anak">
      </div>
      <div class="form-group">
        <label>Usia</label>
        <input type="number" name="keluarga_usia_${index}" placeholder="Contoh: 45">
      </div>
      <div class="form-group full-width">
        <label>Pekerjaan</label>
        <input type="text" name="keluarga_pekerjaan_${index}" placeholder="Pekerjaan saat ini">
      </div>
      <div class="form-group full-width" style="margin-top:8px;">
        <label style="margin-bottom:8px; display:block;">Dibawah dukungan Anda?</label>
        <div style="display:flex; gap:16px;">
          <label style="display:flex; align-items:center; gap:4px; font-weight:normal; text-transform:none;"><input type="radio" name="keluarga_dukungan_${index}" value="Ya"> Ya</label>
          <label style="display:flex; align-items:center; gap:4px; font-weight:normal; text-transform:none;"><input type="radio" name="keluarga_dukungan_${index}" value="Tidak" checked> Tidak</label>
        </div>
      </div>
    </div>
  `;
  container.appendChild(entry);
  entry.style.animation = 'fadeSlideIn 0.4s ease';

  updateRemoveButtons('keluarga');
}

function removeEntry(type, btn) {
  const entry = btn.closest('.card-entry');
  entry.style.animation = 'fadeOut 0.3s ease forwards';
  setTimeout(() => {
    entry.remove();
    updateRemoveButtons(type);
    renumberEntries(type);
  }, 300);
}

function updateRemoveButtons(type) {
  const container = type + 'Container';
  const entries = document.getElementById(container).querySelectorAll('.card-entry');
  entries.forEach(entry => {
    const removeBtn = entry.querySelector('.btn-remove-entry');
    if (removeBtn) {
      removeBtn.style.display = entries.length > 1 ? 'flex' : 'none';
    }
  });
}

function renumberEntries(type) {
  const container = type + 'Container';
  let label = '';
  if (type === 'pendidikan') label = 'Pendidikan';
  else if (type === 'pengalaman') label = 'Pengalaman';
  else if (type === 'keluarga') label = 'Anggota Keluarga';

  const entries = document.getElementById(container).querySelectorAll('.card-entry');
  entries.forEach((entry, i) => {
    const title = entry.querySelector('h3');
    if (title) title.textContent = `${label} #${i + 1}`;
  });

  if (type === 'pendidikan') pendidikanCount = entries.length;
  else if (type === 'pengalaman') pengalamanCount = entries.length;
  else if (type === 'keluarga') keluargaCount = entries.length;
}

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
  @keyframes fadeOut {
    to { opacity: 0; transform: translateY(-10px); height: 0; padding: 0; margin: 0; overflow: hidden; }
  }
`;
document.head.appendChild(fadeOutStyle);

// ===================== File Upload =====================
function handleFileSelect(input, cardId) {
  const card = document.getElementById(cardId);
  const fileNameEl = document.getElementById(`file-name-${input.name}`);

  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      input.value = '';
      return;
    }

    card.classList.add('has-file');
    if (fileNameEl) fileNameEl.textContent = file.name;
  } else {
    card.classList.remove('has-file');
    if (fileNameEl) fileNameEl.textContent = '';
  }
}

// ===================== Form Submission =====================
document.getElementById('applicationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!validateStep(3)) return;

  const loading = document.getElementById('loadingOverlay');
  loading.classList.add('active');

  try {
    const formData = new FormData();

    const basicFields = [
      'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'usia', 'jenis_kelamin',
      'kewarganegaraan', 'keturunan',
      'agama', 'status_pernikahan', 'jumlah_anak', 'nik',
      'tinggi_badan', 'berat_badan', 'alamat_ktp', 'alamat_domisili',
      'no_hp', 'email', 'tempat_tinggal',
      'pasangan_nama', 'pasangan_pekerjaan', 'pasangan_perusahaan', 'pasangan_telp',
      'darurat_nama', 'darurat_hubungan', 'darurat_telp_rumah', 'darurat_telp_kantor', 'darurat_hp',
      'pendidikan_skrg', 'komputer', 'kemampuan_lain', 'hobby', 'kegiatan_sosial', 'pencapaian',
      'posisi_dilamar', 'gaji_diharapkan', 'tanggal_mulai',
      'info_posisi', 'sim_tipe', 'sim_noreg',
      'ref1_nama', 'ref1_alamat', 'ref1_jabatan', 'ref1_tel',
      'ref2_nama', 'ref2_alamat', 'ref2_jabatan', 'ref2_tel'
    ];
    basicFields.forEach(field => {
      const el = document.getElementById(field);
      if (el) formData.append(field, el.value);
    });

    // Radio fields
    formData.append('info_cacat', document.querySelector('input[name="info_cacat"]:checked')?.value || 'Tidak');
    formData.append('info_hamil', document.querySelector('input[name="info_hamil"]:checked')?.value || 'Tidak');
    formData.append('info_pailit', document.querySelector('input[name="info_pailit"]:checked')?.value || 'Tidak');
    formData.append('info_kerabat', document.querySelector('input[name="info_kerabat"]:checked')?.value || 'Tidak');
    formData.append('info_pidana', document.querySelector('input[name="info_pidana"]:checked')?.value || 'Tidak');
    formData.append('info_sim', document.querySelector('input[name="info_sim"]:checked')?.value || 'Tidak');

    // Persetujuan TTD
    formData.append('tanda_tangan', document.getElementById('tanda_tangan').value);
    formData.append('tanggal_ttd', document.getElementById('tanggal_ttd').value);

    // Collect pendidikan entries
    const pendidikanEntries = [];
    document.getElementById('pendidikanContainer').querySelectorAll('.card-entry').forEach(entry => {
      const idx = entry.dataset.index;
      const sekolah = entry.querySelector(`[name="pendidikan_sekolah_${idx}"]`)?.value || '';
      const dari = entry.querySelector(`[name="pendidikan_dari_${idx}"]`)?.value || '';
      const ke = entry.querySelector(`[name="pendidikan_ke_${idx}"]`)?.value || '';
      const kualifikasi = entry.querySelector(`[name="pendidikan_kualifikasi_${idx}"]`)?.value || '';
      if (sekolah || dari || ke || kualifikasi) {
        pendidikanEntries.push({ sekolah, dari, ke, kualifikasi });
      }
    });
    formData.append('pendidikan', JSON.stringify(pendidikanEntries));

    // Collect bahasa entries
    const bahasaEntries = [];
    document.getElementById('bahasaContainer').querySelectorAll('tr').forEach(tr => {
      const idx = tr.dataset.index;
      const nama = tr.querySelector(`[name="bahasa_nama_${idx}"]`)?.value || '';
      const bicara = tr.querySelector(`[name="bahasa_bicara_${idx}"]`)?.value || '';
      const nulis = tr.querySelector(`[name="bahasa_nulis_${idx}"]`)?.value || '';
      if (nama) {
        bahasaEntries.push({ nama, bicara, nulis });
      }
    });
    formData.append('bahasa', JSON.stringify(bahasaEntries));

    // Collect pengalaman entries
    const pengalamanEntries = [];
    document.getElementById('pengalamanContainer').querySelectorAll('.card-entry').forEach(entry => {
      const idx = entry.dataset.index;
      const perusahaan = entry.querySelector(`[name="pengalaman_perusahaan_${idx}"]`)?.value || '';
      const jabatan = entry.querySelector(`[name="pengalaman_jabatan_${idx}"]`)?.value || '';
      const mulai = entry.querySelector(`[name="pengalaman_mulai_${idx}"]`)?.value || '';
      const selesai = entry.querySelector(`[name="pengalaman_selesai_${idx}"]`)?.value || '';
      const alamat = entry.querySelector(`[name="pengalaman_alamat_${idx}"]`)?.value || '';
      const telp = entry.querySelector(`[name="pengalaman_telp_${idx}"]`)?.value || '';
      const tugas = entry.querySelector(`[name="pengalaman_tugas_${idx}"]`)?.value || '';
      const gaji_mulai = entry.querySelector(`[name="pengalaman_gaji_mulai_${idx}"]`)?.value || '';
      const gaji_akhir = entry.querySelector(`[name="pengalaman_gaji_akhir_${idx}"]`)?.value || '';
      const alasan = entry.querySelector(`[name="pengalaman_alasan_${idx}"]`)?.value || '';

      if (perusahaan || jabatan) {
        pengalamanEntries.push({ perusahaan, jabatan, mulai, selesai, alamat, telp, tugas, gaji_mulai, gaji_akhir, alasan });
      }
    });
    formData.append('pengalaman', JSON.stringify(pengalamanEntries));

    // Collect keluarga entries
    const keluargaEntries = [];
    document.getElementById('keluargaContainer').querySelectorAll('.card-entry').forEach(entry => {
      const idx = entry.dataset.index;
      const nama = entry.querySelector(`[name="keluarga_nama_${idx}"]`)?.value || '';
      const hubungan = entry.querySelector(`[name="keluarga_hubungan_${idx}"]`)?.value || '';
      const usia = entry.querySelector(`[name="keluarga_usia_${idx}"]`)?.value || '';
      const pekerjaan = entry.querySelector(`[name="keluarga_pekerjaan_${idx}"]`)?.value || '';
      const dukungan = entry.querySelector(`input[name="keluarga_dukungan_${idx}"]:checked`)?.value || 'Tidak';
      if (nama || hubungan) {
        keluargaEntries.push({ nama, hubungan, usia, pekerjaan, dukungan });
      }
    });
    formData.append('keluarga', JSON.stringify(keluargaEntries));

    // Files
    const fotoFile = document.getElementById('foto').files[0];
    const ktpFile = document.getElementById('ktp_file').files[0];
    const cvFile = document.getElementById('cv_file').files[0];
    if (fotoFile) formData.append('foto', fotoFile);
    if (ktpFile) formData.append('ktp_file', ktpFile);
    if (cvFile) formData.append('cv_file', cvFile);

    const response = await fetch('/api/applications', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    loading.classList.remove('active');

    if (result.success) {
      document.getElementById('refNumber').textContent = result.app_id;
      document.getElementById('successModal').classList.add('active');
    } else {
      alert(result.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  } catch (error) {
    loading.classList.remove('active');
    console.error('Submit error:', error);
    alert('Terjadi kesalahan koneksi. Silakan coba lagi.');
  }
});

function resetForm() {
  document.getElementById('successModal').classList.remove('active');
  document.getElementById('applicationForm').reset();

  // Reset file upload cards
  document.querySelectorAll('.upload-card').forEach(card => card.classList.remove('has-file'));
  document.querySelectorAll('.file-name').forEach(el => el.textContent = '');

  // Reset usia and jumlah anak
  document.getElementById('usia').value = '';
  document.getElementById('jumlahAnakGroup').style.display = 'none';
  document.getElementById('jumlah_anak').value = '';

  // Reset to step 1
  currentStep = 1;
  updateProgress();

  // Reset dynamic entries
  const pendContainer = document.getElementById('pendidikanContainer');
  while (pendContainer.children.length > 1) pendContainer.removeChild(pendContainer.lastChild);
  const bahasContainer = document.getElementById('bahasaContainer');
  while (bahasContainer.children.length > 1) bahasContainer.removeChild(bahasContainer.lastChild);
  const pengContainer = document.getElementById('pengalamanContainer');
  while (pengContainer.children.length > 1) pengContainer.removeChild(pengContainer.lastChild);
  const kelContainer = document.getElementById('keluargaContainer');
  while (kelContainer.children.length > 1) kelContainer.removeChild(kelContainer.lastChild);

  pendidikanCount = 1;
  bahasaCount = 1;
  pengalamanCount = 1;
  keluargaCount = 1;
  updateRemoveButtons('pendidikan');
  updateRemoveButtonsBahasa();
  updateRemoveButtons('pengalaman');
}

// Initialize
updateProgress();
updateRemoveButtonsBahasa();
