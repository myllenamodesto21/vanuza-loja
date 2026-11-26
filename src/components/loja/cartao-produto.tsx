import Link from "next/link";

import { descontoPercentual, ehNovo, emPromocao, ultimasPecas, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { FotoProduto } from "./foto-produto";
import { Preco } from "./preco";

export function Selos({ produto }: { produto: Produto }) {
  const selos: { texto: string; classe: string }[] = [];
  if (produto.esgotado) selos.push({ texto: "Esgotado", classe: "bg-chocolate/85 text-creme" });
  else {
    if (emPromocao(produto)) selos.push({ texto: `-${descontoPercentual(produto)}%`, classe: "bg-promo text-white" });
    if (ehNovo(produto)) selos.push({ texto: "Novo", classe: "bg-creme/95 text-cobre-escuro" });
    if (ultimasPecas(produto)) selos.push({ texto: "Últimas peças", classe: "bg-creme/95 text-promo" });
  }
  if (!selos.length) return null;
  return (
    <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
      {selos.map((s) => (
        <span key={s.texto} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide shadow-sm backdrop-blur", s.classe)}>
          {s.texto}
        </span>
      ))}
    </div>
  );
}

export function CartaoProduto({ produto, indice = 0, escuro = false }: { produto: Produto; indice?: number; escuro?: boolean }) {
  return (
    <Link
      href={`/produto/${produto.id}`}
      className="group block animate-surgir"
      style={{ animationDelay: `${Math.min(indice, 8) * 45}ms` }}
    >
      <div className={cn("relative overflow-hidden rounded-2xl ring-1", escuro ? "ring-white/10" : "ring-linho/70")}>
        <FotoProduto
          caminho={produto.fotos[0]}
          nome={produto.nome}
          prioridade={indice < 4}
          className={cn(
            "aspect-[4/5] w-full transition duration-500 group-hover:scale-[1.04] group-active:scale-[0.98]",
            produto.esgotado && "opacity-55 grayscale-[35%]",
          )}
        />
        <Selos produto={produto} />
        {produto.fotos.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-chocolate/55 px-2 py-0.5 text-[10px] text-creme backdrop-blur">
            {produto.fotos.length} fotos
          </span>
        )}
      </div>
      <div className="px-0.5 pt-2.5">
        <h3 className={cn("line-clamp-2 text-[13.5px] leading-snug", escuro ? "text-creme/90" : "text-chocolate/90")}>{produto.nome}</h3>
        <div className="mt-1">
          <Preco produto={produto} escuro={escuro} />
        </div>
      </div>
    </Link>
  );
}

export function GradeProdutos({ produtos }: { produtos: Produto[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {produtos.map((p, i) => (
        <CartaoProduto key={p.id} produto={p} indice={i} />
      ))}
    </div>
  );
}
