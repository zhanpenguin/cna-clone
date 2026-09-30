import { useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../App.jsx";
import { HorizontalCard } from "../components/ArticleCard.jsx";

const FACETS = [
  { id: "all", label: "All" },
  { id: "article", label: "News" },
  { id: "video", label: "Videos" },
  { id: "podcast", label: "Podcasts" },
  { id: "visual", label: "Visual Stories" },
];

export default function SearchPage() {
  const { query } = useParams();
  const { articles } = useData();
  const [facet, setFacet] = useState("all");
  const [sort, setSort] = useState("relevance");
  const needle = (query || "").toLowerCase();

  let results = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(needle) ||
      (a.summary || "").toLowerCase().includes(needle)
  );
  if (facet !== "all") results = results.filter((a) => a.kind === facet);
  if (sort === "newest")
    results = [...results].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return (
    <div className="wrap" style={{ paddingBottom: 60 }}>
      <div className="page-head">
        <h1>You searched for “{query}”</h1>
      </div>

      <div className="tabs">
        {FACETS.map((f) => (
          <button key={f.id} className={facet === f.id ? "active" : ""} onClick={() => setFacet(f.id)}>
            {f.label}
          </button>
        ))}
        <button
          className={sort === "newest" ? "active" : ""}
          style={{ marginLeft: "auto" }}
          onClick={() => setSort(sort === "relevance" ? "newest" : "relevance")}
        >
          Sort: {sort === "relevance" ? "Relevance" : "Newest"}
        </button>
      </div>

      <p className="muted">
        Showing {results.length} of {articles.length} results
      </p>

      {results.length === 0 ? (
        <p className="muted">No results found.</p>
      ) : (
        <div className="grid cols-2">
          {results.map((a) => (
            <HorizontalCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
