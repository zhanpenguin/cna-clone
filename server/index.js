import express from "express";
import cors from "cors";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath, pathToFileURL } from "node:url";
import { categories as SEED_CATEGORIES, buildArticles, buildTrending } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDataDir() {
  if (process.env.CNA_DATA_DIR) return path.resolve(process.env.CNA_DATA_DIR);
  const defaultDir = path.join(__dirname, "data");
  try {
    fs.mkdirSync(defaultDir, { recursive: true });
    fs.accessSync(defaultDir, fs.constants.W_OK);
    return defaultDir;
  } catch {
    // Read-only filesystem (e.g. Vercel serverless) — fall back to a writable temp dir.
    const tmpDir = path.join(os.tmpdir(), "cna-data");
    fs.mkdirSync(tmpDir, { recursive: true });
    return tmpDir;
  }
}

const DATA_DIR = resolveDataDir();
const DB_FILE = process.env.CNA_DB_FILE
  ? path.resolve(process.env.CNA_DB_FILE)
  : path.join(DATA_DIR, "cna.db");

// --- SQLite storage ---------------------------------------------------------
const db = new DatabaseSync(DB_FILE);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ord INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  category TEXT DEFAULT '',
  author TEXT,
  imageUrl TEXT DEFAULT '',
  publishedAt TEXT NOT NULL,
  updatedAt TEXT,
  featured INTEGER DEFAULT 0,
  breaking INTEGER DEFAULT 0,
  trending INTEGER DEFAULT 0,
  kind TEXT DEFAULT 'article',
  duration TEXT,
  tags TEXT DEFAULT '[]',
  body TEXT DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

const defaultSettings = () => ({
  siteName: "CNA",
  tagline: "Channel News Asia",
  edition: "Singapore",
  editions: [
    { id: "sg", name: "Singapore", flag: "🇸🇬" },
    { id: "id", name: "Indonesia", flag: "🇮🇩" },
    { id: "hk", name: "Hong Kong, China", flag: "🇭🇰" },
  ],
});

function rowToArticle(r) {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary ?? "",
    category: r.category ?? "",
    author: r.author ?? null,
    imageUrl: r.imageUrl ?? "",
    publishedAt: r.publishedAt,
    updatedAt: r.updatedAt ?? null,
    featured: !!r.featured,
    breaking: !!r.breaking,
    trending: !!r.trending,
    kind: r.kind ?? "article",
    duration: r.duration ?? null,
    tags: JSON.parse(r.tags || "[]"),
    body: JSON.parse(r.body || "[]"),
  };
}

function rowToCategory(r) {
  return { id: r.id, name: r.name, slug: r.slug, order: r.ord };
}

const articleParams = (a) => [
  a.title,
  a.summary ?? "",
  a.category ?? "",
  a.author ?? null,
  a.imageUrl ?? "",
  a.publishedAt,
  a.updatedAt ?? null,
  a.featured ? 1 : 0,
  a.breaking ? 1 : 0,
  a.trending ? 1 : 0,
  a.kind ?? "article",
  a.duration ?? null,
  JSON.stringify(a.tags ?? []),
  JSON.stringify(a.body ?? []),
];

