// ===================== State =====================
let currentStep = 1;
const totalSteps = 4;
let pendidikanCount = 1;
let pengalamanCount = 1;

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
            { id: 'jenis_kelamin', msg: 'Pilih jenis kelamin' },
            { id: 'nik', msg: 'NIK wajib diisi (16 digit)' },
            { id: 'no_hp', msg: 'Nomor HP wajib diisi' },
            { id: 'email', msg: 'Email wajib diisi' }
        ];

        fields.forEach(f => {
            const el = document.getElementById(f.id);
            const errEl = document.getElementById(`error-${f.id}`);
            if (!el.value.trim()) {
                el.classList.add('invalid');
                if (errEl) { errEl.textContent = f.msg; errEl.classList.add('visible'); }
                valid = false;
            }
        });

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

    if (step === 4) {
        const posisi = document.getElementById('posisi_dilamar');
        const errPosisi = document.getElementById('error-posisi_dilamar');
        if (!posisi.value.trim()) {
            posisi.classList.add('invalid');
            if (errPosisi) { errPosisi.textContent = 'Posisi yang dilamar wajib diisi'; errPosisi.classList.add('visible'); }
            valid = false;
        }

        const persetujuan = document.getElementById('persetujuan');
        const errPersetujuan = document.getElementById('error-persetujuan');
        if (!persetujuan.checked) {
            if (errPersetujuan) { errPersetujuan.textContent = 'Anda harus menyetujui pernyataan ini'; errPersetujuan.classList.add('visible'); }
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
      <div class="form-group">
        <label>Jenjang Pendidikan</label>
        <select name="pendidikan_jenjang_${index}">
          <option value="">-- Pilih --</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA/SMK">SMA/SMK</option>
          <option value="D1">D1</option><option value="D2">D2</option><option value="D3">D3</option>
          <option value="D4/S1">D4/S1</option>
          <option value="S2">S2</option><option value="S3">S3</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nama Institusi</label>
        <input type="text" name="pendidikan_institusi_${index}" placeholder="Nama sekolah/universitas">
      </div>
      <div class="form-group">
        <label>Jurusan / Program Studi</label>
        <input type="text" name="pendidikan_jurusan_${index}" placeholder="Jurusan atau bidang studi">
      </div>
      <div class="form-group">
        <label>Tahun Lulus</label>
        <input type="number" name="pendidikan_tahun_${index}" placeholder="2024" min="1970" max="2030">
      </div>
    </div>
  `;
    container.appendChild(entry);
    entry.style.animation = 'fadeSlideIn 0.4s ease';

    // Show remove button on first entry if more than one
    updateRemoveButtons('pendidikan');
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
    <div class="form-grid">
      <div class="form-group">
        <label>Nama Perusahaan</label>
        <input type="text" name="pengalaman_perusahaan_${index}" placeholder="Nama perusahaan">
      </div>
      <div class="form-group">
        <label>Jabatan / Posisi</label>
        <input type="text" name="pengalaman_jabatan_${index}" placeholder="Jabatan Anda">
      </div>
      <div class="form-group">
        <label>Periode Mulai</label>
        <input type="month" name="pengalaman_mulai_${index}">
      </div>
      <div class="form-group">
        <label>Periode Selesai</label>
        <input type="month" name="pengalaman_selesai_${index}">
      </div>
      <div class="form-group full-width">
        <label>Alasan Keluar</label>
        <input type="text" name="pengalaman_alasan_${index}" placeholder="Alasan meninggalkan pekerjaan">
      </div>
    </div>
  `;
    container.appendChild(entry);
    entry.style.animation = 'fadeSlideIn 0.4s ease';

    updateRemoveButtons('pengalaman');
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
    const container = type === 'pendidikan' ? 'pendidikanContainer' : 'pengalamanContainer';
    const entries = document.getElementById(container).querySelectorAll('.card-entry');
    entries.forEach(entry => {
        const removeBtn = entry.querySelector('.btn-remove-entry');
        if (removeBtn) {
            removeBtn.style.display = entries.length > 1 ? 'flex' : 'none';
        }
    });
}

function renumberEntries(type) {
    const container = type === 'pendidikan' ? 'pendidikanContainer' : 'pengalamanContainer';
    const label = type === 'pendidikan' ? 'Pendidikan' : 'Pengalaman';
    const entries = document.getElementById(container).querySelectorAll('.card-entry');
    entries.forEach((entry, i) => {
        entry.querySelector('h3').textContent = `${label} #${i + 1}`;
    });
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

    if (!validateStep(4)) return;

    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');

    try {
        const formData = new FormData();

        // Basic fields
        const basicFields = [
            'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'usia', 'jenis_kelamin',
            'agama', 'status_pernikahan', 'jumlah_anak', 'nik',
            'tinggi_badan', 'berat_badan', 'alamat_ktp', 'alamat_domisili',
            'no_hp', 'email',
            'posisi_dilamar', 'gaji_diharapkan', 'tanggal_mulai'
        ];
        basicFields.forEach(field => {
            const el = document.getElementById(field);
            if (el) formData.append(field, el.value);
        });

        // Persetujuan
        formData.append('persetujuan', document.getElementById('persetujuan').checked ? 'true' : 'false');

        // Collect pendidikan entries
        const pendidikanEntries = [];
        document.getElementById('pendidikanContainer').querySelectorAll('.card-entry').forEach(entry => {
            const idx = entry.dataset.index;
            const jenjang = entry.querySelector(`[name="pendidikan_jenjang_${idx}"]`)?.value || '';
            const institusi = entry.querySelector(`[name="pendidikan_institusi_${idx}"]`)?.value || '';
            const jurusan = entry.querySelector(`[name="pendidikan_jurusan_${idx}"]`)?.value || '';
            const tahun = entry.querySelector(`[name="pendidikan_tahun_${idx}"]`)?.value || '';
            if (jenjang || institusi || jurusan || tahun) {
                pendidikanEntries.push({ jenjang, institusi, jurusan, tahun });
            }
        });
        formData.append('pendidikan', JSON.stringify(pendidikanEntries));

        // Collect pengalaman entries
        const pengalamanEntries = [];
        document.getElementById('pengalamanContainer').querySelectorAll('.card-entry').forEach(entry => {
            const idx = entry.dataset.index;
            const perusahaan = entry.querySelector(`[name="pengalaman_perusahaan_${idx}"]`)?.value || '';
            const jabatan = entry.querySelector(`[name="pengalaman_jabatan_${idx}"]`)?.value || '';
            const mulai = entry.querySelector(`[name="pengalaman_mulai_${idx}"]`)?.value || '';
            const selesai = entry.querySelector(`[name="pengalaman_selesai_${idx}"]`)?.value || '';
            const alasan = entry.querySelector(`[name="pengalaman_alasan_${idx}"]`)?.value || '';
            if (perusahaan || jabatan) {
                pengalamanEntries.push({ perusahaan, jabatan, mulai, selesai, alasan });
            }
        });
        formData.append('pengalaman', JSON.stringify(pengalamanEntries));

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
            document.getElementById('refNumber').textContent = `APP-${String(result.id).padStart(5, '0')}`;
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
    const pengContainer = document.getElementById('pengalamanContainer');
    while (pengContainer.children.length > 1) pengContainer.removeChild(pengContainer.lastChild);

    pendidikanCount = 1;
    pengalamanCount = 1;
    updateRemoveButtons('pendidikan');
    updateRemoveButtons('pengalaman');
}

// Initialize
updateProgress();
