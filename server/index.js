import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function assertDb() {
  if (!supabase) {
    throw new Error("Supabase is not configured — set SUPABASE_URL and SUPABASE_ANON_KEY");
  }
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
  assertDb();
  const { data, error } = await supabase.from("articles").select("*");
  if (error) throw error;
  return (data || [])
    .map(rowToArticle)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function getMeta(key, fallback) {
  assertDb();
  const { data, error } = await supabase
    .from("meta")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? JSON.parse(data.value) : fallback;
}

async function setMeta(key, value) {
  assertDb();
  const { error } = await supabase
    .from("meta")
    .upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });
  if (error) throw error;
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
    assertDb();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(rowToArticle(data));
  })
);

app.get(
  "/api/categories",
  asyncRoute(async (_req, res) => {
    assertDb();
    const { data, error } = await supabase.from("categories").select("*").order("ord");
    if (error) throw error;
    res.json((data || []).map(rowToCategory));
  })
);

app.get(
  "/api/trending",
  asyncRoute(async (_req, res) => {
    const ids = await getMeta("trending", []);
    if (!ids.length) return res.json([]);
    assertDb();
    const { data, error } = await supabase.from("articles").select("*").in("id", ids);
    if (error) throw error;
    const rows = data || [];
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
    supabaseConfigured: !!supabase,
    supabaseUrl: SUPABASE_URL || null,
    hasAnonKey: !!SUPABASE_ANON_KEY,
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
    assertDb();
    const { data: firstCategory } = await supabase
      .from("categories")
      .select("slug")
      .order("ord")
      .limit(1)
      .maybeSingle();
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
    const { data, error } = await supabase
      .from("articles")
      .insert(articleRow(article))
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(rowToArticle(data));
  })
);

app.put(
  "/api/admin/articles/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    assertDb();
    const { data: existing, error: findErr } = await supabase
      .from("articles")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return res.status(404).json({ error: "Not found" });
    const merged = { ...rowToArticle(existing), ...(req.body || {}), id: req.params.id };
    const { data, error } = await supabase
      .from("articles")
      .update(articleRow(merged))
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(rowToArticle(data));
  })
);

app.delete(
  "/api/admin/articles/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    assertDb();
    const { data: existing, error: findErr } = await supabase
      .from("articles")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return res.status(404).json({ error: "Not found" });
    const { error } = await supabase.from("articles").delete().eq("id", req.params.id);
    if (error) throw error;
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
    assertDb();
    const { data: existing } = await supabase
      .from("categories")
      .select("slug")
      .eq("slug", body.slug)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "Slug already exists" });
    const { data: maxRow } = await supabase
      .from("categories")
      .select("ord")
      .order("ord", { ascending: false })
      .limit(1)
      .maybeSingle();
    const category = {
      id: `cat-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      ord: (maxRow?.ord || 0) + 1,
    };
    const { data, error } = await supabase
      .from("categories")
      .insert({ id: category.id, name: category.name, slug: category.slug, ord: category.ord })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(rowToCategory(data));
  })
);

app.put(
  "/api/admin/categories/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    assertDb();
    const { data: existing, error: findErr } = await supabase
      .from("categories")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return res.status(404).json({ error: "Not found" });
    const merged = { ...rowToCategory(existing), ...(req.body || {}), id: req.params.id };
    const { data: dup } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", merged.slug)
      .neq("id", merged.id)
      .maybeSingle();
    if (dup) return res.status(409).json({ error: "Slug already exists" });
    const { data, error } = await supabase
      .from("categories")
      .update({ name: merged.name, slug: merged.slug, ord: merged.ord })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(rowToCategory(data));
  })
);

app.delete(
  "/api/admin/categories/:id",
  requireAuth,
  asyncRoute(async (req, res) => {
    assertDb();
    const { data: existing, error: findErr } = await supabase
      .from("categories")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findErr) throw findErr;
    if (!existing) return res.status(404).json({ error: "Not found" });
    const { error } = await supabase.from("categories").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  })
);

app.put(
  "/api/admin/trending",
  requireAuth,
  asyncRoute(async (req, res) => {
    const { ids } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ error: "ids array required" });
    assertDb();
    const { data } = await supabase.from("articles").select("id").in("id", ids);
    const existingIds = new Set((data || []).map((a) => a.id));
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

// --- Serve built client (optional, for `npm run build` + `npm start`) --------
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

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
const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`CNA clone API running at http://localhost:${PORT}`);
    console.log(`Supabase: ${SUPABASE_URL || "(not configured)"}`);
  });
}
