const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function FilterBar({
  filter,
  onFilter,
  activeCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <div className="filter-bar">
      <span className="filter-count">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>

      <nav className="filter-tabs" role="navigation" aria-label="Filter todos">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-tab${filter === key ? ' active' : ''}`}
            onClick={() => onFilter(key)}
            aria-pressed={filter === key}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        className="clear-btn"
        onClick={onClearCompleted}
        disabled={completedCount === 0}
        aria-label="Clear completed todos"
      >
        Clear completed
      </button>
    </div>
  );
}
