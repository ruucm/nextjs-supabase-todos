export function TodoItem(props) {
  const { todo, updateRow, deleteRow } = props;

  const handleCheckboxClick = async () => {
    const updates = {
      id: todo.id,
      done: !todo.done,
    };
    await updateRow(updates);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteRow(todo.id);
    }
  };

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <li
        key={todo.id}
        style={{
          textDecoration: todo.done ? "line-through" : "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          type="checkbox"
          checked={todo.done}
          onChange={handleCheckboxClick}
        />
        {todo.title}
      </li>
      <button
        onClick={handleDeleteClick}
        style={{ color: "hsl(0deg 100% 75%)" }}
      >
        Delete
      </button>
    </div>
  );
}
