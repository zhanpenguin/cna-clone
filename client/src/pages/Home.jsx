import { Link } from "react-router-dom";
import { useData } from "../App.jsx";
import Section from "../components/Section.jsx";
import MarketHero from "../components/MarketHero.jsx";
import {
  StandardCard,
  HorizontalCard,
  ListRow,
  NumberedItem,
} from "../components/ArticleCard.jsx";
import { timeAgo } from "../utils.js";

function Ad({ label = "Advertisement" }) {
  return <div className="ad">{label}</div>;
}

export default function Home() {
  const { articles, trending } = useData();

  const featured = articles.find((a) => a.featured) || articles[0];
  const side = articles.filter((a) => a.id !== featured?.id).slice(0, 5);

  const topStories = articles.filter((a) => a.id !== featured?.id).slice(0, 4);
  const shorts = articles.filter((a) => a.kind === "short" || a.kind === "video").slice(0, 6);
  const moreTop = articles.slice(6, 14);
  const podcasts = articles.filter((a) => a.kind === "podcast").slice(0, 3);
  const lifestyle = articles.filter((a) => a.category === "lifestyle").slice(0, 3);
  const commentary = articles.filter((a) => a.category === "commentary").slice(0, 4);
  const visual = articles.filter((a) => a.kind === "visual").slice(0, 3);
  const insider = articles.filter((a) => a.category === "insider").slice(0, 3);

  return (
    <>
      {/* Webull-style marketing hero */}
      <div className="hero-banner">
        <div className="wrap hero-banner-inner">
          <div className="hero-banner-copy">
            <h1>
              Your next big story,
              <br />
              <span className="accent">Legendary</span>
            </h1>
            <p>
              The data, tools and curated news ideas serious readers rely on —
              before they make their move.
            </p>
            <div className="cta-row">
              <Link to="/signin" className="btn primary">
                Get Started — It's FREE
              </Link>
              <Link to="/app" className="btn outline">
                Get the CNA App
              </Link>
            </div>
            <div className="trust">
              Trusted by 50M+ readers · 4.6/5 (1.3M reviews)
            </div>
          </div>
          <MarketHero />
        </div>
      </div>

      {/* News hero */}
      <div className="wrap">
        <div className="hero">
          <div className="lead">
            {featured && (
              <>
                <Link className="thumb" to={`/article/${featured.id}`}>
                  <img src={featured.imageUrl} alt={featured.title} />
                </Link>
                <h2>
                  <Link to={`/article/${featured.id}`}>{featured.title}</Link>
                </h2>
                <p>{featured.summary}</p>
                <div className="meta muted" style={{ fontSize: 12 }}>
                  {timeAgo(featured.publishedAt)}
                </div>
              </>
            )}
          </div>
          <div className="side">
            {side.map((a) => (
              <div className="item" key={a.id}>
                <h3>
                  <Link to={`/article/${a.id}`}>{a.title}</Link>
                </h3>
                <div className="meta muted" style={{ fontSize: 12 }}>
                  {timeAgo(a.publishedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top stories */}
      <Section title="Top Stories">
        <div className="grid cols-4">
          {topStories.map((a) => (
            <StandardCard key={a.id} article={a} showSummary={false} />
          ))}
        </div>
      </Section>

      <div className="wrap" style={{ paddingTop: 24 }}>
        <Ad />
      </div>

      {/* Shorts */}
      <Section title="Shorts" moreTo="/watch">
        <div className="shorts">
          {shorts.map((a) => (
            <div className="short" key={a.id}>
              <Link className="thumb" to={`/article/${a.id}`}>
                <img src={a.imageUrl} alt={a.title} loading="lazy" />
                {a.duration && <span className="dur">{a.duration}</span>}
              </Link>
              <h4>
                <Link to={`/article/${a.id}`}>{a.title}</Link>
              </h4>
            </div>
          ))}
        </div>
      </Section>

      {/* More top stories */}
      <Section title="More Top Stories">
        <div className="grid cols-2">
          {moreTop.map((a) => (
            <HorizontalCard key={a.id} article={a} />
          ))}
        </div>
      </Section>

      {/* Podcasts */}
      <Section title="Podcasts" moreTo="/listen">
        <div className="grid cols-3">
          {podcasts.map((a) => (
            <StandardCard key={a.id} article={a} />
          ))}
        </div>
      </Section>

      {/* Lifestyle */}
      <Section title="Lifestyle" moreTo="/category/lifestyle">
        <div className="grid cols-3">
          {lifestyle.map((a) => (
            <StandardCard key={a.id} article={a} />
          ))}
        </div>
      </Section>

      {/* Discover more */}
      <Section title="Discover more on CNA" icon={false}>
        <div className="promo">
          <Link className="tile" to="/about">
            <img
              className="bg"
              src="https://picsum.photos/seed/cnagames/640/300"
              alt=""
              loading="lazy"
            />
            <div className="body">
              <h4>CNA Games</h4>
              <span>Stay sharp with our daily puzzles</span>
            </div>
          </Link>
          <Link className="tile" to="/about">
            <img
              className="bg"
              src="https://picsum.photos/seed/cnaapp/640/300"
              alt=""
              loading="lazy"
            />
            <div className="body">
              <h4>CNA App</h4>
              <span>Available on Android and iOS</span>
            </div>
          </Link>
          <Link className="tile" to="/about">
            <img
              className="bg"
              src="https://picsum.photos/seed/cnanews/640/300"
              alt=""
              loading="lazy"
            />
            <div className="body">
              <h4>CNA Newsletters</h4>
              <span>Get the best of CNA in your inbox</span>
            </div>
          </Link>
        </div>
      </Section>

      {/* Commentary */}
      <Section title="Commentary" moreTo="/category/commentary">
        <div className="grid cols-2">
          {commentary.map((a) => (
            <div key={a.id}>
              <ListRow article={a} />
            </div>
          ))}
        </div>
      </Section>

      {/* Visual stories */}
      <Section title="Visual Stories" moreTo="/watch">
        <div className="grid cols-3">
          {visual.map((a) => (
            <StandardCard key={a.id} article={a} />
          ))}
        </div>
      </Section>

      <div className="wrap" style={{ paddingTop: 24 }}>
        <Ad label="Sponsored" />
      </div>

      {/* Trending */}
      <Section title="Trending">
        <div style={{ maxWidth: 720 }}>
          {trending.slice(0, 5).map((a, i) => (
            <NumberedItem key={a.id} article={a} index={i} />
          ))}
        </div>
      </Section>

      {/* Insider */}
      <Section title="Insider" moreTo="/category/insider">
        <div className="grid cols-3">
          {insider.map((a) => (
            <StandardCard key={a.id} article={a} />
          ))}
        </div>
      </Section>
    </>
  );
}
