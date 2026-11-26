"use client";

import { BadgePercent, House, LayoutGrid, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useSacola } from "./sacola";

const ITENS = [
  { href: "/", nome: "Início", Icone: House },
  { href: "/buscar", nome: "Produtos", Icone: LayoutGrid },
  { href: "/promocoes", nome: "Promoções", Icone: BadgePercent },
];

// Barra de baixo no celular, ao alcance do polegar.
export function BarraInferior() {
  const caminho = usePathname();
  const sacola = useSacola();
  // Na página do produto, a barra de comprar ocupa o lugar.
  if (caminho.startsWith("/produto/")) return null;

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch justify-around rounded-[26px] border border-white/60 bg-creme/85 p-1.5 shadow-[0_10px_40px_-12px_rgba(58,36,25,0.35)] backdrop-blur-xl">
        {ITENS.map(({ href, nome, Icone }) => {
          const ativo = href === "/" ? caminho === "/" : caminho.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] transition active:scale-90",
                ativo ? "bg-chocolate text-creme" : "text-cacau",
              )}
            >
              <Icone className="size-[21px]" strokeWidth={1.6} />
              {nome}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={sacola.abrir}
          className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] text-cacau transition active:scale-90"
        >
          <ShoppingBag className="size-[21px]" strokeWidth={1.6} />
          Sacola
          {sacola.quantidade > 0 && (
            <span
              key={sacola.pulo}
              className="absolute right-[22%] top-1 grid min-w-[18px] animate-pulo place-items-center rounded-full bg-cobre px-1 text-[10px] font-semibold text-white"
            >
              {sacola.quantidade}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
