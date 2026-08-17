import { useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";

const useRealtime = (
  tables = [],
  callback
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const tablesKey = Array.isArray(tables) ? tables.slice().sort().join("|") : "";

  useEffect(() => {
    if (
      !Array.isArray(tables) ||
      tables.length === 0 ||
      typeof callbackRef.current !== "function"
    ) {
      return undefined;
    }

    const channels = tables.map((table) => {
      const channelName = `realtime-${table}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
          },
          () => {
            if (typeof callbackRef.current === "function") {
              callbackRef.current();
            }
          }
        )
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [tablesKey]);
};

export default useRealtime;