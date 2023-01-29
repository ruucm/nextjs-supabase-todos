import { useState } from "react";
import { TodoItem } from "../components/TodoItem";
import { useDBTable } from "../hooks/useDBTable";

function Page() {
  const [todos, insertRow, updateRow, deleteRow] = useDBTable("todos");

  return (
    <div style={{ padding: 20 }}>
      <AddItem insertRow={insertRow} />
      <br />
      <ul style={{ listStyle: "none" }}>
        {todos?.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            updateRow={updateRow}
            deleteRow={deleteRow}
          />
        ))}
      </ul>
    </div>
  );
}

export default Page;

function AddItem({ insertRow }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("value", value);
        insertRow({ title: value });
        setValue("");
      }}
      style={{ display: "flex", gap: 12 }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ border: "0.5px solid" }}
      />
      <button type="submit">submit</button>
    </form>
  );
}
