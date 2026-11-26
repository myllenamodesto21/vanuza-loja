import "server-only";

import { createClient } from "@supabase/supabase-js";

import { configSupabase } from "./config";

// Leitura do catálogo no servidor, como visitante (sem cookies). O RLS só mostra o que é visível.
export function supabasePublico() {
  const { url, chave } = configSupabase();
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