function allArticlesSorted() {
  return db
    .prepare("SELECT * FROM articles")
    .all()
    .map(rowToArticle)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

function getMeta(key, fallback) {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? JSON.parse(row.value) : fallback;
}

function setMeta(key, value) {
  db.prepare(
    "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, JSON.stringify(value));
}

function seedDatabase() {
  const insCat = db.prepare("INSERT INTO categories (id, name, slug, ord) VALUES (?, ?, ?, ?)");
  for (const c of SEED_CATEGORIES) insCat.run(c.id, c.name, c.slug, c.order);

  const insArt = db.prepare(
    `INSERT INTO articles (id, title, summary, category, author, imageUrl, publishedAt, updatedAt,
      featured, breaking, trending, kind, duration, tags, body)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const a of buildArticles()) {
    insArt.run(
      a.id, a.title, a.summary ?? "", a.category, a.author, a.imageUrl,
      a.publishedAt, a.updatedAt, a.featured ? 1 : 0, a.breaking ? 1 : 0,
      a.trending ? 1 : 0, a.kind, a.duration,
      JSON.stringify(a.tags ?? []), JSON.stringify(a.body ?? [])
    );
  }

  setMeta("settings", defaultSettings());
  setMeta("trending", buildTrending());
}

if (db.prepare("SELECT COUNT(*) AS c FROM articles").get().c === 0) {
  seedDatabase();
}

// --- Auth (demo only) -------------------------------------------------------
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const tokens = new Set();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token && tokens.has(token)) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// --- Auth routes ------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = crypto.randomBytes(24).toString("hex");
    tokens.add(token);
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  tokens.delete(token);
  res.json({ ok: true });
});

// --- Public routes ----------------------------------------------------------
app.get("/api/articles", (req, res) => {
  let items = allArticlesSorted();

  const { category, featured, breaking, trending, kind, q, limit } = req.query;
  if (category) items = items.filter((a) => a.category === category);
  if (featured === "true") items = items.filter((a) => a.featured);
  if (breaking === "true") items = items.filter((a) => a.breaking);
  if (trending === "true") items = items.filter((a) => a.trending);
  if (kind) items = items.filter((a) => a.kind === kind);
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        (a.summary || "").toLowerCase().includes(needle)
    );
  }
  if (limit) {
    const n = Number(limit);
    if (Number.isFinite(n) && n > 0) items = items.slice(0, n);
  }
  res.json(items);
});

app.get("/api/articles/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(rowToArticle(row));
});

app.get("/api/categories", (_req, res) => {
  res.json(db.prepare("SELECT * FROM categories ORDER BY ord").all().map(rowToCategory));
});

app.get("/api/trending", (_req, res) => {
  const ids = getMeta("trending", []);
  const list = ids
    .map((id) => db.prepare("SELECT * FROM articles WHERE id = ?").get(id))
    .filter(Boolean)
    .map(rowToArticle);
  res.json(list);
});

app.get("/api/settings", (_req, res) => {
  res.json(getMeta("settings", defaultSettings()));
});

// --- Admin routes -----------------------------------------------------------
app.get("/api/admin/articles", requireAuth, (_req, res) => {
  res.json(allArticlesSorted());
});

app.post("/api/admin/articles", requireAuth, (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "Title is required" });
  const firstCategory = db.prepare("SELECT slug FROM categories ORDER BY ord LIMIT 1").get();
  const article = {
    id: `art-${Date.now()}`,
    title: "",
    summary: "",
    category: firstCategory?.slug || "singapore",
    author: null,
    imageUrl: "",
    publishedAt: new Date().toISOString(),
    updatedAt: null,
    featured: false,
    breaking: false,
    trending: false,
    kind: "article",
    duration: null,
    tags: [],
    body: [],
    ...body,
    title,
  };
  db.prepare(
    `INSERT INTO articles (id, title, summary, category, author, imageUrl, publishedAt, updatedAt,
      featured, breaking, trending, kind, duration, tags, body)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    article.id, article.title, article.summary ?? "", article.category, article.author,
    article.imageUrl, article.publishedAt, article.updatedAt,
    article.featured ? 1 : 0, article.breaking ? 1 : 0, article.trending ? 1 : 0,
    article.kind, article.duration,
    JSON.stringify(article.tags ?? []), JSON.stringify(article.body ?? [])
  );
  res.status(201).json(article);
});

app.put("/api/admin/articles/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const merged = { ...rowToArticle(row), ...(req.body || {}), id: req.params.id };
  db.prepare(
    `UPDATE articles SET title = ?, summary = ?, category = ?, author = ?, imageUrl = ?,
      publishedAt = ?, updatedAt = ?, featured = ?, breaking = ?, trending = ?,
      kind = ?, duration = ?, tags = ?, body = ? WHERE id = ?`
  ).run(...articleParams(merged), req.params.id);
  res.json(merged);
});

