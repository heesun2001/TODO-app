import { useState, useEffect, useCallback } from 'react';
import TodoInput from './components/TodoInput.jsx';
import TodoList from './components/TodoList.jsx';
import FilterBar from './components/FilterBar.jsx';

const STORAGE_KEY = 'todos-app-v1';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [dragId, setDragId] = useState(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addTodo = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const editTodo = useCallback((id, newText) => {
    const trimmed = newText.trim();
    if (!trimmed) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      return;
    }
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t))
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }, []);

  const toggleAll = useCallback(() => {
    const allDone = todos.every((t) => t.completed);
    setTodos((prev) => prev.map((t) => ({ ...t, completed: !allDone })));
  }, [todos]);

  // ── DRAG-TO-REORDER ────────────────────────────────────────────────────────

  const handleDragStart = useCallback((id) => {
    setDragId(id);
  }, []);

  const handleDragOver = useCallback(
    (overId) => {
      if (!dragId || dragId === overId) return;
      setTodos((prev) => {
        const from = prev.findIndex((t) => t.id === dragId);
        const to = prev.findIndex((t) => t.id === overId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    },
    [dragId]
  );

  const handleDragEnd = useCallback(() => {
    setDragId(null);
  }, []);

  // ── DERIVED ────────────────────────────────────────────────────────────────

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const visibleTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">TODO</h1>
      </header>

      <main className="app-main">
        <TodoInput onAdd={addTodo} onToggleAll={toggleAll} hasTodos={todos.length > 0} allDone={activeCount === 0 && todos.length > 0} />

        {todos.length > 0 && (
          <>
            <TodoList
              todos={visibleTodos}
              onDelete={deleteTodo}
              onToggle={toggleTodo}
              onEdit={editTodo}
              dragId={dragId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />

            <FilterBar
              filter={filter}
              onFilter={setFilter}
              activeCount={activeCount}
              completedCount={completedCount}
              onClearCompleted={clearCompleted}
            />
          </>
        )}

        {todos.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <p>No tasks yet. Add one above!</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Double-click to edit &nbsp;·&nbsp; Drag to reorder</p>
      </footer>
    </div>
  );
}
