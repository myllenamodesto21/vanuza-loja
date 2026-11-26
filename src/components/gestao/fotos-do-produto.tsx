"use client";

import { Camera, ChevronLeft, ChevronRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";

import { enviarFoto } from "@/lib/gestao";
import { urlFoto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { useGestao } from "./provedor";

type Envio = { id: string; previa: string };
const MAX = 10;

export function FotosDoProduto({ fotos, aoMudar, aoEnviar }: { fotos: string[]; aoMudar: Dispatch<SetStateAction<string[]>>; aoEnviar: (n: number) => void }) {
  const { avisar } = useGestao();
  const entrada = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [aberta, setAberta] = useState<number | null>(null);

  async function escolher(lista: FileList | null) {
    if (!lista?.length) return;
    const arquivos = [...lista].slice(0, MAX - fotos.length - envios.length);
    if (arquivos.length < lista.length) avisar(`Cabem até ${MAX} fotos por produto.`, "erro");
    const novos = arquivos.map((f) => ({ id: crypto.randomUUID(), previa: URL.createObjectURL(f), arquivo: f }));
    setEnvios((e) => [...e, ...novos]);
    aoEnviar(novos.length);
    for (const novo of novos) {
      try {
        const caminho = await enviarFoto(novo.arquivo);
        aoMudar((atuais) => [...atuais, caminho]);
      } catch (e) {
        avisar((e as Error).message || "Não deu para enviar uma foto.", "erro");
      } finally {
        setEnvios((e) => e.filter((x) => x.id !== novo.id));
        aoEnviar(-1);
        URL.revokeObjectURL(novo.previa);
      }
    }
  }

  function mover(i: number, para: number) {
    if (para < 0 || para >= fotos.length) return;
    const nova = [...fotos];
    const [f] = nova.splice(i, 1);
    nova.splice(para, 0, f);
    aoMudar(nova);
    setAberta(para);
  }

  const cheio = fotos.length + envios.length >= MAX;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((f, i) => (
          <div key={f} className="relative">
            <button type="button" onClick={() => setAberta(aberta === i ? null : i)} className={cn("block w-full overflow-hidden rounded-2xl ring-2 transition", aberta === i ? "ring-cobre" : "ring-transparent")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlFoto(f, true) ?? ""} alt="" className="aspect-[4/5] w-full bg-areia object-cover" />
            </button>
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-chocolate/80 px-2 py-0.5 text-[10px] text-creme">Capa</span>}
            {aberta === i && (
              <div className="absolute inset-x-1 bottom-1 flex animate-surgir justify-between rounded-xl bg-chocolate/85 p-1 text-creme backdrop-blur">
                <button type="button" onClick={() => mover(i, i - 1)} disabled={i === 0} className="grid size-8 place-items-center disabled:opacity-30" aria-label="Para a esquerda"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => mover(i, 0)} disabled={i === 0} className="grid size-8 place-items-center disabled:opacity-30" aria-label="Usar como capa"><Star className="size-4" /></button>
                <button type="button" onClick={() => { aoMudar(fotos.filter((x) => x !== f)); setAberta(null); }} className="grid size-8 place-items-center" aria-label="Tirar foto"><X className="size-4" /></button>
                <button type="button" onClick={() => mover(i, i + 1)} disabled={i === fotos.length - 1} className="grid size-8 place-items-center disabled:opacity-30" aria-label="Para a direita"><ChevronRight className="size-4" /></button>
              </div>
            )}
          </div>
        ))}
        {envios.map((e) => (
          <div key={e.id} className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.previa} alt="" className="aspect-[4/5] w-full object-cover opacity-50" />
            <Loader2 className="absolute inset-0 m-auto size-7 animate-spin text-chocolate" />
          </div>
        ))}
        {!cheio && (
          <>
            <button type="button" onClick={() => camera.current?.click()} className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl bg-chocolate text-creme active:scale-95">
              <Camera className="size-7" strokeWidth={1.5} />
              <span className="text-xs">Tirar foto</span>
            </button>
            <button type="button" onClick={() => entrada.current?.click()} className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-rose/70 bg-creme text-cobre-escuro active:scale-95">
              <ImagePlus className="size-7" strokeWidth={1.5} />
              <span className="text-xs">Da galeria</span>
            </button>
          </>
        )}
      </div>
      {fotos.length > 1 && <p className="mt-2 text-xs text-cacau">Toque numa foto para mudar a ordem, pôr de capa ou tirar.</p>}
      <input ref={entrada} type="file" accept="image/*" multiple hidden onChange={(e) => { escolher(e.target.files); e.target.value = ""; }} />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { escolher(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
