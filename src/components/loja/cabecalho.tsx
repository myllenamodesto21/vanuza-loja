"use client";

import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { useSacola } from "./sacola";

export function Cabecalho() {
  const sacola = useSacola();
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        rolou ? "border-b border-linho/70 bg-creme/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Vanuza Empreendimentos, início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" className="size-10 rounded-full ring-1 ring-rose/50" />
          <span className="leading-none">
            <span className="block font-titulo text-[22px] font-semibold tracking-[0.12em] texto-ouro-rose">VANUZA</span>
            <span className="block text-[8.5px] tracking-[0.32em] text-cacau">EMPREENDIMENTOS</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm text-cacau md:flex">
          <Link href="/" className="hover:text-cobre">Início</Link>
          <Link href="/promocoes" className="hover:text-cobre">Promoções</Link>
          <Link href="/buscar" className="hover:text-cobre">Todos os produtos</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/buscar"
            className="grid size-11 place-items-center rounded-full text-chocolate transition hover:bg-areia active:scale-90"
            aria-label="Buscar"
          >
            <Search className="size-5" strokeWidth={1.6} />
          </Link>
          <button
            type="button"
            onClick={sacola.abrir}
            className="relative grid size-11 place-items-center rounded-full text-chocolate transition hover:bg-areia active:scale-90"
            aria-label={`Sacola, ${sacola.quantidade} itens`}
          >
            <ShoppingBag className="size-5" strokeWidth={1.6} />
            {sacola.quantidade > 0 && (
              <span
                key={sacola.pulo}
                className="absolute right-1 top-1 grid min-w-5 animate-pulo place-items-center rounded-full bg-cobre px-1 text-[10px] font-semibold text-white"
              >
                {sacola.quantidade}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
