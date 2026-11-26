"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { formatarMoeda } from "@/lib/formatacao";
import { urlFoto } from "@/lib/produtos";
import { enderecoDoSite, linkWhatsapp, mensagemDoPedido } from "@/lib/whatsapp";

import { IconeWhatsapp } from "./icone-whatsapp";
import { useSacola } from "./sacola";

export function GavetaSacola({ whatsapp }: { whatsapp: string }) {
  const sacola = useSacola();
  const { aberta, fechar } = sacola;

  useEffect(() => {
    if (!aberta) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberta, fechar]);

  if (!aberta) return null;

  const pedido = linkWhatsapp(whatsapp, mensagemDoPedido(sacola.itens, enderecoDoSite()));

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sacola">
      <button type="button" aria-label="Fechar" onClick={fechar} className="absolute inset-0 bg-chocolate/40 backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] animate-subir flex-col rounded-t-[28px] bg-creme shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-[28px]">
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-linho md:hidden" />
        <div className="flex items-center justify-between px-5 pb-3 pt-3 md:pt-6">
          <h2 className="font-titulo text-2xl font-medium">Sua sacola</h2>
          <button type="button" onClick={fechar} className="grid size-10 place-items-center rounded-full hover:bg-areia" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        {sacola.itens.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 pb-14 pt-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-areia">
              <ShoppingBag className="size-7 text-cobre" strokeWidth={1.4} />
            </div>
            <p className="text-cacau">Sua sacola está vazia.</p>
            <Link href="/buscar" onClick={fechar} className="rounded-full bg-chocolate px-6 py-3 text-sm text-creme">
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
              {sacola.itens.map((item) => {
                const foto = urlFoto(item.foto ?? undefined, true);
                return (
                  <li key={item.chave} className="flex gap-3 rounded-2xl bg-white/60 p-2.5 ring-1 ring-linho/60">
                    {foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={foto} alt="" className="h-20 w-16 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="h-20 w-16 shrink-0 rounded-xl bg-areia" />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link href={`/produto/${item.produtoId}`} onClick={fechar} className="line-clamp-2 text-sm leading-snug">
                        {item.nome}
                      </Link>
                      <span className="text-xs text-cacau">
                        {[item.tamanho && `Tam. ${item.tamanho}`, item.cor].filter(Boolean).join(" · ")}
                      </span>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <div className="flex items-center rounded-full bg-areia">
                          <button type="button" className="grid size-8 place-items-center" aria-label="Menos um" onClick={() => sacola.mudarQuantidade(item.chave, item.quantidade - 1)}>
                            {item.quantidade === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                          </button>
                          <span className="w-5 text-center text-sm">{item.quantidade}</span>
                          <button type="button" className="grid size-8 place-items-center" aria-label="Mais um" onClick={() => sacola.mudarQuantidade(item.chave, item.quantidade + 1)}>
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">{formatarMoeda(item.preco * item.quantidade)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="seguro-baixo border-t border-linho/70 bg-creme px-5 pt-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-cacau">Total</span>
                <span className="text-2xl font-semibold tracking-tight">{formatarMoeda(sacola.total)}</span>
              </div>
              <a
                href={pedido}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 flex h-14 items-center justify-center gap-2.5 rounded-full bg-whatsapp text-[15px] font-medium text-white shadow-lg shadow-whatsapp/30 transition active:scale-[0.98]"
              >
                <IconeWhatsapp className="size-5" />
                Finalizar pedido no WhatsApp
              </a>
              <p className="pb-4 text-center text-xs text-cacau">
                A Vanuza confirma a disponibilidade, a entrega e o pagamento por lá.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
