import type { SupabaseClient } from "@supabase/supabase-js";
import { env, isLive } from "./env";

let client: Promise<SupabaseClient> | null = null;

/** Cliente do Supabase, carregado só quando o site está no modo real. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!isLive) return Promise.reject(new Error("Supabase não configurado."));
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true },
    }),
  );
  return client;
}
