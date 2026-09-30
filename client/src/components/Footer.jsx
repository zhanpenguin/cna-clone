import { Link } from "react-router-dom";

export default function Footer({ categories }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <h5>Sections</h5>
            <ul>
              {categories.slice(0, 7).map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>More</h5>
            <ul>
              <li><Link to="/watch">Live TV</Link></li>
              <li><Link to="/listen">CNA938 Live</Link></li>
              <li><Link to="/newsletters">Newsletters</Link></li>
              <li><Link to="/games">Games</Link></li>
              <li><Link to="/fast">FAST</Link></li>
              <li><Link to="/explains">CNA Explains</Link></li>
              <li><Link to="/interactives">Interactives</Link></li>
              <li><Link to="/special-reports">Special Reports</Link></li>
            </ul>
          </div>
          <div>
            <h5>About</h5>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/presenters">Our Presenters</Link></li>
              <li><Link to="/correspondents">Our Correspondents</Link></li>
              <li><Link to="/brand-studio">Brand Studio</Link></li>
              <li><Link to="/advertise">Advertise With Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/rss">RSS</Link></li>
              <li><Link to="/admin">Admin / CMS</Link></li>
            </ul>
          </div>
          <div>
            <h5>Follow us</h5>
            <div className="social">
              <a href="#/">Facebook</a>
              <a href="#/">YouTube</a>
              <a href="#/">LinkedIn</a>
              <a href="#/rss">RSS</a>
            </div>
            <ul style={{ marginTop: 12 }}>
              <li><Link to="/myfeed">My Feed</Link></li>
              <li><Link to="/bookmarks">Bookmarks</Link></li>
              <li><Link to="/app">App Download</Link></li>
              <li><Link to="/signin">Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <span>
            © {new Date().getFullYear()} CNA Demo — Training project. All news
            content is placeholder text.
          </span>
          <span>Terms · Privacy · Contact</span>
        </div>
      </div>
    </footer>
  );
}
