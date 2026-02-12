export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-icon">📍</span>
          <span>Planzo</span>
        </div>
        <p className="footer-tagline">Discover amazing events near you.</p>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Planzo. All rights reserved.</p>
      </div>
    </footer>
  );
}
