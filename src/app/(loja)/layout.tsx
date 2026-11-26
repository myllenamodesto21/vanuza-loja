import { Suspense } from "react";

import { BarraInferior } from "@/components/loja/barra-inferior";
import { Cabecalho } from "@/components/loja/cabecalho";
import { GavetaSacola } from "@/components/loja/gaveta-sacola";
import { Rodape } from "@/components/loja/rodape";
import { ProvedorSacola } from "@/components/loja/sacola";
import { obterLoja } from "@/lib/dados";
import { connection } from "next/server";

async function RodapeDaLoja() {
  await connection();
  return <Rodape loja={await obterLoja()} />;
}

async function SacolaDaLoja() {
  await connection();
  const loja = await obterLoja();
  return <GavetaSacola whatsapp={loja.whatsapp} />;
}

export default function LayoutDaLoja({ children }: { children: React.ReactNode }) {
  return (
    <ProvedorSacola>
      <Cabecalho />
      <main className="mx-auto max-w-6xl">{children}</main>
      <Suspense>
        <RodapeDaLoja />
        <SacolaDaLoja />
      </Suspense>
      <BarraInferior />
    </ProvedorSacola>
  );
}
