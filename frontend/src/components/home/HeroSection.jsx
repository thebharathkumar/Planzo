import { useState } from 'react';

export default function HeroSection({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Discover Events<br />
          <span className="hero-highlight">Near You</span>
        </h1>
        <p className="hero-subtitle">
          Find concerts, workshops, meetups, and more happening in your area.
        </p>
        <form className="hero-search" onSubmit={handleSubmit}>
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search events, venues, or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
