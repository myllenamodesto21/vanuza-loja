"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FotoProduto } from "@/components/loja/foto-produto";
import { formatarMoeda, hojeISO, semAcento } from "@/lib/formatacao";
import { emPromocao, precoAtual, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { useGestao } from "./provedor";

// Grade de fotos para escolher vários produtos (promoção, status).
export function SeletorProdutos({
  produtos,
  selecionados,
  aoMudar,
}: {
  produtos: Produto[];
  selecionados: string[];
  aoMudar: (ids: string[]) => void;
}) {
  const { categorias } = useGestao();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const hoje = hojeISO();

  const lista = useMemo(() => {
    const termo = semAcento(busca.trim());
    return produtos.filter((p) => (!termo || semAcento(p.nome).includes(termo)) && (!categoria || p.categoria_id === categoria));
  }, [produtos, busca, categoria]);

  function alternar(id: string) {
    aoMudar(selecionados.includes(id) ? selecionados.filter((x) => x !== id) : [...selecionados, id]);
  }

  const todosVisiveis = lista.length > 0 && lista.every((p) => selecionados.includes(p.id));

  return (
    <div>
      <label className="flex h-12 items-center gap-2 rounded-full bg-white/80 px-4 ring-1 ring-linho focus-within:ring-2 focus-within:ring-rose">
        <Search className="size-5 text-cacau" strokeWidth={1.6} />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto" className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <div className="sem-rolagem -mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => aoMudar(todosVisiveis ? selecionados.filter((id) => !lista.some((p) => p.id === id)) : [...new Set([...selecionados, ...lista.map((p) => p.id)])])}
          className="h-8 shrink-0 rounded-full bg-chocolate/10 px-3 text-xs"
        >
          {todosVisiveis ? "Desmarcar todos" : "Marcar todos"}
        </button>
        {categorias.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategoria((a) => (a === c.id ? null : c.id))} className={cn("h-8 shrink-0 rounded-full px-3 text-xs", categoria === c.id ? "bg-rose/40" : "text-cacau")}>
            {c.nome}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {lista.map((p) => {
          const marcado = selecionados.includes(p.id);
          const ordem = selecionados.indexOf(p.id) + 1;
          return (
            <button key={p.id} type="button" onClick={() => alternar(p.id)} className="text-left">
              <span className={cn("relative block overflow-hidden rounded-2xl ring-[3px] transition", marcado ? "ring-cobre" : "ring-transparent")}>
                <FotoProduto caminho={p.fotos[0]} nome="" className={cn("aspect-[4/5] w-full transition", marcado && "scale-[0.94] rounded-xl")} />
                <span className={cn("absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full text-xs font-semibold shadow", marcado ? "bg-cobre text-white" : "bg-white/85 ring-1 ring-linho")}>
                  {marcado ? ordem : ""}
                </span>
                {emPromocao(p, hoje) && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-promo px-1.5 text-[10px] text-white">promo</span>}
              </span>
              <span className="mt-1 block truncate text-[11.5px]">{p.nome}</span>
              <span className="block text-[11.5px] font-semibold">{formatarMoeda(precoAtual(p, hoje))}</span>
            </button>
          );
        })}
      </div>
      {lista.length === 0 && <p className="py-8 text-center text-sm text-cacau">Nenhum produto aqui.</p>}
    </div>
  );
}
