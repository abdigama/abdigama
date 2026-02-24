const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'applications.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ applications: [], nextId: 1 }, null, 2));
}

function readDb() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { applications: [], nextId: 1 };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const db = {
  // Insert a new application
  insert(record) {
    const data = readDb();
    const id = data.nextId++;
    const entry = {
      id,
      ...record,
      created_at: new Date().toISOString(),
      status: 'baru'
    };
    data.applications.push(entry);
    writeDb(data);
    return { lastInsertRowid: id };
  },

  // Get all applications with optional filters
  getAll({ search, status, page = 1, limit = 20 } = {}) {
    const data = readDb();
    let results = [...data.applications];

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(a =>
        (a.nama_lengkap || '').toLowerCase().includes(s) ||
        (a.email || '').toLowerCase().includes(s) ||
        (a.posisi_dilamar || '').toLowerCase().includes(s) ||
        (a.no_hp || '').toLowerCase().includes(s)
      );
    }

    // Filter by status
    if (status && status !== 'semua') {
      results = results.filter(a => a.status === status);
    }

    // Sort by created_at DESC
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = results.length;
    const offset = (page - 1) * limit;
    const paginated = results.slice(offset, offset + limit);

    return {
      data: paginated,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get single application by ID
  getById(id) {
    const data = readDb();
    return data.applications.find(a => a.id === parseInt(id)) || null;
  },

  // Update status
  updateStatus(id, status) {
    const data = readDb();
    const app = data.applications.find(a => a.id === parseInt(id));
    if (app) {
      app.status = status;
      writeDb(data);
      return true;
    }
    return false;
  },

  // Delete application
  delete(id) {
    const data = readDb();
    const app = data.applications.find(a => a.id === parseInt(id));
    if (app) {
      data.applications = data.applications.filter(a => a.id !== parseInt(id));
      writeDb(data);
      return app;
    }
    return null;
  },

  // Get all (no pagination) for export
  getAllForExport() {
    const data = readDb();
    return [...data.applications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

module.exports = db;
