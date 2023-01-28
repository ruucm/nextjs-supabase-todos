import { supabase } from "./../lib/supabaseClient";
import { useEffect, useState } from "react";
import { TodoItem } from "../components/TodoItem";

function Page() {
  const [todos, updateTodo, deleteTodo] = useSubscribeTable("todos");

  return (
    <ul style={{ listStyle: "none", padding: 20 }}>
      {todos?.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          updateTodo={updateTodo}
          deleteTodo={deleteTodo}
        />
      ))}
    </ul>
  );
}

export default Page;

function useSubscribeTable(table) {
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

  async function updateTodo(updates) {
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

  function deleteTodo(id) {
    supabase
      .from(table)
      .delete()
      .match({ id })
      .then(({ data, error }) => {
        if (error) {
          console.log("error", error);
        } else {
          console.log("data", data);
        }
      });
  }

  return [rows, updateTodo, deleteTodo] as any;
}
