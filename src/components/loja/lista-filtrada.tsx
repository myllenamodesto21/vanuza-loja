"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { semAcento } from "@/lib/formatacao";
import { emPromocao, precoAtual, type Categoria, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { GradeProdutos } from "./cartao-produto";

const ORDENS = [
  { id: "novos", nome: "Novidades" },
  { id: "menor", nome: "Menor preço" },
  { id: "maior", nome: "Maior preço" },
  { id: "promo", nome: "Promoções primeiro" },
] as const;
type Ordem = (typeof ORDENS)[number]["id"];

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-4 text-[13px] transition active:scale-95",
        ativo ? "bg-chocolate text-creme" : "bg-white/70 text-cacau ring-1 ring-linho",
      )}
    >
      {children}
    </button>
  );
}

export function ListaFiltrada({
  produtos,
  categorias,
  comBusca = false,
  buscaInicial = "",
}: {
  produtos: Produto[];
  categorias?: Categoria[];
  comBusca?: boolean;
  buscaInicial?: string;
}) {
  const [busca, setBusca] = useState(buscaInicial);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("novos");
  const [tamanho, setTamanho] = useState<string | null>(null);
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const tamanhos = useMemo(() => {
    const todos = new Set<string>();
    produtos.forEach((p) => p.tamanhos.forEach((t) => todos.add(t)));
    return [...todos];
  }, [produtos]);

  const lista = useMemo(() => {
    const termo = semAcento(busca.trim());
    const filtrados = produtos.filter(
      (p) =>
        (!termo || semAcento(`${p.nome} ${p.descricao ?? ""} ${p.cores.join(" ")}`).includes(termo)) &&
        (!categoria || p.categoria_id === categoria) &&
        (!tamanho || p.tamanhos.includes(tamanho)) &&
        (!soDisponiveis || !p.esgotado),
    );
    const ordenados = [...filtrados];
    if (ordem === "menor") ordenados.sort((a, b) => precoAtual(a) - precoAtual(b));
    if (ordem === "maior") ordenados.sort((a, b) => precoAtual(b) - precoAtual(a));
    if (ordem === "promo") ordenados.sort((a, b) => Number(emPromocao(b)) - Number(emPromocao(a)));
    // Esgotados sempre no fim.
    return ordenados.sort((a, b) => Number(a.esgotado) - Number(b.esgotado));
  }, [produtos, busca, categoria, tamanho, ordem, soDisponiveis]);

  const filtrosAtivos = Number(Boolean(tamanho)) + Number(soDisponiveis) + Number(ordem !== "novos");

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 bg-creme/90 px-4 pb-3 pt-1 backdrop-blur-xl">
        {comBusca && (
          <label className="mb-3 flex h-12 items-center gap-2 rounded-full bg-white/80 px-4 ring-1 ring-linho focus-within:ring-2 focus-within:ring-rose">
            <Search className="size-5 text-cacau" strokeWidth={1.6} />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar vestido, perfume, sandália..."
              className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-cacau/60"
              autoFocus={!buscaInicial}
              enterKeyHint="search"
            />
            {busca && (
              <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca">
                <X className="size-4 text-cacau" />
              </button>
            )}
          </label>
        )}
        <div className="sem-rolagem -mx-4 flex gap-2 overflow-x-auto px-4">
          <button
            type="button"
            onClick={() => setFiltrosAbertos((a) => !a)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] ring-1 transition active:scale-95",
              filtrosAbertos || filtrosAtivos ? "bg-rose/25 text-chocolate ring-rose" : "bg-white/70 text-cacau ring-linho",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filtrar{filtrosAtivos ? ` (${filtrosAtivos})` : ""}
          </button>
          {categorias?.map((c) => (
            <Chip key={c.id} ativo={categoria === c.id} onClick={() => setCategoria((a) => (a === c.id ? null : c.id))}>
              {c.nome}
            </Chip>
          ))}
        </div>
        {filtrosAbertos && (
          <div className="mt-3 animate-surgir space-y-3 rounded-3xl bg-white/80 p-4 ring-1 ring-linho">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cacau">Ordenar</p>
              <div className="flex flex-wrap gap-2">
                {ORDENS.map((o) => (
                  <Chip key={o.id} ativo={ordem === o.id} onClick={() => setOrdem(o.id)}>
                    {o.nome}
                  </Chip>
                ))}
              </div>
            </div>
            {tamanhos.length > 0 && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cacau">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {tamanhos.map((t) => (
                    <Chip key={t} ativo={tamanho === t} onClick={() => setTamanho((a) => (a === t ? null : t))}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <label className="flex items-center justify-between gap-3 text-sm">
              Só o que tem disponível
              <input
                type="checkbox"
                checked={soDisponiveis}
                onChange={(e) => setSoDisponiveis(e.target.checked)}
                className="size-5 accent-cobre"
              />
            </label>
          </div>
        )}
      </div>

      <p className="mb-3 mt-1 text-xs text-cacau">
        {lista.length} {lista.length === 1 ? "produto" : "produtos"}
      </p>
      {lista.length ? (
        <GradeProdutos produtos={lista} />
      ) : (
        <div className="rounded-3xl bg-areia/60 px-6 py-12 text-center text-cacau">
          Nada encontrado por aqui. Tente outra busca ou chame a Vanuza no WhatsApp.
        </div>
      )}
    </div>
  );
}
