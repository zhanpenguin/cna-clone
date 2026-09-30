import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../App.jsx";
import { HorizontalCard, StandardCard } from "../components/ArticleCard.jsx";
import {
  tvShows,
  radioShows,
  podcasts,
  newsletters,
  presenters,
  correspondents,
  games,
  interactives,
  specialReports,
  explains,
  brandStudioItems,
} from "../content.js";

function PageHead({ title, sub }) {
  return (
    <div className="wrap">
      <div className="page-head">
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
    </div>
  );
}

/* ---------------- About ---------------- */
export function AboutPage() {
  return (
    <>
      <PageHead title="About CNA" />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        <h2 style={{ fontSize: 20 }}>Our Logo · Our Tagline · Our Coverage</h2>
        <p className="muted">
          CNA is an English-language Asian news network. Positioned to
          “Understand Asia”, it reports on global developments with Asian
          perspectives. Based in Singapore, it has correspondents across major
          Asian cities and beyond.
        </p>
        <div className="stat-strip">
          <div className="stat">
            <div className="num">50M+</div>
            <div className="lab">Monthly readers</div>
          </div>
          <div className="stat">
            <div className="num">24/7</div>
            <div className="lab">Live news coverage</div>
          </div>
          <div className="stat">
            <div className="num">1999</div>
            <div className="lab">Established</div>
          </div>
        </div>
        <p>
          <Link className="btn primary" to="/presenters">Our Presenters</Link>{" "}
          <Link className="btn" to="/correspondents">Our Correspondents</Link>{" "}
          <Link className="btn" to="/contact">Contact Us</Link>
        </p>
      </div>
    </>
  );
}

/* ---------------- My Feed (personalization) ---------------- */
const TOPICS = ["Singapore", "Asia", "East Asia", "World", "Business", "Sport", "Commentary", "Lifestyle", "Environment", "Technology"];

