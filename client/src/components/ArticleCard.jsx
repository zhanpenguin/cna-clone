import { Link } from "react-router-dom";
import { timeAgo, categoryName } from "../utils.js";

function Badges({ article }) {
  return (
    <>
      {article.breaking && <span className="badge red">Breaking</span>}
      {article.featured && <span className="badge outline">Top Story</span>}
      {article.kind === "visual" && <span className="badge gray">Visual</span>}
      {article.kind === "video" && <span className="badge gray">Video</span>}
      {article.kind === "podcast" && <span className="badge gray">Podcast</span>}
    </>
  );
}

export function StandardCard({ article, categories, showSummary = true }) {
  return (
    <article className="card">
      <Link className="thumb" to={`/article/${article.id}`}>
        <img src={article.imageUrl} alt={article.title} loading="lazy" />
      </Link>
      <div className="meta">
        <Badges article={article} />
        <span>{timeAgo(article.publishedAt)}</span>
      </div>
      <h3>
        <Link to={`/article/${article.id}`}>{article.title}</Link>
      </h3>
      {showSummary && article.summary && <p>{article.summary}</p>}
    </article>
  );
}

export function HorizontalCard({ article, categories }) {
  return (
    <article className="card horizontal">
      <Link className="thumb" to={`/article/${article.id}`}>
        <img src={article.imageUrl} alt={article.title} loading="lazy" />
      </Link>
      <div>
        <div className="meta">
          <Badges article={article} />
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        <h3>
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
      </div>
    </article>
  );
}

export function ListRow({ article }) {
  return (
    <div className="list-row">
      <span className="time">{timeAgo(article.publishedAt)}</span>
      <div>
        <h4>
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h4>
        {article.author && <span className="author">{article.author}</span>}
      </div>
    </div>
  );
}

export function NumberedItem({ article, index }) {
  return (
    <div className="numbered">
      <span className="num">{index + 1}</span>
      <div>
        <h4>
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h4>
        <div className="meta">
          {categoryName(article, [])} · {timeAgo(article.publishedAt)}
        </div>
      </div>
    </div>
  );
}
