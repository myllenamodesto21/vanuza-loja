import Link from "next/link";

import { IconeCategoria } from "@/components/icone-categoria";
import type { Categoria } from "@/lib/produtos";
import { cn } from "@/lib/utils";

// Categorias em círculos que deslizam de lado.
export function CarrosselCategorias({ categorias, ativa }: { categorias: Categoria[]; ativa?: string }) {
  return (
    <div className="sem-rolagem -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
      {categorias.map((c, i) => {
        const selecionada = ativa === c.slug;
        return (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="group flex w-[74px] shrink-0 snap-start animate-surgir flex-col items-center gap-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className={cn(
                "relative grid size-[68px] place-items-center rounded-full p-[2px] transition group-active:scale-90",
                selecionada ? "ouro-rose" : "bg-gradient-to-br from-linho to-rose/50",
              )}
            >
              <span className={cn("grid size-full place-items-center rounded-full", selecionada ? "bg-chocolate text-creme" : "bg-creme text-cobre-escuro")}>
                <IconeCategoria icone={c.icone} className="size-7" strokeWidth={1.4} />
              </span>
            </span>
            <span className={cn("text-center text-[11.5px] leading-tight", selecionada ? "font-medium text-chocolate" : "text-cacau")}>
              {c.nome}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
