import { useParams, Link } from "react-router-dom";
import { useData } from "../App.jsx";
import { StandardCard, HorizontalCard } from "../components/ArticleCard.jsx";
import { categorySlugToName } from "../utils.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const { articles, categories } = useData();
  const name = categorySlugToName(slug, categories);

  const list = articles
    .filter((a) => a.category === slug)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const [first, ...rest] = list;

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>{name}</h1>
      </div>

      {first ? (
        <>
          <div className="grid cols-2">
            <StandardCard article={first} />
            <div>
              {rest.slice(0, 4).map((a) => (
                <HorizontalCard key={a.id} article={a} />
              ))}
            </div>
          </div>
          <div className="grid cols-3" style={{ marginTop: 26 }}>
            {rest.slice(4).map((a) => (
              <StandardCard key={a.id} article={a} showSummary={false} />
            ))}
          </div>
        </>
      ) : (
        <p className="muted">
          No stories in this section yet.{" "}
          <Link to="/admin" style={{ color: "var(--red)" }}>
            Add one in the admin panel.
          </Link>
        </p>
      )}
    </div>
  );
}
