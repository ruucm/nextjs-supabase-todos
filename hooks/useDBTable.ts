import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useDBTable(table) {
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
