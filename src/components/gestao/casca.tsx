"use client";

import { BadgePercent, House, Package, Plus, Smartphone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITENS = [
  { href: "/gestao", nome: "Início", Icone: House },
  { href: "/gestao/produtos", nome: "Produtos", Icone: Package },
  null,
  { href: "/gestao/promocoes", nome: "Promoções", Icone: BadgePercent },
  { href: "/gestao/status", nome: "Status", Icone: Smartphone },
] as const;

export function CascaGestao({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  const noFormulario = /^\/gestao\/produtos\/(novo|[0-9a-f-]{36})$/.test(caminho);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      {children}
      {!noFormulario && (
        <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
          <div className="flex items-center justify-around rounded-[26px] border border-white/60 bg-creme/90 p-1.5 shadow-[0_10px_40px_-12px_rgba(58,36,25,0.4)] backdrop-blur-xl">
            {ITENS.map((item) => {
              if (!item) {
                return (
                  <Link
                    key="novo"
                    href="/gestao/produtos/novo"
                    aria-label="Novo produto"
                    className="ouro-rose -mt-7 grid size-16 shrink-0 place-items-center rounded-full p-[3px] shadow-lg shadow-cobre/40 transition active:scale-90"
                  >
                    <span className="grid size-full place-items-center rounded-full bg-chocolate text-creme">
                      <Plus className="size-7" strokeWidth={2} />
                    </span>
                  </Link>
                );
              }
              const { href, nome, Icone } = item;
              const ativo = href === "/gestao" ? caminho === "/gestao" : caminho.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10.5px] transition active:scale-90",
                    ativo ? "text-chocolate" : "text-cacau/70",
                  )}
                >
                  <Icone className="size-[22px]" strokeWidth={ativo ? 2 : 1.6} />
                  <span className={cn(ativo && "font-medium")}>{nome}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export function TopoGestao({ titulo, voltar, direita }: { titulo: string; voltar?: string; direita?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-creme/90 px-4 backdrop-blur-xl" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {voltar ? (
        <Link href={voltar} className="-ml-2 grid size-11 place-items-center rounded-full text-2xl active:bg-areia" aria-label="Voltar">
          ‹
        </Link>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.jpg" alt="" className="size-9 rounded-full ring-1 ring-rose/50" />
      )}
      <h1 className="min-w-0 flex-1 truncate font-titulo text-2xl font-semibold">{titulo}</h1>
      {direita}
    </header>
  );
}
