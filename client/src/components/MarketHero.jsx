import { indices, gainers } from "../content.js";

// Static chart data — computed once at module load instead of on every render.
const maxVal = Math.max(...gainers.map((g) => g.value));
const POINTS = "0,150 40,120 80,132 120,80 160,95 200,50 240,70 280,30";
const AREA = `0,150 40,120 80,132 120,80 160,95 200,50 240,70 280,30 300,55 300,150`;

export default function MarketHero() {
  return (
    <div className="wrap">
      <div className="market-hero">
        <div className="head-row">
          <h2>Market Index</h2>
          <a className="more" href="#/watch">View all ›</a>
        </div>

        <div className="index-cards">
          {indices.map((ix) => (
            <div className="index-card" key={ix.name}>
              <span className="logo-badge" style={{ background: ix.color }}>
                {ix.name[0]}
              </span>
              <div>
                <div className="name">{ix.name}</div>
                <div className="code">{ix.code}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="value">{ix.value}</div>
                <div className={`chg ${ix.up ? "up" : "down"}`}>
                  {ix.chg} {ix.pct}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          <div className="dash-panel">
            <h3>Decliners &amp; Advancers</h3>
            <div className="sub">Total: 315</div>
            <div className="bar-chart">
              {gainers.map((g) => (
                <div className="bar" key={g.lab}>
                  <div
                    className="col"
                    style={{ height: `${(g.value / maxVal) * 100}%`, background: g.color }}
                  />
                  <span className="lab">{g.lab}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-panel">
            <h3>Net Inflow</h3>
            <div className="sub">SGX · 35.75M (SGD)</div>
            <div className="line-chart">
              <svg viewBox="0 0 300 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b7aff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0b7aff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points={AREA} fill="url(#nf)" />
                <polyline
                  points={POINTS}
                  fill="none"
                  stroke="#0b7aff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="legend">
              <span className="dot" style={{ background: "#0b7aff" }} /> SGX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
