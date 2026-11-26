import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Selos } from "@/components/loja/cartao-produto";
import { CarrosselProdutos } from "@/components/loja/carrossel-produtos";
import { Comprar } from "@/components/loja/comprar";
import { Galeria } from "@/components/loja/galeria";
import { Preco } from "@/components/loja/preco";
import { TituloSecao } from "@/components/loja/titulo-secao";
import { listarCategorias, listarProdutos, obterLoja, obterProduto } from "@/lib/dados";
import { formatarData, formatarMoeda } from "@/lib/formatacao";
import { emPromocao, precoAtual, urlFoto } from "@/lib/produtos";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const produto = await obterProduto(id);
  if (!produto) return { title: "Produto" };
  const foto = urlFoto(produto.fotos[0]);
  const preco = formatarMoeda(precoAtual(produto));
  return {
    title: produto.nome,
    description: `${produto.nome} por ${preco}. Peça pelo WhatsApp.`,
    openGraph: {
      title: `${produto.nome} · ${preco}`,
      description: produto.descricao ?? "Peça pelo WhatsApp.",
      images: foto ? [{ url: foto }] : undefined,
    },
  };
}

export default async function PaginaProduto({ params }: Props) {
  await connection();
  const { id } = await params;
  const [produto, loja, categorias, produtos] = await Promise.all([
    obterProduto(id),
    obterLoja(),
    listarCategorias(),
    listarProdutos(),
  ]);
  if (!produto) notFound();

  const categoria = categorias.find((c) => c.id === produto.categoria_id);
  const parecidos = produtos
    .filter((p) => p.id !== produto.id && p.categoria_id === produto.categoria_id && !p.esgotado)
    .slice(0, 10);

  return (
    <div className="pb-36 md:px-4 md:pb-0 md:pt-4">
      <div className="md:grid md:grid-cols-2 md:gap-10">
        <div className="relative">
          <Galeria fotos={produto.fotos} nome={produto.nome}>
            <Selos produto={produto} />
          </Galeria>
        </div>

        <div className="px-4 pt-5 md:px-0 md:pt-2">
          {categoria && (
            <Link href={`/categoria/${categoria.slug}`} className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-cobre">
              <ChevronLeft className="size-3.5" />
              {categoria.nome}
            </Link>
          )}
          <h1 className="mt-1.5 font-titulo text-[32px] font-medium leading-[1.1]">{produto.nome}</h1>
          <div className="mt-3">
            <Preco produto={produto} grande />
            {emPromocao(produto) && produto.promocao_ate && (
              <p className="mt-1 text-xs text-promo">Promoção válida até {formatarData(produto.promocao_ate)}</p>
            )}
          </div>
          {produto.descricao && <p className="mt-4 whitespace-pre-line leading-relaxed text-cacau">{produto.descricao}</p>}
          <div className="mt-6">
            <Comprar produto={produto} whatsapp={loja.whatsapp} />
          </div>
        </div>
      </div>

      {parecidos.length > 0 && (
        <section className="mt-12 px-4 md:px-0">
          <TituloSecao titulo="Você também vai amar" detalhe="combina com você" />
          <CarrosselProdutos produtos={parecidos} />
        </section>
      )}
    </div>
  );
}
