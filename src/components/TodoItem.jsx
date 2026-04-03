import { useState, useRef, useEffect } from 'react';

export default function TodoItem({
  todo,
  onDelete,
  onToggle,
  onEdit,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const [dragTarget, setDragTarget] = useState(false);
  const inputRef = useRef(null);

  // Focus the edit input whenever we enter edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleDoubleClick() {
    setEditValue(todo.text);
    setEditing(true);
  }

  function commitEdit() {
    onEdit(todo.id, editValue);
    setEditing(false);
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditValue(todo.text);
      setEditing(false);
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    // small delay so the ghost image is captured before we visually dim
    setTimeout(() => onDragStart(todo.id), 0);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragTarget(true);
    onDragOver(todo.id);
  }

  function handleDragLeave() {
    setDragTarget(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragTarget(false);
  }

  function handleDragEnd() {
    setDragTarget(false);
    onDragEnd();
  }

  const classNames = [
    'todo-item',
    isDragging ? 'dragging' : '',
    dragTarget ? 'drag-over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      className={classNames}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      aria-label={todo.text}
    >
      <input
        className="todo-checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
        onClick={(e) => e.stopPropagation()}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="todo-edit-input"
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleEditKeyDown}
          aria-label="Edit todo"
        />
      ) : (
        <span
          className={`todo-text${todo.completed ? ' completed' : ''}`}
          onDoubleClick={handleDoubleClick}
          title="Double-click to edit"
        >
          {todo.text}
        </span>
      )}

      <button
        className="todo-delete-btn"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        title="Delete"
      >
        ✕
      </button>
    </li>
  );
}
