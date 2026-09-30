import express from "express";
import cors from "cors";
import crypto from "node:crypto";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const REST_BASE = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : "";

function assertDb() {
  if (!REST_BASE || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured — set SUPABASE_URL and SUPABASE_ANON_KEY");
  }
}

function pgHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

async function pg(path, { method = "GET", body, headers = {} } = {}) {
  assertDb();
  const init = { method, headers: pgHeaders(headers) };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await fetch(`${REST_BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res;
}

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
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
    body: Array.isArray(r.body) ? r.body : JSON.parse(r.body || "[]"),
  };
}

function rowToCategory(r) {
  return { id: r.id, name: r.name, slug: r.slug, order: r.ord };
}

const articleRow = (a) => ({
  id: a.id,
  title: a.title,
  summary: a.summary ?? "",
  category: a.category ?? "",
  author: a.author ?? null,
  imageUrl: a.imageUrl ?? "",
  publishedAt: a.publishedAt,
  updatedAt: a.updatedAt ?? null,
  featured: a.featured ? 1 : 0,
  breaking: a.breaking ? 1 : 0,
  trending: a.trending ? 1 : 0,
  kind: a.kind ?? "article",
  duration: a.duration ?? null,
  tags: JSON.stringify(a.tags ?? []),
  body: JSON.stringify(a.body ?? []),
});

async function allArticlesSorted() {
  const res = await pg("/articles?select=*");
  const data = await res.json();
  return data
    .map(rowToArticle)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function getMeta(key, fallback) {
  const res = await pg(`/meta?select=value&key=eq.${encodeURIComponent(key)}`);
  const data = await res.json();
  return data.length ? JSON.parse(data[0].value) : fallback;
}

async function setMeta(key, value) {
  await pg("/meta", {
    method: "POST",
    body: { key, value: JSON.stringify(value) },
    headers: { Prefer: "resolution=merge-duplicates" },
  });
}

// --- Auth (demo only) -------------------------------------------------------
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const tokens = new Set();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

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
app.get(
  "/api/articles",
  asyncRoute(async (req, res) => {
    let items = await allArticlesSorted();

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
  })
);

app.get(
  "/api/articles/:id",
  asyncRoute(async (req, res) => {
    const r = await pg(`/articles?select=*&id=eq.${encodeURIComponent(req.params.id)}`);
    const data = await r.json();
    if (!data.length) return res.status(404).json({ error: "Not found" });
    res.json(rowToArticle(data[0]));
  })
);

app.get(
  "/api/categories",
  asyncRoute(async (_req, res) => {
    const r = await pg("/categories?select=*&order=ord.asc");
    const data = await r.json();
    res.json(data.map(rowToCategory));
  })
);

app.get(
  "/api/trending",
  asyncRoute(async (_req, res) => {
    const ids = await getMeta("trending", []);
    if (!ids.length) return res.json([]);
    const r = await pg(`/articles?select=*&id=in.(${ids.map(encodeURIComponent).join(",")})`);
    const rows = await r.json();
    const list = ids
      .map((id) => rows.find((a) => a.id === id))
      .filter(Boolean)
      .map(rowToArticle);
    res.json(list);
  })
);

app.get(
  "/api/settings",
  asyncRoute(async (_req, res) => {
    res.json(await getMeta("settings", defaultSettings()));
  })
);

// --- Health check (diagnostics) ---------------------------------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    supabaseConfigured: !!(REST_BASE && SUPABASE_ANON_KEY),
    supabaseUrl: SUPABASE_URL || null,
  });
});

// --- Admin routes -----------------------------------------------------------
app.get(
  "/api/admin/articles",
  requireAuth,
  asyncRoute(async (_req, res) => {
    res.json(await allArticlesSorted());
  })
);

app.post(
  "/api/admin/articles",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "Title is required" });
    const catRes = await pg("/categories?select=slug&order=ord.asc&limit=1");
    const cats = await catRes.json();
    const article = {
      id: `art-${Date.now()}`,
      title: "",
      summary: "",
      category: cats[0]?.slug || "singapore",
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
    const r = await pg("/articles", {
      method: "POST",
      body: articleRow(article),
      headers: { Prefer: "return=representation" },
    });
    const data = await r.json();
    res.status(201).json(rowToArticle(Array.isArray(data) ? data[0] : data));
  })
);

app.put(
  "/api/admin/articles/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const found = await pg(`/articles?select=*&id=eq.${encodeURIComponent(req.params.id)}`);
    const existing = await found.json();
    if (!existing.length) return res.status(404).json({ error: "Not found" });
    const merged = { ...rowToArticle(existing[0]), ...(req.body || {}), id: req.params.id };
    const r = await pg(`/articles?id=eq.${encodeURIComponent(req.params.id)}`, {
      method: "PATCH",
      body: articleRow(merged),
      headers: { Prefer: "return=representation" },
    });
    const data = await r.json();
    res.json(rowToArticle(Array.isArray(data) ? data[0] : data));
  })
);

app.delete(
  "/api/admin/articles/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const found = await pg(`/articles?select=id&id=eq.${encodeURIComponent(req.params.id)}`);
    const existing = await found.json();
    if (!existing.length) return res.status(404).json({ error: "Not found" });
    await pg(`/articles?id=eq.${encodeURIComponent(req.params.id)}`, { method: "DELETE" });
    const ids = (await getMeta("trending", [])).filter((id) => id !== req.params.id);
    await setMeta("trending", ids);
    res.json({ ok: true });
  })
);

app.post(
  "/api/admin/categories",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    if (!body.name || !body.slug)
      return res.status(400).json({ error: "Name and slug are required" });
    const dupRes = await pg(`/categories?select=slug&slug=eq.${encodeURIComponent(body.slug)}`);
    const dup = await dupRes.json();
    if (dup.length) return res.status(409).json({ error: "Slug already exists" });
    const maxRes = await pg("/categories?select=ord&order=ord.desc&limit=1");
    const maxRows = await maxRes.json();
    const category = {
      id: `cat-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      ord: (maxRows[0]?.ord || 0) + 1,
    };
    const r = await pg("/categories", {
      method: "POST",
      body: { id: category.id, name: category.name, slug: category.slug, ord: category.ord },
      headers: { Prefer: "return=representation" },
    });
    const data = await r.json();
    res.status(201).json(rowToCategory(Array.isArray(data) ? data[0] : data));
  })
);

