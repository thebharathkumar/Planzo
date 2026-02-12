export default function FilterBar({ radius, onRadiusChange, category, onCategoryChange }) {
  const categories = ['All', 'Music', 'Tech', 'Food', 'Art', 'Sports', 'Wellness', 'Business'];
  const radiusOptions = [5, 10, 25, 50, 100];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Distance</label>
        <select
          className="filter-select"
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
        >
          {radiusOptions.map((r) => (
            <option key={r} value={r}>{r} km</option>
          ))}
        </select>
      </div>
      <div className="filter-group filter-categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${category === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
