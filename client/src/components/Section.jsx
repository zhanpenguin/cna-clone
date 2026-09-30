import { Link } from "react-router-dom";

export default function Section({ title, moreTo, children, icon = true }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="head">
          <h2 className="title">
            {icon && <span className="icon-bar" />}
            {title}
          </h2>
          {moreTo && (
            <Link className="more" to={moreTo}>
              More ›
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
