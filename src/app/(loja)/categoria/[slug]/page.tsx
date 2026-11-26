import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CarrosselCategorias } from "@/components/loja/categorias";
import { ListaFiltrada } from "@/components/loja/lista-filtrada";
import { listarCategorias, listarProdutos } from "@/lib/dados";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const categoria = (await listarCategorias()).find((c) => c.slug === slug);
  return { title: categoria?.nome ?? "Categoria" };
}

export default async function PaginaCategoria({ params }: Props) {
  await connection();
  const { slug } = await params;
  const [categorias, produtos] = await Promise.all([listarCategorias(), listarProdutos()]);
  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();

  return (
    <div className="pb-barra px-4 pt-2 md:pb-0">
      <CarrosselCategorias categorias={categorias} ativa={slug} />
      <h1 className="mb-3 mt-6 font-titulo text-4xl font-semibold">{categoria.nome}</h1>
      <ListaFiltrada key={slug} produtos={produtos.filter((p) => p.categoria_id === categoria.id)} />
    </div>
  );
}
