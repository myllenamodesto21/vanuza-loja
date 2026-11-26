import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { configSupabase, supabaseConfigurado } from "./config";

// Renova a sessão da gestão e manda para /gestao/entrar quem não entrou.
export async function protegerGestao(request: NextRequest) {
  const caminho = request.nextUrl.pathname;
  let resposta = NextResponse.next({ request });
  if (!supabaseConfigurado()) return resposta;

  const { url, chave } = configSupabase();
  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar, cabecalhos) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options),
        );
        Object.entries(cabecalhos ?? {}).forEach(([nome, valor]) =>
          resposta.headers.set(nome, valor),
        );
      },
    },
  });

  // Nada entre createServerClient e getClaims.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);
  const naEntrada = caminho === "/gestao/entrar";

  if (!logado && !naEntrada) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/gestao/entrar";
    destino.search = "";
    return NextResponse.redirect(destino);
  }
  if (logado && naEntrada) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/gestao";
    destino.search = "";
    return NextResponse.redirect(destino);
  }
  return resposta;
}
