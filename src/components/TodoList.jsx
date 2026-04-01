import TodoItem from './TodoItem.jsx';

export default function TodoList({
  todos,
  onDelete,
  onToggle,
  onEdit,
  dragId,
  onDragStart,
  onDragOver,
  onDragEnd,
}) {
  return (
    <ul className="todo-list" role="list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          onToggle={onToggle}
          onEdit={onEdit}
          isDragging={dragId === todo.id}
          isDragOver={dragId !== null && dragId !== todo.id}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        />
      ))}
    </ul>
  );
}
