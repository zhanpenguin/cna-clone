import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { useData } from "../App.jsx";
import { timeAgo, categoryName, fmtDate } from "../utils.js";
import { HorizontalCard } from "../components/ArticleCard.jsx";

const SHARE = [
  { label: "WhatsApp", href: "https://wa.me/?text=" },
  { label: "Telegram", href: "https://t.me/share/url?url=" },
  { label: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" },
  { label: "Twitter", href: "https://twitter.com/intent/tweet?url=" },
  { label: "LinkedIn", href: "https://www.linkedin.com/sharing/share-offsite/?url=" },
  { label: "Email", href: "mailto:?subject=" },
];

export default function ArticlePage() {
  const { id } = useParams();
  const { categories, articles, bookmarks, toggleBookmark } = useData();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .article(id)
      .then((a) => mounted && setArticle(a))
      .catch(() => mounted && setNotFound(true));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="wrap" style={{ padding: "60px 20px" }}>
        <h2>Story not found</h2>
        <Link to="/" className="back-link">
          ← Back to homepage
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="wrap" style={{ padding: "60px 20px" }}>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";
  const saved = bookmarks.includes(article.id);
  const related = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="wrap">
      <article className="article-body">
        <Link to={`/category/${article.category}`} className="back-link">
          ← {categoryName(article, categories)}
        </Link>
        <h1>{article.title}</h1>
        {article.summary && <p className="dek">{article.summary}</p>}

        <div className="meta muted" style={{ fontSize: 13 }}>
          {article.author && <strong style={{ color: "var(--blue)" }}>{article.author}</strong>}
          {article.author && " · "}
          {fmtDate(article.publishedAt)}
          {article.updatedAt && (
            <span style={{ marginLeft: 10 }}>
              · Updated: {fmtDate(article.updatedAt)}
            </span>
          )}
        </div>

        <div className="article-actions">
          <button
            className={`share-btn ${saved ? "bookmarked" : ""}`}
            onClick={() => toggleBookmark(article.id)}
          >
            {saved ? "🔖 Bookmarked" : "🔖 Bookmark"}
          </button>
          <span className="share-btn">Share</span>
          {SHARE.map((s) => (
            <a
              key={s.label}
              className="share-btn"
              href={`${s.href}${encodeURIComponent(s.label === "Email" ? `${article.title} ${url}` : `${article.title} ${url}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>

        {article.imageUrl && (
          <div className="cover">
            <img src={article.imageUrl} alt={article.title} />
          </div>
        )}

        <div className="content">
          {(article.body && article.body.length
            ? article.body
            : [article.summary || "Full story coming soon."]
          ).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {article.tags && article.tags.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <h3 style={{ fontSize: 15 }}>Related Topics</h3>
            {article.tags.map((t) => (
              <Link key={t} className="tag-pill" to={`/search/${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        )}

        <div className="promo" style={{ margin: "24px 0" }}>
          <Link className="tile" to="/newsletters">
            <img className="bg" src="https://picsum.photos/seed/cnanewsletter/640/300" alt="" />
            <div className="body">
              <h4>Sign up for our newsletters</h4>
              <span>Get the best of CNA in your inbox</span>
            </div>
          </Link>
          <Link className="tile" to="/app">
            <img className="bg" src="https://picsum.photos/seed/cnaapp2/640/300" alt="" />
            <div className="body">
              <h4>Get the CNA app</h4>
              <span>Breaking alerts on the go</span>
            </div>
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div className="wrap" style={{ maxWidth: 1000, paddingBottom: 60 }}>
          <h2 style={{ fontSize: 19, borderBottom: "2px solid var(--ink)", paddingBottom: 8 }}>
            Also worth reading
          </h2>
          <div className="grid cols-3" style={{ marginTop: 16 }}>
            {related.map((a) => (
              <HorizontalCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
