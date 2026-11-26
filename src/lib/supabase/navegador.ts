import { createBrowserClient } from "@supabase/ssr";

import { configSupabase } from "./config";

let cliente: ReturnType<typeof createBrowserClient> | null = null;

// Cliente do navegador (gestão). Um só por aba.
export function supabaseNavegador() {
  if (!cliente) {
    const { url, chave } = configSupabase();
    cliente = createBrowserClient(url, chave);
  }
  return cliente;
}
