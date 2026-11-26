"use client";

import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { TopoGestao } from "@/components/gestao/casca";
import { classeCampo } from "@/components/gestao/campos";
import { useGestao } from "@/components/gestao/provedor";
import { ICONES_CATEGORIA, IconeCategoria } from "@/components/icone-categoria";
import { salvarCategorias } from "@/lib/gestao";
import { slugificar, type Categoria } from "@/lib/produtos";
import { cn } from "@/lib/utils";

export default function Categorias() {
  const { categorias, produtos, recarregar, avisar } = useGestao();
  const [lista, setLista] = useState<Categoria[]>(categorias);
  const [removidas, setRemovidas] = useState<string[]>([]);
  const [escolhendoIcone, setEscolhendoIcone] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function mudar(id: string, mudanca: Partial<Categoria>) {
    setLista((l) => l.map((c) => (c.id === id ? { ...c, ...mudanca } : c)));
  }

  function mover(i: number, para: number) {
    if (para < 0 || para >= lista.length) return;
    const nova = [...lista];
    const [c] = nova.splice(i, 1);
    nova.splice(para, 0, c);
    setLista(nova);
  }

  function remover(c: Categoria) {
    const qtd = produtos.filter((p) => p.categoria_id === c.id).length;
    if (qtd && !confirm(`${qtd} produto${qtd > 1 ? "s ficam" : " fica"} sem categoria. Tirar "${c.nome}" mesmo assim?`)) return;
    setLista((l) => l.filter((x) => x.id !== c.id));
    if (categorias.some((x) => x.id === c.id)) setRemovidas((r) => [...r, c.id]);
  }

  function adicionar() {
    const id = crypto.randomUUID();
    setLista((l) => [...l, { id, nome: "", slug: "", icone: "sparkles", ordem: l.length + 1, ativa: true }]);
    setTimeout(() => document.getElementById(`cat-${id}`)?.focus(), 50);
  }

  async function salvar() {
    const prontas = lista.map((c) => ({ ...c, nome: c.nome.trim() }));
    if (prontas.some((c) => !c.nome)) return avisar("Toda categoria precisa de um nome.", "erro");
    const usados = new Set<string>();
    const comSlug = prontas.map((c) => {
      let slug = slugificar(c.nome) || "categoria";
      let n = 2;
      while (usados.has(slug)) slug = `${slugificar(c.nome)}-${n++}`;
      usados.add(slug);
      return { ...c, slug };
    });
    setSalvando(true);
    try {
      await salvarCategorias(comSlug, removidas);
      await recarregar();
      setRemovidas([]);
      avisar("Categorias salvas!");
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="px-4 pb-48">
      <TopoGestao titulo="Categorias" voltar="/gestao" />
      <ul className="space-y-2">
        {lista.map((c, i) => (
          <li key={c.id} className={cn("rounded-2xl bg-white/70 p-2.5 ring-1 ring-linho/60", !c.ativa && "opacity-60")}>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setEscolhendoIcone((a) => (a === c.id ? null : c.id))} className="grid size-12 shrink-0 place-items-center rounded-full bg-creme text-cobre-escuro ring-1 ring-linho" aria-label="Trocar ícone">
                <IconeCategoria icone={c.icone} className="size-6" />
              </button>
              <input id={`cat-${c.id}`} value={c.nome} onChange={(e) => mudar(c.id, { nome: e.target.value.slice(0, 40) })} placeholder="Nome" className={cn(classeCampo, "h-12 text-base")} />
            </div>
            {escolhendoIcone === c.id && (
              <div className="mt-2 grid animate-surgir grid-cols-5 gap-1.5">
                {ICONES_CATEGORIA.map((ic) => (
                  <button key={ic.chave} type="button" onClick={() => { mudar(c.id, { icone: ic.chave }); setEscolhendoIcone(null); }} className={cn("flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px]", c.icone === ic.chave ? "bg-chocolate text-creme" : "bg-creme")}>
                    <IconeCategoria icone={ic.chave} className="size-5" />
                    {ic.nome}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-1 text-cacau">
              <button type="button" onClick={() => mover(i, i - 1)} disabled={i === 0} className="grid size-9 place-items-center rounded-full bg-creme disabled:opacity-30" aria-label="Subir"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => mover(i, i + 1)} disabled={i === lista.length - 1} className="grid size-9 place-items-center rounded-full bg-creme disabled:opacity-30" aria-label="Descer"><ArrowDown className="size-4" /></button>
              <span className="flex-1 text-center text-xs">{produtos.filter((p) => p.categoria_id === c.id).length} produtos</span>
              <button type="button" onClick={() => mudar(c.id, { ativa: !c.ativa })} className="flex h-9 items-center gap-1 rounded-full bg-creme px-3 text-xs">
                {c.ativa ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {c.ativa ? "Na loja" : "Escondida"}
              </button>
              <button type="button" onClick={() => remover(c)} className="grid size-9 place-items-center rounded-full bg-creme text-promo" aria-label="Tirar categoria"><Trash2 className="size-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" onClick={adicionar} className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose/70 text-cobre-escuro">
        <Plus className="size-5" /> Nova categoria
      </button>
      <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
        <button type="button" onClick={salvar} disabled={salvando} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-chocolate text-lg text-creme shadow-xl active:scale-[0.98] disabled:opacity-60">
          {salvando ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />} Salvar categorias
        </button>
      </div>
    </div>
  );
}
