export function TodoItem(props) {
  const { todo, updateTodo, deleteTodo } = props;

  const handleCheckboxClick = async () => {
    const updates = {
      id: todo.id,
      done: !todo.done,
    };
    await updateTodo(updates);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteTodo({
        id: todo.id,
      });
    }
  };

  return (
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
      {/* <button onClick={handleDeleteClick}>Delete</button> */}
    </li>
  );
}