export function MyFeedPage() {
  const { myfeedTopics, toggleTopic, articles, user } = useData();
  const relevant = articles.filter(
    (a) =>
      myfeedTopics.length === 0 ||
      myfeedTopics.some((t) => a.category.toLowerCase().includes(t.toLowerCase()) || (a.tags || []).some((tg) => tg.toLowerCase().includes(t.toLowerCase())))
  );

  return (
    <>
      <PageHead title="My Feed" sub={user ? `Welcome back, ${user.name}.` : "Set up your personal news feed by telling us what you care about."} />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <h2 style={{ fontSize: 18 }}>Trending Topics</h2>
        <div className="topic-grid">
          {TOPICS.map((t) => (
            <button
              key={t}
              className={`chip ${myfeedTopics.includes(t) ? "selected" : ""}`}
              onClick={() => toggleTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {myfeedTopics.length > 0 && (
          <p className="notice">Your feed is personalised with: {myfeedTopics.join(", ")}.</p>
        )}
        <h2 style={{ fontSize: 18, marginTop: 26 }}>For you</h2>
        {relevant.length === 0 ? (
          <p className="muted">Pick some topics above to build your feed.</p>
        ) : (
          <div className="grid cols-2">
            {relevant.slice(0, 8).map((a) => (
              <HorizontalCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Bookmarks ---------------- */
export function BookmarksPage() {
  const { bookmarks, articles } = useData();
  const saved = articles.filter((a) => bookmarks.includes(a.id));
  return (
    <>
      <PageHead title="Bookmarks" sub="Stories you saved for later." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        {saved.length === 0 ? (
          <p className="muted">No bookmarks yet. Tap the bookmark icon on any article to save it.</p>
        ) : (
          <div className="grid cols-2">
            {saved.map((a) => (
              <HorizontalCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Sign In (meconnect-style SSO) ---------------- */
export function SignInPage() {
  const { signIn, user } = useData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doSignIn = (name) => signIn({ name });

  if (user) {
    return (
      <>
        <PageHead title="Account" />
        <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
          <div className="notice">Signed in as {user.name}.</div>
          <p>
            <Link className="btn" to="/myfeed">Go to My Feed</Link>{" "}
            <Link className="btn" to="/bookmarks">Bookmarks</Link>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="Sign In" sub="One meconnect account for all of Mediacorp's digital services." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        <div className="login-card" style={{ maxWidth: 420, margin: "20px auto" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSignIn(email.split("@")[0] || "Reader");
            }}
          >
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn primary" style={{ width: "100%" }}>
              Sign in
            </button>
          </form>
          <p style={{ textAlign: "center", color: "var(--gray)", margin: "14px 0" }}>or</p>
          <div style={{ display: "grid", gap: 8 }}>
            <button className="btn" onClick={() => doSignIn("Apple User")}>Continue with Apple</button>
            <button className="btn" onClick={() => doSignIn("Facebook User")}>Continue with Facebook</button>
            <button className="btn" onClick={() => doSignIn("Google User")}>Continue with Google</button>
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>
            For personalised and seamless access across Mediacorp's digital
            services. This is a demo — no real account is created.
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------------- Watch (Live TV) ---------------- */
export function WatchPage() {
  const { articles } = useData();
  const videos = articles.filter((a) => a.kind === "video" || a.kind === "short").slice(0, 6);
  return (
    <>
      <PageHead title="Watch" sub="CNA's 24/7 livestream and on-demand programmes." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <div className="player-box">
          <span className="live">● LIVE TV</span>
          <h3>CNA Live</h3>
          <p>24/7 rolling news from Singapore and Asia.</p>
          <button className="btn primary">▶ Play</button>
        </div>
        <h2 style={{ fontSize: 19, marginTop: 26 }}>TV Schedule</h2>
        {tvShows.map((s) => (
          <div className="schedule-row" key={s.time + s.title}>
            <span className="when">{s.time}</span>
            <h4>{s.title}</h4>
            <button className="btn small">Watch</button>
          </div>
        ))}
        <h2 style={{ fontSize: 19, marginTop: 26 }}>Latest Videos</h2>
        <div className="grid cols-3">
          {videos.map((a) => (
            <StandardCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Listen (radio + podcasts) ---------------- */
export function ListenPage() {
  return (
    <>
      <PageHead title="CNA938 Radio" sub="Live radio and podcasts." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <div className="player-box">
          <span className="live">● ON AIR</span>
          <h3>CNA938</h3>
          <p>News and talk radio, live from Singapore.</p>
          <button className="btn primary">▶ Listen</button>
        </div>
        <h2 style={{ fontSize: 19, marginTop: 26 }}>Radio Schedule</h2>
        {radioShows.map((s) => (
          <div className="schedule-row" key={s.time + s.title}>
            <span className="when">{s.time}</span>
            <h4>{s.title}</h4>
            <button className="btn small">Listen</button>
          </div>
        ))}
        <h2 style={{ fontSize: 19, marginTop: 26 }}>This week in podcasts</h2>
        <div className="feature-cards">
          {podcasts.map((p) => (
            <div className="feature-card" key={p.title}>
              <span className="badge blue">Podcast</span>
              <h4>{p.title}</h4>
              <p>{p.host}</p>
              <p style={{ marginTop: 6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- Newsletters ---------------- */
export function NewslettersPage() {
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState(["morning"]);
  const [done, setDone] = useState(false);

  return (
    <>
      <PageHead title="Newsletters" sub="Daily and weekly news roundups, delivered." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        {done ? (
          <div className="notice">Subscribed! We'll send your picks to {email}.</div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {newsletters.map((n) => (
              <div className="feature-card" key={n.id} style={{ marginBottom: 10 }}>
                <label className="check" style={{ display: "flex", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={picked.includes(n.id)}
                    onChange={(e) =>
                      setPicked((p) => (e.target.checked ? [...p, n.id] : p.filter((x) => x !== n.id)))
                    }
                  />
                  <span>
                    <strong>{n.name}</strong> <span className="badge blue">{n.freq}</span>
                    <div className="muted" style={{ fontSize: 13 }}>{n.desc}</div>
                  </span>
                </label>
              </div>
            ))}
            <button type="submit" className="btn primary" style={{ width: "100%" }}>
              Subscribe
            </button>
          </form>
        )}
      </div>
    </>
  );
}

/* ---------------- Games ---------------- */
const QUIZ = [
  { q: "Which city hosts CNA's headquarters?", opts: ["Singapore", "Jakarta", "Tokyo"], a: 0 },
  { q: "What does CNA938 refer to?", opts: ["A TV channel", "A radio station", "A podcast app"], a: 1 },
  { q: "CNA is owned by which group?", opts: ["Mediacorp", "Reuters", "BBC"], a: 0 },
];

export function GamesPage() {
  const [quiz, setQuiz] = useState({ i: 0, score: 0, answered: null });

  const answer = (idx) => {
    if (quiz.answered !== null) return;
    const correct = idx === QUIZ[quiz.i].a;
    setQuiz((s) => ({ ...s, answered: idx, score: s.score + (correct ? 1 : 0) }));
  };
  const next = () => setQuiz((s) => ({ i: s.i + 1, score: s.score, answered: null }));

  return (
    <>
      <PageHead title="Games" sub="New games daily." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <div className="feature-cards">
          {games.map((g) => (
            <div className="feature-card" key={g.id}>
              <span className="badge blue">Daily</span>
              <h4>{g.name}</h4>
              <p>{g.desc}</p>
              {g.id === "quiz" ? (
                <Link className="btn small primary" to="/games" style={{ marginTop: 10 }}>
                  Play
                </Link>
              ) : (
                <button className="btn small" style={{ marginTop: 10 }} onClick={() => alert(`${g.name} — demo mode`)}>
                  Play
                </button>
              )}
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 19, marginTop: 28 }}>News Quiz</h2>
        {quiz.i < QUIZ.length ? (
          <div className="feature-card" style={{ maxWidth: 560 }}>
            <h4>{QUIZ[quiz.i].q}</h4>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {QUIZ[quiz.i].opts.map((o, idx) => (
                <button
                  key={o}
                  className="btn"
                  style={{
                    textAlign: "left",
                    borderColor: quiz.answered === idx ? (idx === QUIZ[quiz.i].a ? "var(--green)" : "var(--red)") : undefined,
                    background: quiz.answered === idx ? (idx === QUIZ[quiz.i].a ? "var(--green-soft, #e7f7ef)" : "var(--red-soft, #fdecee)") : undefined,
                  }}
                  onClick={() => answer(idx)}
                >
                  {o}
                </button>
              ))}
            </div>
            {quiz.answered !== null && (
              <button className="btn primary small" style={{ marginTop: 12 }} onClick={next}>
                Next →
              </button>
            )}
          </div>
        ) : (
          <div className="notice">
            Quiz complete — score {quiz.score}/{QUIZ.length}.
            <button className="btn small" style={{ marginLeft: 10 }} onClick={() => setQuiz({ i: 0, score: 0, answered: null })}>
              Restart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- FAST (bite-sized reading) ---------------- */
export function FastPage() {
  const { articles } = useData();
  return (
    <>
      <PageHead title="FAST" sub="The day's news in bite-sized portions. Scroll down to begin." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        {articles.slice(0, 12).map((a, i) => (
          <Link to={`/article/${a.id}`} key={a.id}>
            <div className="feature-card" style={{ marginBottom: 14 }}>
              <div className="meta muted" style={{ fontSize: 12, marginBottom: 6 }}>
                {i + 1} · {a.category}
              </div>
              <h4 style={{ fontSize: 17 }}>{a.title}</h4>
              <p>{a.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

/* ---------------- App download ---------------- */
export function AppPage() {
  return (
    <>
      <PageHead title="Download CNA App" sub="Breaking alerts and your daily digest." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        <p>
          Get breaking alert news and your daily digest of news from Singapore,
          Asia and around the world with the CNA app.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn primary" href="https://apps.apple.com/us/app/cna-channel-newsasia/id520773971" target="_blank" rel="noreferrer">App Store (iOS)</a>
          <a className="btn" href="https://play.google.com/store/apps/details?id=com.channelnewsasia" target="_blank" rel="noreferrer">Google Play (Android)</a>
          <a className="btn" href="https://appgallery.huawei.com/#/app/C101326503" target="_blank" rel="noreferrer">Huawei AppGallery</a>
        </div>
        <div className="stat-strip">
          <div className="stat"><div className="num">4.6★</div><div className="lab">App rating</div></div>
          <div className="stat"><div className="num">Push</div><div className="lab">Breaking alerts</div></div>
          <div className="stat"><div className="num">Offline</div><div className="lab">Read anywhere</div></div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Editorial verticals ---------------- */
function SimpleList({ items, badge }) {
  return (
    <div className="feature-cards">
      {items.map((it) => (
        <div className="feature-card" key={it.title}>
          <span className="badge blue">{badge || it.kind}</span>
          <h4>{it.title}</h4>
          {it.desc && <p>{it.desc}</p>}
        </div>
      ))}
    </div>
  );
}

export function ExplainsPage() {
  return (
    <>
      <PageHead title="CNA Explains" sub="Clear explainers on the news that matters." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <SimpleList items={explains} />
      </div>
    </>
  );
}

export function InteractivesPage() {
  return (
    <>
      <PageHead title="Interactives" sub="Rich multimedia storytelling." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <SimpleList items={interactives} />
      </div>
    </>
  );
}

export function SpecialReportsPage() {
  return (
    <>
      <PageHead title="Special Reports" sub="In-depth coverage on key themes." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <SimpleList items={specialReports} />
      </div>
    </>
  );
}

/* ---------------- Publisher pages ---------------- */
export function BrandStudioPage() {
  return (
    <>
      <PageHead title="Brand Studio" sub="Mediacorp's award-winning content marketing." />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <div className="tabs">
          {["Highlights", "Videos", "Customised Campaigns", "Social Reels"].map((t) => (
            <button key={t} className={t === "Highlights" ? "active" : ""}>{t}</button>
          ))}
        </div>
        <SimpleList items={brandStudioItems} badge="Brand Studio" />
      </div>
    </>
  );
}

export function AdvertisePage() {
  return (
    <>
      <PageHead title="Advertise With Us" sub="Reach a premium Asian news audience." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        <div className="feature-cards">
          {["Banner Ads", "Video Ads", "Native / Brand Studio", "Newsletter Sponsorship", "Podcast Ads"].map((t) => (
            <div className="feature-card" key={t}>
              <h4>{t}</h4>
              <p>Targeted placements across CNA's digital properties.</p>
            </div>
          ))}
        </div>
        <form onSubmit={(e) => e.preventDefault()} style={{ marginTop: 20 }}>
          <div className="field">
            <label>Company</label>
            <input placeholder="Company name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@company.com" />
          </div>
          <button className="btn primary">Send enquiry</button>
        </form>
      </div>
    </>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHead title="Contact Us" sub="Feedback, corrections, or a news tip?" />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        {sent ? (
          <div className="notice">Thank you — we've received your message.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="field"><label>Subject</label><input placeholder="News tip / feedback" /></div>
            <div className="field"><label>Message</label><textarea rows={5} placeholder="Tell us more…" /></div>
            <button className="btn primary">Send us a news tip</button>
          </form>
        )}
      </div>
    </>
  );
}

function TeamPage({ title, sub, people }) {
  return (
    <>
      <PageHead title={title} sub={sub} />
      <div className="wrap" style={{ paddingBottom: 60 }}>
        <div className="feature-cards">
          {people.map((p) => (
            <div className="feature-card" key={p.name}>
              <span className="logo-badge" style={{ width: 44, height: 44, background: "var(--blue)", borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", fontWeight: 900, fontSize: 17, marginBottom: 10 }}>
                {p.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <h4>{p.name}</h4>
              <p>{p.role || p.beat}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function PresentersPage() {
  return <TeamPage title="CNA Presenters" sub="Meet the faces of our news." people={presenters} />;
}

export function CorrespondentsPage() {
  return <TeamPage title="CNA Correspondents" sub="Our news network across Asia." people={correspondents} />;
}

export function RssPage() {
  return (
    <>
      <PageHead title="RSS" sub="Subscribe to our feeds." />
      <div className="wrap centerbox" style={{ paddingBottom: 60 }}>
        <p className="muted">
          RSS (Really Simple Syndication) lets you get our latest headlines in
          your favourite feed reader.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn" href="/api/rss.xml" target="_blank" rel="noreferrer">RSS (all stories)</a>
          <a className="btn" href="/api/sitemap.xml" target="_blank" rel="noreferrer">Sitemap XML</a>
          <a className="btn" href="/api/sitemap-news.xml" target="_blank" rel="noreferrer">News Sitemap</a>
        </div>
      </div>
    </>
  );
}
