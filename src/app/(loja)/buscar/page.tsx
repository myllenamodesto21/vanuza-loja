import type { Metadata } from "next";
import { connection } from "next/server";

import { ListaFiltrada } from "@/components/loja/lista-filtrada";
import { listarCategorias, listarProdutos } from "@/lib/dados";

export const metadata: Metadata = { title: "Todos os produtos" };

export default async function Buscar({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await connection();
  const { q } = await searchParams;
  const [categorias, produtos] = await Promise.all([listarCategorias(), listarProdutos()]);
  return (
    <div className="pb-barra px-4 pt-2 md:pb-0">
      <h1 className="mb-3 mt-2 font-titulo text-4xl font-semibold">Produtos</h1>
      <ListaFiltrada produtos={produtos} categorias={categorias} comBusca buscaInicial={q ?? ""} />
    </div>
  );
}
