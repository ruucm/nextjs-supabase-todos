import { supabase } from "./../lib/supabaseClient";
import { useEffect, useState } from "react";
import { TodoItem } from "../components/TodoItem";

function Page() {
  const [todos, insertRow, updateRow, deleteRow] = useDbTable("todos");

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

function useDbTable(table) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // get initial rows
    supabase
      .from(table)
      .select("*")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (!error) {
          setRows(data);
        }
      });
  }, []);

  useEffect(() => {
    const sub = supabase
      .channel("any")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          console.log("Change received!", payload);
          const eventType = payload.eventType;
          switch (eventType) {
            case "INSERT":
              setRows((prev) => [payload.new, ...prev]);
              break;
            case "UPDATE":
              setRows((prev) =>
                prev.map((row) =>
                  row.id === payload.new.id ? payload.new : row
                )
              );
              break;
            case "DELETE":
              setRows((prev) =>
                prev.filter((row) => row.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  async function updateRow(updates) {
    const { id, done } = updates;
    const { error, ...data } = await supabase
      .from(table)
      .update({ done })
      .eq("id", id);

    if (error) {
      console.log("error", error);
    } else {
      console.log("data", data);
    }
  }

  async function deleteRow(id) {
    const { error, ...data } = await supabase.from(table).delete().eq("id", id);

    if (error) {
      console.log("error", error);
    } else {
      console.log("data", data);
    }
  }

  function insertRow(item) {
    supabase
      .from(table)
      .insert(item)
      .then(({ data, error }) => {
        if (error) {
          console.log("error", error);
        } else {
          console.log("data", data);
        }
      });
  }

  return [rows, insertRow, updateRow, deleteRow] as any;
}