app.put(
  "/api/admin/categories/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const found = await pg(`/categories?select=*&id=eq.${encodeURIComponent(req.params.id)}`);
    const existing = await found.json();
    if (!existing.length) return res.status(404).json({ error: "Not found" });
    const merged = { ...rowToCategory(existing[0]), ...(req.body || {}), id: req.params.id };
    const dupRes = await pg(
      `/categories?select=id&slug=eq.${encodeURIComponent(merged.slug)}&id=neq.${encodeURIComponent(merged.id)}`
    );
    const dup = await dupRes.json();
    if (dup.length) return res.status(409).json({ error: "Slug already exists" });
    const r = await pg(`/categories?id=eq.${encodeURIComponent(req.params.id)}`, {
      method: "PATCH",
      body: { name: merged.name, slug: merged.slug, ord: merged.ord },
      headers: { Prefer: "return=representation" },
    });
    const data = await r.json();
    res.json(rowToCategory(Array.isArray(data) ? data[0] : data));
  })
);

app.delete(
  "/api/admin/categories/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    const found = await pg(`/categories?select=id&id=eq.${encodeURIComponent(req.params.id)}`);
    const existing = await found.json();
    if (!existing.length) return res.status(404).json({ error: "Not found" });
    await pg(`/categories?id=eq.${encodeURIComponent(req.params.id)}`, { method: "DELETE" });
    res.json({ ok: true });
  })
);

app.put(
  "/api/admin/trending",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
    const r = await pg(`/articles?select=id&id=in.(${ids.map(encodeURIComponent).join(",")})`);
    const rows = await r.json();
    const existingIds = new Set(rows.map((a) => a.id));
    const valid = ids.filter((id) => existingIds.has(id));
    await setMeta("trending", valid);
    res.json(valid);
  })
);

// --- Syndication feeds (publisher features) --------------------------------
const escXml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

app.get(
  "/api/rss.xml",
  asyncRoute(async (_req, res) => {
    const items = (await allArticlesSorted())
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
  })
);

app.get(
  "/api/sitemap.xml",
  asyncRoute(async (_req, res) => {
    const urls = (await allArticlesSorted())
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
  })
);

app.get(
  "/api/sitemap-news.xml",
  asyncRoute(async (_req, res) => {
    const urls = (await allArticlesSorted())
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
  })
);

// --- Error handler ----------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal server error",
    detail: err?.message || String(err),
  });
});

const PORT = process.env.PORT || 4000;

export function createApp() {
  return app;
}

// Only auto-listen when run directly (not when imported by tests)
const isMain = process.argv[1] && process.argv[1] === import.meta.url.replace("file://", "");
if (isMain) {
  app.listen(PORT, () => {
    console.log(`CNA clone API running at http://localhost:${PORT}`);
    console.log(`Supabase: ${SUPABASE_URL || "(not configured)"}`);
  });
}
