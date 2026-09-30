import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="wrap" style={{ padding: "40px 0 80px", maxWidth: 720 }}>
      <h1 style={{ fontSize: 28 }}>About this demo</h1>
      <p className="muted">
        This is a training project that replicates the <strong>layout and
        structure</strong> of the CNA news homepage for learning purposes. All
        headlines, summaries and article bodies are original placeholder text —
        none of the real CNA news content is reproduced.
      </p>
      <h2 style={{ fontSize: 19, marginTop: 24 }}>What's included</h2>
      <ul style={{ lineHeight: 1.9 }}>
        <li>Frontend skeleton matching CNA's homepage sections</li>
        <li>Category, article and search pages</li>
        <li>A backend REST API (Express + JSON storage)</li>
        <li>An admin panel to create, edit and delete stories</li>
      </ul>
      <Link to="/admin" className="btn primary">
        Open Admin Panel
      </Link>
    </div>
  );
}
