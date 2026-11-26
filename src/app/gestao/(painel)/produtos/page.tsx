"use client";

import { BadgePercent, Check, CheckSquare, Copy, Eye, EyeOff, PackageCheck, PackageX, Search, Smartphone, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { TopoGestao } from "@/components/gestao/casca";
import { useGestao } from "@/components/gestao/provedor";
import { FotoProduto } from "@/components/loja/foto-produto";
import { formatarMoeda, hojeISO, semAcento } from "@/lib/formatacao";
import { duplicarProduto, excluirProdutos, mudarProdutos } from "@/lib/gestao";
import { emPromocao, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

const FILTROS = [
  { id: "todos", nome: "Todos" },
  { id: "venda", nome: "À venda" },
  { id: "promocao", nome: "Promoção" },
  { id: "esgotados", nome: "Esgotados" },
  { id: "escondidos", nome: "Escondidos" },
] as const;
type Filtro = (typeof FILTROS)[number]["id"];

function Lista() {
  const { produtos, categorias, recarregar, avisar } = useGestao();
  const router = useRouter();
  const params = useSearchParams();
  const filtro = (FILTROS.find((f) => f.id === params.get("filtro"))?.id ?? "todos") as Filtro;
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [selecao, setSelecao] = useState<Set<string> | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const hoje = hojeISO();

  const lista = useMemo(() => {
    const termo = semAcento(busca.trim());
    return produtos.filter((p) => {
      if (termo && !semAcento(p.nome).includes(termo)) return false;
      if (categoria && p.categoria_id !== categoria) return false;
      if (filtro === "venda") return p.visivel && !p.esgotado;
      if (filtro === "promocao") return emPromocao(p, hoje);
      if (filtro === "esgotados") return p.esgotado;
      if (filtro === "escondidos") return !p.visivel;
      return true;
    });
  }, [produtos, busca, categoria, filtro, hoje]);

  function trocarFiltro(id: Filtro) {
    router.replace(id === "todos" ? "/gestao/produtos" : `/gestao/produtos?filtro=${id}`, { scroll: false });
  }

  async function mudar(ids: string[], mudanca: Partial<Produto>, texto: string, desfazer?: Partial<Produto>) {
    setOcupado(true);
    try {
      await mudarProdutos(ids, mudanca);
      await recarregar();
      avisar(
        texto,
        "ok",
        desfazer
          ? { nome: "Desfazer", fazer: () => mudarProdutos(ids, desfazer).then(recarregar) }
          : undefined,
      );
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setOcupado(false);
    }
  }

  async function excluir(itens: Produto[]) {
    const texto = itens.length === 1 ? `Excluir "${itens[0].nome}"?` : `Excluir ${itens.length} produtos?`;
    if (!confirm(`${texto} As fotos também saem. Se for só tirar da loja por um tempo, use "Esconder".`)) return;
    setOcupado(true);
    try {
      await excluirProdutos(itens);
      await recarregar();
      setSelecao(null);
      avisar(itens.length === 1 ? "Produto excluído." : `${itens.length} produtos excluídos.`);
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setOcupado(false);
    }
  }

  async function duplicar(p: Produto) {
    try {
      const id = await duplicarProduto(p);
      await recarregar();
      router.push(`/gestao/produtos/${id}`);
      avisar("Cópia criada. Agora é só pôr as fotos.");
    } catch (e) {
      avisar((e as Error).message, "erro");
    }
  }

  const selecionados = selecao ? produtos.filter((p) => selecao.has(p.id)) : [];
  const ids = selecionados.map((p) => p.id);

  function alternar(id: string) {
    setSelecao((s) => {
      const nova = new Set(s ?? []);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  return (
    <div className={cn("px-4", selecao ? "pb-44" : "pb-barra")}>
      <TopoGestao
        titulo={selecao ? `${selecao.size} selecionado${selecao.size === 1 ? "" : "s"}` : "Produtos"}
        direita={
          selecao ? (
            <div className="flex gap-1">
              <button type="button" onClick={() => setSelecao(new Set(lista.map((p) => p.id)))} className="h-10 rounded-full px-3 text-sm text-cobre-escuro">
                Todos
              </button>
              <button type="button" onClick={() => setSelecao(null)} className="grid size-10 place-items-center rounded-full bg-white/70 ring-1 ring-linho" aria-label="Cancelar seleção">
                <X className="size-5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setSelecao(new Set())} className="flex h-10 items-center gap-1.5 rounded-full bg-white/70 px-3.5 text-sm ring-1 ring-linho">
              <CheckSquare className="size-4" /> Selecionar
            </button>
          )
        }
      />

      <label className="flex h-12 items-center gap-2 rounded-full bg-white/80 px-4 ring-1 ring-linho focus-within:ring-2 focus-within:ring-rose">
        <Search className="size-5 text-cacau" strokeWidth={1.6} />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto" className="h-full flex-1 bg-transparent outline-none" />
      </label>

      <div className="sem-rolagem -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => trocarFiltro(f.id)}
            className={cn("h-9 shrink-0 rounded-full px-4 text-[13px]", filtro === f.id ? "bg-chocolate text-creme" : "bg-white/70 text-cacau ring-1 ring-linho")}
          >
            {f.nome}
          </button>
        ))}
      </div>
      <div className="sem-rolagem -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoria((a) => (a === c.id ? null : c.id))}
            className={cn("h-8 shrink-0 rounded-full px-3 text-xs", categoria === c.id ? "bg-rose/40 text-chocolate" : "text-cacau")}
          >
            {c.nome}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-3 text-xs text-cacau">{lista.length} produtos</p>

      {lista.length === 0 && (
        <div className="rounded-3xl bg-areia/60 p-8 text-center text-cacau">
          {produtos.length === 0 ? (
            <>
              <p className="font-titulo text-2xl text-chocolate">Vamos começar?</p>
              <p className="mt-1 text-sm">Toque no + para cadastrar o primeiro produto.</p>
            </>
          ) : (
            "Nada por aqui."
          )}
        </div>
      )}

      <ul className="space-y-2">
        {lista.map((p) => {
          const marcado = selecao?.has(p.id) ?? false;
          const promo = emPromocao(p, hoje);
          const conteudo = (
            <>
              {selecao && (
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full ring-1", marcado ? "bg-chocolate text-creme ring-chocolate" : "ring-linho")}>
                  {marcado && <Check className="size-4" />}
                </span>
              )}
              <FotoProduto caminho={p.fotos[0]} nome="" className={cn("h-[72px] w-[58px] shrink-0 rounded-xl", (!p.visivel || p.esgotado) && "opacity-50")} />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[14px] leading-snug">{p.nome}</span>
                <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-sm">
                  {promo && <span className="text-xs text-cacau line-through">{formatarMoeda(p.preco)}</span>}
                  <span className={cn("font-semibold", promo && "text-promo")}>{formatarMoeda(promo ? (p.preco_promocional as number) : p.preco)}</span>
                </span>
                <span className="mt-0.5 flex gap-1.5 text-[11px]">
                  {p.esgotado && <span className="rounded-full bg-chocolate/10 px-2">Esgotado</span>}
                  {!p.visivel && <span className="rounded-full bg-chocolate/10 px-2">Escondido</span>}
                  {p.quantidade != null && !p.esgotado && <span className="text-cacau">{p.quantidade} em estoque</span>}
                </span>
              </span>
            </>
          );
          return (
            <li key={p.id} className={cn("flex items-center gap-2 rounded-2xl bg-white/70 p-2 ring-1 transition", marcado ? "ring-2 ring-cobre" : "ring-linho/60")}>
              {selecao ? (
                <button type="button" onClick={() => alternar(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  {conteudo}
                </button>
              ) : (
                <>
                  <Link href={`/gestao/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    {conteudo}
                  </Link>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() =>
                        mudar([p.id], { esgotado: !p.esgotado, ...(p.esgotado && p.quantidade === 0 ? { quantidade: null } : {}) }, p.esgotado ? "Disponível de novo!" : "Marcado como esgotado.", { esgotado: p.esgotado })
                      }
                      className={cn("grid size-10 place-items-center rounded-full", p.esgotado ? "bg-chocolate text-creme" : "bg-areia text-cacau")}
                      aria-label={p.esgotado ? "Marcar como disponível" : "Marcar como esgotado"}
                    >
                      {p.esgotado ? <PackageX className="size-4.5" /> : <PackageCheck className="size-4.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicar(p)}
                      className="grid size-10 place-items-center rounded-full bg-areia text-cacau"
                      aria-label="Duplicar"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {selecao && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md animate-subir rounded-[26px] bg-chocolate p-2 text-creme shadow-2xl" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {[
              { nome: "Promoção", Icone: BadgePercent, fazer: () => router.push(`/gestao/promocoes?ids=${ids.join(",")}`) },
              { nome: "Status", Icone: Smartphone, fazer: () => router.push(`/gestao/status?ids=${ids.join(",")}`) },
              { nome: "Esgotado", Icone: PackageX, fazer: () => mudar(ids, { esgotado: true }, "Marcados como esgotados.") },
              { nome: "Disponível", Icone: PackageCheck, fazer: () => mudar(ids, { esgotado: false }, "Disponíveis de novo.") },
              { nome: "Esconder", Icone: EyeOff, fazer: () => mudar(ids, { visivel: false }, "Escondidos da loja.") },
              { nome: "Mostrar", Icone: Eye, fazer: () => mudar(ids, { visivel: true }, "Aparecendo na loja.") },
            ].map(({ nome, Icone, fazer }) => (
              <button key={nome} type="button" disabled={!ids.length || ocupado} onClick={fazer} className="flex flex-col items-center gap-1 rounded-2xl py-2.5 active:bg-white/10 disabled:opacity-40">
                <Icone className="size-5" strokeWidth={1.6} />
                {nome}
              </button>
            ))}
          </div>
          <button type="button" disabled={!ids.length || ocupado} onClick={() => excluir(selecionados)} className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm text-[#f3b9a3] active:bg-white/10 disabled:opacity-40">
            <Trash2 className="size-4" /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProdutosGestao() {
  return (
    <Suspense>
      <Lista />
    </Suspense>
  );
}
