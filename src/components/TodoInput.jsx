import { useState } from 'react';

export default function TodoInput({ onAdd, onToggleAll, hasTodos, allDone }) {
  const [value, setValue] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      onAdd(value);
      setValue('');
    }
  }

  return (
    <div className="todo-input-wrapper">
      {hasTodos && (
        <button
          className={`toggle-all-btn${allDone ? ' all-done' : ''}`}
          onClick={onToggleAll}
          title={allDone ? 'Mark all active' : 'Mark all complete'}
          aria-label="Toggle all todos"
        >
          {/* Chevron-down SVG */}
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>
      )}

      <input
        className="todo-input"
        type="text"
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        aria-label="New todo"
      />
    </div>
  );
}
