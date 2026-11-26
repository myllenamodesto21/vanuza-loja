"use client";

import { Check, Share2, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { precoAtual, type Produto } from "@/lib/produtos";
import { enderecoDoSite, linkWhatsapp, mensagemDeUmProduto } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

import { IconeWhatsapp } from "./icone-whatsapp";
import { useSacola } from "./sacola";

function Opcoes({ titulo, opcoes, valor, aoEscolher, alerta }: { titulo: string; opcoes: string[]; valor: string | null; aoEscolher: (v: string) => void; alerta: boolean }) {
  return (
    <div>
      <p className={cn("mb-2 text-xs uppercase tracking-[0.18em] transition", alerta ? "text-promo" : "text-cacau")}>
        {titulo}
        {alerta && ": escolha uma opção"}
      </p>
      <div className={cn("flex flex-wrap gap-2", alerta && "animate-pulo")}>
        {opcoes.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => aoEscolher(o)}
            className={cn(
              "h-11 min-w-11 rounded-full px-4 text-sm transition active:scale-95",
              valor === o ? "bg-chocolate text-creme shadow-md" : "bg-white/80 ring-1 ring-linho",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Comprar({ produto, whatsapp }: { produto: Produto; whatsapp: string }) {
  const sacola = useSacola();
  const [tamanho, setTamanho] = useState<string | null>(produto.tamanhos.length === 1 ? produto.tamanhos[0] : null);
  const [cor, setCor] = useState<string | null>(produto.cores.length === 1 ? produto.cores[0] : null);
  const [alerta, setAlerta] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  const faltaTamanho = produto.tamanhos.length > 0 && !tamanho;
  const faltaCor = produto.cores.length > 0 && !cor;
  const item = {
    produtoId: produto.id,
    nome: produto.nome,
    preco: precoAtual(produto),
    foto: produto.fotos[0] ?? null,
    tamanho,
    cor,
  };

  function conferir() {
    if (faltaTamanho || faltaCor) {
      setAlerta(true);
      setTimeout(() => setAlerta(false), 1600);
      return false;
    }
    return true;
  }

  function adicionar() {
    if (!conferir()) return;
    sacola.adicionar(item);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1800);
  }

  async function compartilhar() {
    const url = `${enderecoDoSite()}/produto/${produto.id}`;
    if (navigator.share) {
      await navigator.share({ title: produto.nome, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  if (produto.esgotado) {
    return (
      <div className="space-y-3">
        <p className="rounded-2xl bg-areia px-4 py-3 text-sm text-cacau">
          Esgotado no momento. Chame a Vanuza: pode chegar de novo ou ter algo parecido.
        </p>
        <a
          href={linkWhatsapp(whatsapp, `Oi, Vanuza! O "${produto.nome}" vai voltar? ${enderecoDoSite()}/produto/${produto.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-whatsapp font-medium text-white"
        >
          <IconeWhatsapp className="size-5" /> Avise quando chegar
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {produto.tamanhos.length > 0 && (
        <Opcoes titulo="Tamanho" opcoes={produto.tamanhos} valor={tamanho} aoEscolher={setTamanho} alerta={alerta && faltaTamanho} />
      )}
      {produto.cores.length > 0 && (
        <Opcoes titulo="Cor" opcoes={produto.cores} valor={cor} aoEscolher={setCor} alerta={alerta && faltaCor} />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linho/70 bg-creme/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl gap-2.5">
          <button
            type="button"
            onClick={adicionar}
            className={cn(
              "flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-medium transition active:scale-[0.97]",
              adicionado ? "bg-cobre text-white" : "bg-chocolate text-creme",
            )}
          >
            {adicionado ? <Check className="size-5" /> : <ShoppingBag className="size-5" strokeWidth={1.7} />}
            {adicionado ? "Na sacola!" : "Pôr na sacola"}
          </button>
          <a
            href={linkWhatsapp(whatsapp, mensagemDeUmProduto(item, enderecoDoSite()))}
            onClick={(e) => {
              if (!conferir()) e.preventDefault();
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-[15px] font-medium text-white shadow-lg shadow-whatsapp/25 transition active:scale-[0.97]"
            aria-label="Pedir pelo WhatsApp"
          >
            <IconeWhatsapp className="size-5" />
            <span className="hidden min-[400px]:inline">Pedir</span>
          </a>
          <button
            type="button"
            onClick={compartilhar}
            className="grid size-14 shrink-0 place-items-center rounded-full bg-white/80 ring-1 ring-linho transition active:scale-90"
            aria-label="Compartilhar"
          >
            <Share2 className="size-5" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
