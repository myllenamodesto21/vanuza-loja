"use client";

import { BadgePercent, Loader2, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { TopoGestao } from "@/components/gestao/casca";
import { Bloco, classeCampo, Pilula } from "@/components/gestao/campos";
import { useGestao } from "@/components/gestao/provedor";
import { SeletorProdutos } from "@/components/gestao/seletor-produtos";
import { FotoProduto } from "@/components/loja/foto-produto";
import { formatarData, formatarMoeda, hojeISO, lerPreco, somarDias } from "@/lib/formatacao";
import { aplicarPromocao, encerrarPromocao } from "@/lib/gestao";
import { descontoPercentual, emPromocao } from "@/lib/produtos";
import { cn } from "@/lib/utils";

const PERCENTUAIS = [10, 15, 20, 25, 30, 40, 50];

function Promocoes() {
  const { produtos, recarregar, avisar } = useGestao();
  const params = useSearchParams();
  const hoje = hojeISO();
  const ativas = produtos.filter((p) => emPromocao(p, hoje));
  const [ids, setIds] = useState<string[]>(() => (params.get("ids") ?? "").split(",").filter((id) => produtos.some((p) => p.id === id)));
  const [criando, setCriando] = useState(ids.length > 0);
  const [tipo, setTipo] = useState<"percentual" | "preco">("percentual");
  const [percentual, setPercentual] = useState(20);
  const [preco, setPreco] = useState("");
  const [ate, setAte] = useState(somarDias(hoje, 7));
  const [ocupado, setOcupado] = useState(false);
  const [feito, setFeito] = useState<string[] | null>(null);

  async function aplicar() {
    const valor = tipo === "preco" ? lerPreco(preco) : null;
    if (tipo === "preco" && !valor) return avisar("Ponha o preço da promoção.", "erro");
    setOcupado(true);
    try {
      const qtd = await aplicarPromocao(ids, tipo === "percentual" ? { percentual } : { preco: valor as number }, ate || null);
      await recarregar();
      const fora = ids.length - qtd;
      avisar(`Promoção em ${qtd} produto${qtd === 1 ? "" : "s"}!${fora ? ` ${fora} ficaram de fora (preço menor que o da promoção).` : ""}`);
      setFeito(ids);
      setIds([]);
      setCriando(false);
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setOcupado(false);
    }
  }

  async function encerrar(lista: string[]) {
    if (lista.length > 1 && !confirm(`Encerrar a promoção de ${lista.length} produtos?`)) return;
    try {
      await encerrarPromocao(lista);
      await recarregar();
      avisar("Promoção encerrada.");
    } catch (e) {
      avisar((e as Error).message, "erro");
    }
  }

  if (criando) {
    return (
      <div className="px-4 pb-52">
        <TopoGestao
          titulo="Nova promoção"
          direita={
            <button type="button" onClick={() => setCriando(false)} className="grid size-10 place-items-center rounded-full bg-white/70 ring-1 ring-linho" aria-label="Cancelar">
              <X className="size-5" />
            </button>
          }
        />
        <Bloco titulo="1. Desconto">
          <div className="mb-3 grid grid-cols-2 rounded-full bg-creme p-1 ring-1 ring-linho">
            {(["percentual", "preco"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} className={cn("h-10 rounded-full text-sm", tipo === t ? "bg-chocolate text-creme" : "text-cacau")}>
                {t === "percentual" ? "Porcentagem" : "Preço fixo"}
              </button>
            ))}
          </div>
          {tipo === "percentual" ? (
            <div className="flex flex-wrap gap-2">
              {PERCENTUAIS.map((p) => (
                <Pilula key={p} ativa={percentual === p} onClick={() => setPercentual(p)} className="h-12 min-w-14 text-base">
                  -{p}%
                </Pilula>
              ))}
            </div>
          ) : (
            <span className="flex items-center rounded-2xl bg-creme ring-1 ring-linho focus-within:bg-white focus-within:ring-2 focus-within:ring-rose">
              <span className="pl-4 text-lg text-promo">R$</span>
              <input value={preco} onChange={(e) => setPreco(e.target.value.replace(/[^\d,.]/g, ""))} inputMode="decimal" placeholder="Ex.: 49,90 (para todos)" className="h-14 w-full bg-transparent px-2 text-xl outline-none placeholder:text-base" />
            </span>
          )}
        </Bloco>
        <Bloco titulo="2. Até quando" className="mt-3">
          <div className="flex flex-wrap gap-2">
            <Pilula ativa={!ate} onClick={() => setAte("")}>Sem data</Pilula>
            <Pilula ativa={ate === hoje} onClick={() => setAte(hoje)}>Só hoje</Pilula>
            <Pilula ativa={ate === somarDias(hoje, 3)} onClick={() => setAte(somarDias(hoje, 3))}>3 dias</Pilula>
            <Pilula ativa={ate === somarDias(hoje, 7)} onClick={() => setAte(somarDias(hoje, 7))}>1 semana</Pilula>
          </div>
          <input type="date" value={ate} min={hoje} onChange={(e) => setAte(e.target.value)} className={cn(classeCampo, "mt-2 h-12 text-base")} />
        </Bloco>
        <h2 className="mb-2 mt-5 text-[13px] font-medium uppercase tracking-[0.14em] text-cacau">3. Quais produtos</h2>
        <SeletorProdutos produtos={produtos.filter((p) => p.visivel)} selecionados={ids} aoMudar={setIds} />
        <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
          <button type="button" onClick={aplicar} disabled={!ids.length || ocupado} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-promo text-lg text-white shadow-xl active:scale-[0.98] disabled:opacity-50">
            {ocupado ? <Loader2 className="size-5 animate-spin" /> : <BadgePercent className="size-5" />}
            {ids.length ? `Aplicar em ${ids.length} produto${ids.length > 1 ? "s" : ""}` : "Escolha os produtos"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-barra px-4">
      <TopoGestao titulo="Promoções" />
      <button type="button" onClick={() => { setFeito(null); setCriando(true); }} className="flex w-full items-center gap-4 rounded-3xl bg-promo p-5 text-left text-white shadow-lg shadow-promo/25 active:scale-[0.98]">
        <span className="grid size-12 place-items-center rounded-full bg-white/20">
          <BadgePercent className="size-6" />
        </span>
        <span>
          <span className="block text-lg font-medium">Criar promoção</span>
          <span className="block text-sm text-white/80">Escolha o desconto e os produtos</span>
        </span>
      </button>

      {feito && (
        <Link href={`/gestao/status?ids=${feito.join(",")}`} className="mt-3 flex animate-surgir items-center gap-3 rounded-3xl bg-chocolate p-4 text-creme">
          <Smartphone className="size-6" />
          <span className="flex-1">Divulgar a promoção no status</span>
          <span className="text-rose">›</span>
        </Link>
      )}

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.2em] text-cacau">Em promoção agora ({ativas.length})</h2>
        {ativas.length > 1 && (
          <button type="button" onClick={() => encerrar(ativas.map((p) => p.id))} className="text-sm text-promo">Encerrar todas</button>
        )}
      </div>
      {ativas.length === 0 ? (
        <p className="rounded-3xl bg-areia/60 p-6 text-center text-sm text-cacau">Nenhum produto em promoção.</p>
      ) : (
        <ul className="space-y-2">
          {ativas.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2 ring-1 ring-linho/60">
              <Link href={`/gestao/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <FotoProduto caminho={p.fotos[0]} nome="" className="h-16 w-13 shrink-0 rounded-xl" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{p.nome}</span>
                  <span className="text-sm">
                    <s className="text-xs text-cacau">{formatarMoeda(p.preco)}</s>{" "}
                    <strong className="text-promo">{formatarMoeda(p.preco_promocional as number)}</strong>{" "}
                    <span className="text-xs text-promo">-{descontoPercentual(p)}%</span>
                  </span>
                  <span className="block text-xs text-cacau">{p.promocao_ate ? `até ${formatarData(p.promocao_ate)}` : "sem data para acabar"}</span>
                </span>
              </Link>
              <button type="button" onClick={() => encerrar([p.id])} className="h-9 shrink-0 rounded-full bg-areia px-3 text-xs">Encerrar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PaginaPromocoes() {
  return (
    <Suspense>
      <Promocoes />
    </Suspense>
  );
}
