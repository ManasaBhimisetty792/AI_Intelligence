import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";

const useRealtime = (
  tables = [],
  callback
) => {
  useEffect(() => {
    if (
      !Array.isArray(tables) ||
      tables.length === 0 ||
      typeof callback !== "function"
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
            callback();
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
  }, [callback, tables.join("|")]);
};

export default useRealtime;