"use client";

import { Download, Loader2, Smartphone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { TopoGestao } from "@/components/gestao/casca";
import { useGestao } from "@/components/gestao/provedor";
import { SeletorProdutos } from "@/components/gestao/seletor-produtos";
import { compartilharImagens, gerarImagemStatus } from "@/lib/status";

function Status() {
  const { produtos, loja, avisar } = useGestao();
  const params = useSearchParams();
  const disponiveis = produtos.filter((p) => p.visivel && !p.esgotado);
  const [ids, setIds] = useState<string[]>(() => (params.get("ids") ?? "").split(",").filter((id) => produtos.some((p) => p.id === id)));
  const [imagens, setImagens] = useState<{ arquivo: File; url: string }[]>([]);
  const [gerando, setGerando] = useState(false);

  useEffect(() => () => imagens.forEach((i) => URL.revokeObjectURL(i.url)), [imagens]);

  async function gerar() {
    setGerando(true);
    try {
      const escolhidos = ids.map((id) => produtos.find((p) => p.id === id)).filter((p) => p != null);
      const arquivos: File[] = [];
      for (const p of escolhidos) arquivos.push(await gerarImagemStatus(p, loja));
      setImagens(arquivos.map((arquivo) => ({ arquivo, url: URL.createObjectURL(arquivo) })));
    } catch (e) {
      avisar((e as Error).message || "Não deu para montar a imagem.", "erro");
    } finally {
      setGerando(false);
    }
  }

  async function postar() {
    const resultado = await compartilharImagens(imagens.map((i) => i.arquivo));
    if (resultado === "baixou") avisar("Imagens salvas. No celular, poste pelo WhatsApp > Status.");
  }

  const podeCompartilhar = typeof navigator !== "undefined" && !!navigator.canShare;

  if (imagens.length) {
    return (
      <div className="pb-44">
        <TopoGestao titulo="Pronto para postar" />
        <div className="sem-rolagem flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12%] pb-2">
          {imagens.map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i.url} src={i.url} alt="Prévia do status" className="aspect-[9/16] w-full shrink-0 snap-center rounded-3xl shadow-xl ring-1 ring-linho" />
          ))}
        </div>
        <div className="mx-4 mt-5 rounded-3xl bg-areia/70 p-4 text-sm text-cacau">
          <p className="font-medium text-chocolate">Como postar:</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">
            <li>Toque em <strong>Postar no WhatsApp</strong></li>
            <li>Escolha o <strong>WhatsApp</strong></li>
            <li>Toque em <strong>Meu status</strong> e envie</li>
          </ol>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-linho/70 bg-creme/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
          <div className="mx-auto grid max-w-md gap-2">
            <button type="button" onClick={postar} className="flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp text-lg font-medium text-white shadow-lg shadow-whatsapp/30 active:scale-[0.98]">
              {podeCompartilhar ? <Smartphone className="size-5" /> : <Download className="size-5" />}
              {podeCompartilhar ? `Postar no WhatsApp${imagens.length > 1 ? ` (${imagens.length})` : ""}` : "Baixar imagens"}
            </button>
            <button type="button" onClick={() => setImagens([])} className="h-11 text-sm text-cacau">Escolher outros produtos</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-48">
      <TopoGestao titulo="Postar no status" />
      <p className="-mt-1 mb-4 text-sm text-cacau">
        Escolha os produtos. Cada um vira uma imagem com a foto, o preço e o seu WhatsApp, prontinha para o status.
      </p>
      <SeletorProdutos produtos={disponiveis} selecionados={ids} aoMudar={setIds} />
      <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
        <button
          type="button"
          onClick={gerar}
          disabled={!ids.length || gerando}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-chocolate text-lg text-creme shadow-xl transition active:scale-[0.98] disabled:opacity-50"
        >
          {gerando ? <Loader2 className="size-5 animate-spin" /> : <Smartphone className="size-5" />}
          {ids.length ? `Montar ${ids.length} imagem${ids.length > 1 ? "ns" : ""}` : "Escolha os produtos"}
        </button>
      </div>
    </div>
  );
}

export default function PaginaStatus() {
  return (
    <Suspense>
      <Status />
    </Suspense>
  );
}
