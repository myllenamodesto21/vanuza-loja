"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { urlFoto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { FotoProduto } from "./foto-produto";

// Fotos que passam com o dedo; tocar abre em tela cheia.
export function Galeria({ fotos, nome, children }: { fotos: string[]; nome: string; children?: React.ReactNode }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [cheia, setCheia] = useState<number | null>(null);

  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }

  function irPara(i: number) {
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (cheia == null) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setCheia(null);
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [cheia]);

  if (!fotos.length) {
    return (
      <div className="relative overflow-hidden md:rounded-[28px]">
        <FotoProduto nome={nome} className="aspect-[4/5] w-full" />
        {children}
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden md:rounded-[28px]">
        <div ref={trilho} onScroll={aoRolar} className="sem-rolagem flex snap-x snap-mandatory overflow-x-auto">
          {fotos.map((f, i) => (
            <button key={f} type="button" className="w-full shrink-0 snap-center" onClick={() => setCheia(i)} aria-label={`Ver foto ${i + 1} em tela cheia`}>
              <FotoProduto caminho={f} nome={nome} mini={false} prioridade={i === 0} className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
        {children}
        {fotos.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {fotos.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Foto ${i + 1}`}
                className={cn("h-1.5 rounded-full bg-white/90 shadow transition-all", i === atual ? "w-6" : "w-1.5 opacity-60")}
              />
            ))}
          </div>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="sem-rolagem mt-3 hidden gap-2 overflow-x-auto md:flex">
          {fotos.map((f, i) => (
            <button key={f} type="button" onClick={() => irPara(i)} className={cn("shrink-0 overflow-hidden rounded-xl ring-2 transition", i === atual ? "ring-cobre" : "ring-transparent opacity-70")}>
              <FotoProduto caminho={f} nome="" className="h-20 w-16" />
            </button>
          ))}
        </div>
      )}

      {cheia != null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setCheia(null)} className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white" aria-label="Fechar">
            <X className="size-6" />
          </button>
          <div className="sem-rolagem flex flex-1 snap-x snap-mandatory overflow-x-auto" ref={(el) => { if (el) el.scrollLeft = cheia * el.clientWidth; }}>
            {fotos.map((f) => (
              <div key={f} className="grid w-full shrink-0 snap-center place-items-center overflow-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlFoto(f) ?? ""} alt={nome} className="max-h-dvh w-full touch-pinch-zoom object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
