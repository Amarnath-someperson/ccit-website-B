'use client';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <div className="logo-icon">Lg.</div>
        <span>CCIT</span>
      </div>
      <ul className="nav-links">
        <li><a href="/" className="nav-link">Home</a></li>
        <li><a href="/blog" className="nav-link">Blog</a></li>
        <li><a href="/timeline" className="nav-link">Timeline</a></li>
      </ul>
    </nav>
  );
}