import { formatarMoeda } from "@/lib/formatacao";
import { emPromocao, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

export function Preco({ produto, grande = false, escuro = false }: { produto: Produto; grande?: boolean; escuro?: boolean }) {
  const promo = emPromocao(produto);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", grande && "gap-x-3")}>
      {promo && (
        <span className={cn("line-through", escuro ? "text-creme/55" : "text-cacau/70", grande ? "text-base" : "text-xs")}>
          {formatarMoeda(produto.preco)}
        </span>
      )}
      <span
        className={cn(
          "font-semibold tracking-tight",
          promo ? (escuro ? "text-[#f3b9a3]" : "text-promo") : escuro ? "text-creme" : "text-chocolate",
          grande ? "text-3xl" : "text-[15px]",
        )}
      >
        {formatarMoeda(promo ? (produto.preco_promocional as number) : produto.preco)}
      </span>
    </div>
  );
}
