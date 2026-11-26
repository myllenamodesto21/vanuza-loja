"use client";

import Link from "next/link";
import { use } from "react";

import { FormularioProduto } from "@/components/gestao/formulario-produto";
import { useGestao } from "@/components/gestao/provedor";

export default function EditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { produtos } = useGestao();
  const produto = produtos.find((p) => p.id === id);
  if (!produto) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="font-titulo text-2xl">Produto não encontrado.</p>
          <Link href="/gestao/produtos" className="mt-4 inline-block text-cobre-escuro underline">Voltar aos produtos</Link>
        </div>
      </div>
    );
  }
  return <FormularioProduto key={produto.id + produto.atualizado_em} produto={produto} />;
}