app.delete("/api/admin/articles/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
  const ids = getMeta("trending", []).filter((id) => id !== req.params.id);
  setMeta("trending", ids);
  res.json({ ok: true });
});

app.post("/api/admin/categories", requireAuth, (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.slug)
    return res.status(400).json({ error: "Name and slug are required" });
  const existing = db.prepare("SELECT 1 AS x FROM categories WHERE slug = ?").get(body.slug);
  if (existing) return res.status(409).json({ error: "Slug already exists" });
  const ord = db.prepare("SELECT COALESCE(MAX(ord), 0) + 1 AS n FROM categories").get().n;
  const category = { id: `cat-${Date.now()}`, name: body.name, slug: body.slug, order: ord };
  db.prepare("INSERT INTO categories (id, name, slug, ord) VALUES (?, ?, ?, ?)").run(
    category.id, category.name, category.slug, category.order
  );
  res.status(201).json(category);
});

app.put("/api/admin/categories/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const merged = { ...rowToCategory(row), ...(req.body || {}), id: req.params.id };
  const dup = db
    .prepare("SELECT 1 AS x FROM categories WHERE slug = ? AND id != ?")
    .get(merged.slug, merged.id);
  if (dup) return res.status(409).json({ error: "Slug already exists" });
  db.prepare("UPDATE categories SET name = ?, slug = ?, ord = ? WHERE id = ?").run(
    merged.name, merged.slug, merged.order, merged.id
  );
  res.json(merged);
});

app.delete("/api/admin/categories/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.put("/api/admin/trending", requireAuth, (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
  const valid = ids.filter((id) => db.prepare("SELECT 1 AS x FROM articles WHERE id = ?").get(id));
  setMeta("trending", valid);
  res.json(valid);
});

// --- Syndication feeds (publisher features) --------------------------------
const escXml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

app.get("/api/rss.xml", (_req, res) => {
  const items = allArticlesSorted()
    .slice(0, 20)
    .map(
      (a) => `    <item>
      <title>${escXml(a.title)}</title>
      <link>https://localhost:5173/#/article/${a.id}</link>
      <description>${escXml(a.summary || "")}</description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category>${escXml(a.category)}</category>
    </item>`
    )
    .join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>CNA Demo</title>\n    <link>https://localhost:5173/</link>\n    <description>Demo news feed</description>\n${items}\n  </channel>\n</rss>`
  );
});

app.get("/api/sitemap.xml", (_req, res) => {
  const urls = allArticlesSorted()
    .map(
      (a) =>
        `  <url><loc>https://localhost:5173/#/article/${a.id}</loc><lastmod>${new Date(
          a.publishedAt
        ).toISOString().slice(0, 10)}</lastmod></url>`
    )
    .join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

app.get("/api/sitemap-news.xml", (_req, res) => {
  const urls = allArticlesSorted()
    .slice(0, 50)
    .map(
      (a) =>
        `  <url><loc>https://localhost:5173/#/article/${a.id}</loc><news:news><news:publication><news:name>CNA Demo</news:name><news:language>en</news:language></news:publication><news:publication_date>${new Date(
          a.publishedAt
        ).toISOString().slice(0, 10)}</news:publication_date><news:title>${escXml(a.title)}</news:title></news:news></url>`
    )
    .join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls}\n</urlset>`
  );
});

// --- Serve built client (optional, for `npm run build` + `npm start`) --------
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;

export function createApp() {
  return app;
}

export function closeDb() {
  db.close();
}

// Only auto-listen when run directly (not when imported by tests)
const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`CNA clone API running at http://localhost:${PORT}`);
    console.log(`Database: ${DB_FILE}`);
    console.log(`Admin login: ${ADMIN_USER} / ${ADMIN_PASS}`);
  });
}
