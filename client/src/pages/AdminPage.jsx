import { useEffect, useState } from "react";
import { useData } from "../App.jsx";
import { api } from "../api.js";
import { fmtDate } from "../utils.js";

const TOKEN_KEY = "cna_admin_token";

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");

  const login = async (username, password) => {
    const { token: t } = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  return { token, login, logout };
}

export default function AdminPage() {
  const { token, login, logout } = useAuth();
  const { categories, articles, trending, refresh } = useData();
  const [tab, setTab] = useState("articles");
  const [editing, setEditing] = useState(null); // null | "new" | article
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEditing(null);
  }, [tab]);

  if (!token) {
    return (
      <div className="wrap">
        <Login
          onLogin={async (u, p) => {
            try {
              setError("");
              await login(u, p);
            } catch (e) {
              setError(e.message);
            }
          }}
          error={error}
        />
      </div>
    );
  }

  const saveArticle = async (data) => {
    try {
      setError("");
      if (editing === "new") {
        await api.adminCreateArticle(token, data);
      } else {
        await api.adminUpdateArticle(token, editing.id, data);
      }
      setEditing(null);
      setMessage("Saved.");
      await refresh();
      setTimeout(() => setMessage(""), 2500);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await api.adminDeleteArticle(token, id);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="wrap admin">
      <div className="toolbar">
        <h1 style={{ margin: 0, fontSize: 24 }}>Content Manager</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={tab === "articles" ? "btn primary" : "btn"}
            onClick={() => setTab("articles")}
          >
            Articles
          </button>
          <button
            className={tab === "categories" ? "btn primary" : "btn"}
            onClick={() => setTab("categories")}
          >
            Categories
          </button>
          <button
            className={tab === "trending" ? "btn primary" : "btn"}
            onClick={() => setTab("trending")}
          >
            Trending
          </button>
          <button className="btn" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {message && <div className="notice">{message}</div>}
      {error && <div className="error">{error}</div>}

      {tab === "articles" && !editing && (
        <ArticlesTab
          articles={articles}
          categories={categories}
          onNew={() => setEditing("new")}
          onEdit={(a) => setEditing(a)}
          onDelete={deleteArticle}
        />
      )}

      {tab === "articles" && editing && (
        <ArticleForm
          article={editing === "new" ? null : editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSave={saveArticle}
        />
      )}

      {tab === "categories" && (
        <CategoriesTab
          token={token}
          categories={categories}
          onChanged={refresh}
          setError={setError}
        />
      )}

      {tab === "trending" && (
        <TrendingTab
          token={token}
          articles={articles}
          trending={trending}
          onChanged={refresh}
          setError={setError}
        />
      )}
    </div>
  );
}

function Login({ onLogin, error }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  return (
    <div className="login-card">
      <h2>Admin login</h2>
      <p className="hint">Default credentials: admin / admin123</p>
      {error && <div className="error">{error}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(username, password);
        }}
      >
        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" className="btn primary" style={{ width: "100%" }}>
          Sign in
        </button>
      </form>
    </div>
  );
}

function ArticlesTab({ articles, categories, onNew, onEdit, onDelete }) {
  const nameOf = (slug) => categories.find((c) => c.slug === slug)?.name || slug;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="btn primary" onClick={onNew}>
          + New article
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Section</th>
              <th>Flags</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td style={{ maxWidth: 420 }}>{a.title}</td>
                <td>{nameOf(a.category)}</td>
                <td>
                  <span className={`flag ${a.featured ? "on" : "off"}`}>Featured</span>
                  <span className={`flag ${a.breaking ? "on" : "off"}`}>Breaking</span>
                  <span className={`flag ${a.trending ? "on" : "off"}`}>Trending</span>
                </td>
                <td className="muted">{fmtDate(a.publishedAt)}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="btn small" onClick={() => onEdit(a)}>
                    Edit
                  </button>{" "}
                  <button className="btn small danger" onClick={() => onDelete(a.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ArticleForm({ article, categories, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    title: article?.title || "",
    summary: article?.summary || "",
    category: article?.category || categories[0]?.slug || "",
    author: article?.author || "",
    imageUrl:
      article?.imageUrl ||
      `https://picsum.photos/seed/cna${Math.floor(Math.random() * 10000)}/800/500`,
    kind: article?.kind || "article",
    duration: article?.duration || "",
    featured: article?.featured || false,
    breaking: article?.breaking || false,
    trending: article?.trending || false,
    body: (article?.body || []).join("\n"),
  }));

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      body: form.body
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      publishedAt: article?.publishedAt || new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={submit}>
      <h2 style={{ fontSize: 20 }}>{article ? "Edit article" : "New article"}</h2>
      <div className="form-grid">
        <div className="field full">
          <label>Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Summary / deck</label>
          <textarea
            rows={2}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Author (optional)</label>
          <input value={form.author} onChange={(e) => set("author", e.target.value)} />
        </div>
        <div className="field">
          <label>Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Content type</label>
          <select value={form.kind} onChange={(e) => set("kind", e.target.value)}>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="short">Short</option>
            <option value="podcast">Podcast</option>
            <option value="visual">Visual story</option>
          </select>
        </div>
        <div className="field">
          <label>Duration (e.g. “2m 34s”)</label>
          <input
            value={form.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Body (one paragraph per line)</label>
          <textarea
            rows={6}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
          />
        </div>
        <div className="field full" style={{ display: "flex", gap: 24 }}>
          <label className="check">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            Featured (hero)
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.breaking}
              onChange={(e) => set("breaking", e.target.checked)}
            />
            Breaking
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={form.trending}
              onChange={(e) => set("trending", e.target.checked)}
            />
            Trending
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button type="submit" className="btn primary">
          Save article
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function CategoriesTab({ token, categories, onChanged, setError }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.adminCreateCategory(token, { name, slug });
      setName("");
      setSlug("");
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.adminDeleteCategory(token, id);
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20 }}>Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td className="muted">{c.slug}</td>
              <td>
                <button className="btn small danger" onClick={() => remove(c.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={add} style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <input
          className="field"
          style={{ flex: 1, minWidth: 160, border: "1px solid var(--line-dark)", borderRadius: 4, padding: "9px 12px" }}
          placeholder="Name (e.g. Weather)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          style={{ flex: 1, minWidth: 160, border: "1px solid var(--line-dark)", borderRadius: 4, padding: "9px 12px" }}
          placeholder="Slug (e.g. weather)"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          required
        />
        <button type="submit" className="btn primary">
          Add category
        </button>
      </form>
    </div>
  );
}

function TrendingTab({ token, articles, trending, onChanged, setError }) {
  const [selected, setSelected] = useState(() => trending.map((a) => a.id));
  const [prevTrending, setPrevTrending] = useState(trending);

  // Reset the picker when the underlying trending list changes. Adjusting state
  // during render avoids painting stale selections for a frame (and removes the
  // extra effect + memo from the previous implementation).
  if (prevTrending !== trending) {
    setPrevTrending(trending);
    setSelected(trending.map((a) => a.id));
  }

  const toggle = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const save = async () => {
    try {
      await api.adminSetTrending(token, selected.slice(0, 5));
      await onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20 }}>Trending (pick up to 5)</h2>
      <p className="muted">
        Selected stories appear in the numbered “Trending” list on the homepage.
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={() => toggle(a.id)}
                />
              </td>
              <td>{a.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn primary" onClick={save} style={{ marginTop: 16 }}>
        Save trending
      </button>
    </div>
  );
}
