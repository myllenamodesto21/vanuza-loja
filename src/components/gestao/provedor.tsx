"use client";

import { Loader2, LogOut } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { listarTudo, meuNome, souAdmin } from "@/lib/gestao";
import { LOJA_PADRAO, type Categoria, type Loja, type Produto } from "@/lib/produtos";
import { supabaseNavegador } from "@/lib/supabase/navegador";

type Aviso = { id: number; texto: string; tipo: "ok" | "erro"; acao?: { nome: string; fazer: () => void } };

type Gestao = {
  produtos: Produto[];
  categorias: Categoria[];
  loja: Loja;
  nome: string;
  recarregar: () => Promise<void>;
  avisar: (texto: string, tipo?: Aviso["tipo"], acao?: Aviso["acao"]) => void;
  sair: () => Promise<void>;
};

const Contexto = createContext<Gestao | null>(null);

export function ProvedorGestao({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<"carregando" | "pronto" | "sem-acesso" | "erro">("carregando");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loja, setLoja] = useState<Loja>(LOJA_PADRAO);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [nome, setNome] = useState("");
  const [detalhe, setDetalhe] = useState("");

  const recarregar = useCallback(async () => {
    const dados = await listarTudo();
    setProdutos(dados.produtos);
    setCategorias(dados.categorias);
    if (dados.loja) setLoja(dados.loja);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!(await souAdmin())) return setEstado("sem-acesso");
        const [n] = await Promise.all([meuNome(), recarregar()]);
        setNome(n);
        try {
          localStorage.setItem("vanuza.nome", n);
        } catch {}
        setEstado("pronto");
      } catch (e) {
        setDetalhe(e instanceof Error ? e.message : String(e));
        setEstado("erro");
      }
    })();
  }, [recarregar]);

  const avisar = useCallback<Gestao["avisar"]>((texto, tipo = "ok", acao) => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a.slice(-2), { id, texto, tipo, acao }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), acao ? 6000 : 3200);
  }, []);

  const sair = useCallback(async () => {
    await supabaseNavegador().auth.signOut({ scope: "local" });
    // recarrega de verdade para limpar tudo da memória
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/gestao/entrar";
  }, []);

  const valor = useMemo(
    () => ({ produtos, categorias, loja, nome, recarregar, avisar, sair }),
    [produtos, categorias, loja, nome, recarregar, avisar, sair],
  );

  if (estado !== "pronto") {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        {estado === "carregando" ? (
          <div className="flex flex-col items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="" className="size-24 animate-pulse rounded-full" />
            <Loader2 className="size-6 animate-spin text-cobre" />
          </div>
        ) : (
          <div className="max-w-xs space-y-4">
            <p className="font-titulo text-2xl">
              {estado === "sem-acesso" ? "Este acesso não é da gestão da loja." : "Não deu para carregar a gestão."}
            </p>
            {detalhe && <p className="rounded-2xl bg-areia p-3 text-left font-mono text-xs break-words text-cacau">{detalhe}</p>}
            <div className="flex justify-center gap-2">
              {estado === "erro" && (
                <button type="button" onClick={() => window.location.reload()} className="h-12 rounded-full bg-chocolate px-5 text-creme">
                  Tentar de novo
                </button>
              )}
              <button type="button" onClick={sair} className="flex h-12 items-center gap-2 rounded-full bg-white px-5 ring-1 ring-linho">
                <LogOut className="size-4" /> Sair
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4">
        {avisos.map((a) => (
          <div
            key={a.id}
            role="status"
            className={`pointer-events-auto flex max-w-md animate-surgir items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-xl ${
              a.tipo === "erro" ? "bg-promo text-white" : "bg-chocolate text-creme"
            }`}
          >
            <span>{a.texto}</span>
            {a.acao && (
              <button
                type="button"
                onClick={() => {
                  a.acao?.fazer();
                  setAvisos((lista) => lista.filter((x) => x.id !== a.id));
                }}
                className="shrink-0 font-semibold text-rose underline underline-offset-2"
              >
                {a.acao.nome}
              </button>
            )}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useGestao() {
  const g = useContext(Contexto);
  if (!g) throw new Error("useGestao fora do ProvedorGestao");
  return g;
}
