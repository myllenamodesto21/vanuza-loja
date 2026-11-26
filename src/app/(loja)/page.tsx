import { BadgePercent, Sparkles } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { CarrosselCategorias } from "@/components/loja/categorias";
import { CarrosselProdutos } from "@/components/loja/carrossel-produtos";
import { GradeProdutos } from "@/components/loja/cartao-produto";
import { IconeWhatsapp } from "@/components/loja/icone-whatsapp";
import { TituloSecao } from "@/components/loja/titulo-secao";
import { listarCategorias, listarProdutos, obterLoja } from "@/lib/dados";
import { emPromocao } from "@/lib/produtos";
import { linkWhatsapp } from "@/lib/whatsapp";

export default async function Inicio() {
  await connection();
  const [loja, categorias, produtos] = await Promise.all([obterLoja(), listarCategorias(), listarProdutos()]);

  const disponiveis = produtos.filter((p) => !p.esgotado);
  const promocoes = disponiveis.filter((p) => emPromocao(p));
  const destaques = disponiveis.filter((p) => p.destaque);
  const novidades = produtos.slice(0, 12);

  return (
    <div className="pb-barra md:pb-0">
      {/* Abertura */}
      <section className="px-4 pt-2">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#f3e6d9] via-[#f8efe7] to-[#ead6c4] px-6 pb-7 pt-8 ring-1 ring-white/70 md:flex md:items-center md:gap-10 md:px-12 md:py-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-rose/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-white/70 blur-3xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/marca.webp"
            alt="Vanuza Empreendimentos"
            className="relative mx-auto size-40 animate-surgir rounded-full shadow-[0_18px_50px_-18px_rgba(134,80,58,0.55)] md:mx-0 md:size-56"
          />
          <div className="relative mt-5 text-center md:mt-0 md:text-left">
            <p className="font-manuscrita text-[34px] leading-tight text-cobre">{loja.frase}</p>
            <h1 className="mt-2 font-titulo text-[26px] font-medium leading-tight md:text-4xl">
              Moda feminina, masculina e infantil, perfumaria, calçados e bolsas
            </h1>
            <p className="mt-2 text-sm text-cacau">Escolha aqui e peça direto pelo WhatsApp.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
              {promocoes.length > 0 && (
                <Link href="/promocoes" className="flex h-12 items-center gap-2 rounded-full bg-chocolate px-5 text-sm text-creme transition active:scale-95">
                  <BadgePercent className="size-4.5" /> Ver promoções
                </Link>
              )}
              <a
                href={linkWhatsapp(loja.whatsapp, "Oi, Vanuza! Vim pelo catálogo.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center gap-2 rounded-full bg-white/80 px-5 text-sm text-chocolate ring-1 ring-linho transition active:scale-95"
              >
                <IconeWhatsapp className="size-4.5 text-whatsapp" /> Falar com a Vanuza
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 px-4">
        <CarrosselCategorias categorias={categorias} />
      </section>

      {promocoes.length > 0 && (
        <section className="mt-10 px-4">
          <div className="relative -mx-4 overflow-hidden bg-chocolate px-4 py-7 text-creme md:mx-0 md:rounded-[28px] md:px-8">
            <div className="brilho-rose pointer-events-none absolute inset-0 animate-brilho opacity-20" />
            <div className="relative mb-4 flex items-end justify-between">
              <div>
                <p className="font-manuscrita text-xl leading-none text-rose">aproveite</p>
                <h2 className="font-titulo text-[28px] font-medium">Promoções</h2>
              </div>
              <Link href="/promocoes" className="pb-1.5 text-sm text-rose">Ver todas</Link>
            </div>
            <div className="relative">
              <CarrosselProdutos produtos={promocoes.slice(0, 12)} escuro />
            </div>
          </div>
        </section>
      )}

      {destaques.length > 0 && (
        <section className="mt-10 px-4">
          <TituloSecao titulo="Queridinhos" detalhe="escolhidos a dedo" />
          <CarrosselProdutos produtos={destaques.slice(0, 12)} />
        </section>
      )}

      <section className="mt-10 px-4">
        <TituloSecao titulo="Novidades" detalhe="acabou de chegar" href="/buscar" />
        {novidades.length > 0 ? (
          <GradeProdutos produtos={novidades} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-areia/60 px-6 py-12 text-center">
            <Sparkles className="size-7 text-cobre" strokeWidth={1.4} />
            <p className="font-titulo text-2xl">Novidades chegando</p>
            <p className="text-sm text-cacau">Os produtos aparecem aqui assim que forem cadastrados.</p>
          </div>
        )}
      </section>
    </div>
  );
}
