"use client";

import { cn } from "@/lib/utils";

export function Bloco({ titulo, dica, children, className }: { titulo?: string; dica?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl bg-white/70 p-4 ring-1 ring-linho/60", className)}>
      {titulo && <h2 className="text-[13px] font-medium uppercase tracking-[0.14em] text-cacau">{titulo}</h2>}
      {dica && <p className="mt-0.5 text-xs text-cacau/80">{dica}</p>}
      <div className={cn(titulo && "mt-3")}>{children}</div>
    </section>
  );
}

export function Interruptor({ ligado, aoMudar, rotulo, detalhe }: { ligado: boolean; aoMudar: (v: boolean) => void; rotulo: string; detalhe?: string }) {
  return (
    <button type="button" role="switch" aria-checked={ligado} onClick={() => aoMudar(!ligado)} className="flex w-full items-center gap-3 py-1.5 text-left">
      <span className="min-w-0 flex-1">
        <span className="block">{rotulo}</span>
        {detalhe && <span className="block text-xs text-cacau">{detalhe}</span>}
      </span>
      <span className={cn("relative h-8 w-[52px] shrink-0 rounded-full transition", ligado ? "bg-cobre" : "bg-linho")}>
        <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-all", ligado ? "left-[24px]" : "left-1")} />
      </span>
    </button>
  );
}

export function Pilula({ ativa, onClick, children, className }: { ativa: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 min-w-10 shrink-0 rounded-full px-3.5 text-sm transition active:scale-95",
        ativa ? "bg-chocolate text-creme" : "bg-creme ring-1 ring-linho",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const classeCampo =
  "h-14 w-full rounded-2xl bg-creme px-4 text-[17px] ring-1 ring-linho outline-none transition focus:bg-white focus:ring-2 focus:ring-rose";
