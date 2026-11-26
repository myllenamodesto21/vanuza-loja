import type { Metadata } from "next";
import { connection } from "next/server";

import { ListaFiltrada } from "@/components/loja/lista-filtrada";
import { listarCategorias, listarProdutos } from "@/lib/dados";
import { emPromocao } from "@/lib/produtos";

export const metadata: Metadata = { title: "Promoções" };

export default async function Promocoes() {
  await connection();
  const [categorias, produtos] = await Promise.all([listarCategorias(), listarProdutos()]);
  const emPromo = produtos.filter((p) => emPromocao(p) && !p.esgotado);
  const comPromo = categorias.filter((c) => emPromo.some((p) => p.categoria_id === c.id));

  return (
    <div className="pb-barra px-4 pt-2 md:pb-0">
      <div className="mb-5 mt-2">
        <p className="font-manuscrita text-2xl leading-none text-cobre">aproveite enquanto dura</p>
        <h1 className="font-titulo text-4xl font-medium">Promoções</h1>
      </div>
      {emPromo.length ? (
        <ListaFiltrada produtos={emPromo} categorias={comPromo.length > 1 ? comPromo : undefined} />
      ) : (
        <div className="rounded-3xl bg-areia/60 px-6 py-12 text-center text-cacau">
          Nenhuma promoção no momento. Volte logo, sempre tem novidade!
        </div>
      )}
    </div>
  );
}
