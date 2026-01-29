const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const ROOT_DIR = __dirname;
const HOST = process.env.HOST || "localhost";
const PORT = Number(process.env.PORT) || 8443;
const CERT_PATH = process.env.CERT_PATH || path.join(ROOT_DIR, "certs", "localhost.pem");
const KEY_PATH = process.env.KEY_PATH || path.join(ROOT_DIR, "certs", "localhost-key.pem");
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "warehouse.db");

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readFileOrExit(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`${label} not found at ${filePath}.`);
    console.error("Generate a local cert first (see README).");
    process.exit(1);
  }
  return fs.readFileSync(filePath);
}

function buildStateKey(warehouse, date) {
  const safeWarehouse = (warehouse || "default").trim() || "default";
  const safeDate = (date || "nodate").trim() || "nodate";
  return `${safeWarehouse}::${safeDate}`;
}

ensureDirectory(DATA_DIR);
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS warehouse_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_key TEXT UNIQUE NOT NULL,
      warehouse TEXT,
      date TEXT,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  );
});

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(ROOT_DIR));

app.get("/api/state", (req, res) => {
  const { warehouse, date } = req.query;
  const stateKey = buildStateKey(warehouse, date);

  db.get(
    "SELECT warehouse, date, data, updated_at FROM warehouse_state WHERE state_key = ?",
    [stateKey],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: "Failed to read state." });
        return;
      }
      if (!row) {
        res.status(204).send();
        return;
      }
      res.json({
        warehouse: row.warehouse,
        date: row.date,
        items: JSON.parse(row.data),
        updatedAt: row.updated_at,
      });
    }
  );
});

app.post("/api/state", (req, res) => {
  const { warehouse, date, items } = req.body || {};
  const stateKey = buildStateKey(warehouse, date);

  if (!Array.isArray(items)) {
    res.status(400).json({ error: "Items must be an array." });
    return;
  }

  const payload = JSON.stringify(items);
  const timestamp = new Date().toISOString();

  db.run(
    `INSERT INTO warehouse_state (state_key, warehouse, date, data, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(state_key)
     DO UPDATE SET warehouse = excluded.warehouse,
                   date = excluded.date,
                   data = excluded.data,
                   updated_at = excluded.updated_at`,
    [stateKey, warehouse || null, date || null, payload, timestamp],
    (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to save state." });
        return;
      }
      res.json({ ok: true, updatedAt: timestamp });
    }
  );
});

const key = readFileOrExit(KEY_PATH, "TLS key");
const cert = readFileOrExit(CERT_PATH, "TLS certificate");

https.createServer({ key, cert }, app).listen(PORT, HOST, () => {
  console.log(`HTTPS server running at https://${HOST}:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
