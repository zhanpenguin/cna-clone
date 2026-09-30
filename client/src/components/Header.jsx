import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useData } from "../App.jsx";

const SUBNAV = [
  { to: "/myfeed", label: "My Feed" },
  { to: "/watch", label: "Live TV" },
  { to: "/listen", label: "CNA938" },
  { to: "/newsletters", label: "Newsletters" },
  { to: "/games", label: "Games" },
  { to: "/fast", label: "FAST" },
  { to: "/explains", label: "Explains" },
  { to: "/interactives", label: "Interactives" },
  { to: "/special-reports", label: "Special Reports" },
  { to: "/app", label: "App" },
];

export default function Header({ categories, breakingArticles }) {
  const { settings, edition, setEdition, user } = useData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const editions = settings?.editions || [];

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header>
      <div className="topnav">
        <div className="wrap">
          <Link to="/" className="logo">
            <span className="mark">C</span>
            <span>CNA</span>
          </Link>

          <nav className="navlinks">
            {categories.slice(0, 7).map((c) => (
              <NavLink
                key={c.id}
                to={`/category/${c.slug}`}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {c.name}
              </NavLink>
            ))}
            <NavLink to="/watch" className={({ isActive }) => (isActive ? "active" : "")}>
              Watch
            </NavLink>
            <NavLink to="/listen" className={({ isActive }) => (isActive ? "active" : "")}>
              Listen
            </NavLink>
          </nav>

          <div className="actions">
            <button className="icon-btn" onClick={() => setSearchOpen((s) => !s)} title="Search">
              🔍
            </button>
            <span className="promo-pill">55% Off</span>
            {user ? (
              <Link to="/myfeed" className="btn small">
                {user.name}
              </Link>
            ) : (
              <>
                <Link to="/signin" className="btn small">
                  Log in
                </Link>
                <Link to="/signin" className="btn small primary">
                  Sign up
                </Link>
              </>
            )}
            <Link to="/app" className="btn small">
              Download
            </Link>
          </div>
        </div>
      </div>

      <div className="regionbar">
        <div className="wrap">
          <div className="region-tabs">
            {editions.map((ed) => (
              <button
                key={ed.id}
                className={edition === ed.id ? "active" : ""}
                onClick={() => setEdition(ed.id)}
              >
                <span className="flag">{ed.flag}</span>
                {ed.name}
              </button>
            ))}
          </div>
          <nav className="subnav">
            {SUBNAV.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {s.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {searchOpen && (
        <div className="searchbar">
          <form className="wrap" onSubmit={submitSearch}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keywords, topics and more"
            />
            <button type="submit" className="btn primary">
              Search
            </button>
          </form>
        </div>
      )}

      {breakingArticles.length > 0 && (
        <div className="ticker">
          <div className="wrap">
            <span className="label">Breaking</span>
            <div className="stream">
              {breakingArticles.map((a) => (
                <Link key={a.id} to={`/article/${a.id}`}>
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
