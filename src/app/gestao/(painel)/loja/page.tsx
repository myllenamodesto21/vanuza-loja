"use client";

import { Check, LayoutGrid, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TopoGestao } from "@/components/gestao/casca";
import { Bloco, classeCampo } from "@/components/gestao/campos";
import { ListaDigitais } from "@/components/gestao/digital";
import { useGestao } from "@/components/gestao/provedor";
import { salvarLoja } from "@/lib/gestao";
import { telefoneBonito } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-cacau">{rotulo}</span>
      {children}
    </label>
  );
}

export default function AjustesDaLoja() {
  const { loja, recarregar, avisar, sair } = useGestao();
  const [dados, setDados] = useState(loja);
  const [whats, setWhats] = useState(telefoneBonito(loja.whatsapp));
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const numeros = whats.replace(/\D/g, "");
    const whatsapp = numeros.length === 11 ? `55${numeros}` : numeros;
    if (!/^55\d{11}$/.test(whatsapp)) return avisar("Confira o WhatsApp: DDD e número, ex.: (92) 99112-4806.", "erro");
    setSalvando(true);
    try {
      await salvarLoja({ ...dados, whatsapp, instagram: dados.instagram?.replace(/^@/, "").trim() || null, horario: dados.horario?.trim() || null });
      await recarregar();
      avisar("Dados salvos!");
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="pb-barra space-y-3 px-4">
      <TopoGestao titulo="Ajustes da loja" voltar="/gestao" />

      <Link href="/gestao/categorias" className="flex items-center gap-3 rounded-3xl bg-white/70 p-4 ring-1 ring-linho/60">
        <LayoutGrid className="size-5 text-cobre" />
        <span className="flex-1">Categorias</span>
        <span className="text-cacau">›</span>
      </Link>

      <Bloco titulo="Dados da loja" dica="Aparecem no site e na imagem do status.">
        <div className="space-y-3">
          <Campo rotulo="WhatsApp que recebe os pedidos">
            <input value={whats} onChange={(e) => setWhats(e.target.value)} inputMode="tel" className={classeCampo} />
          </Campo>
          <Campo rotulo="Endereço">
            <input value={dados.endereco} onChange={(e) => setDados({ ...dados, endereco: e.target.value })} className={classeCampo} />
          </Campo>
          <Campo rotulo="Instagram (opcional)">
            <input value={dados.instagram ?? ""} onChange={(e) => setDados({ ...dados, instagram: e.target.value })} placeholder="@sualoja" className={classeCampo} autoCapitalize="none" />
          </Campo>
          <Campo rotulo="Horário (opcional)">
            <input value={dados.horario ?? ""} onChange={(e) => setDados({ ...dados, horario: e.target.value })} placeholder="Seg a sáb, das 8h às 18h" className={classeCampo} />
          </Campo>
          <Campo rotulo="Frase da loja">
            <input value={dados.frase} onChange={(e) => setDados({ ...dados, frase: e.target.value })} className={cn(classeCampo, "font-manuscrita text-2xl text-cobre")} />
          </Campo>
          <button type="button" onClick={salvar} disabled={salvando} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-chocolate text-creme disabled:opacity-60">
            {salvando ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />} Salvar
          </button>
        </div>
      </Bloco>

      <Bloco titulo="Entrar com a digital" dica="Aparelhos que entram na gestão sem código.">
        <ListaDigitais />
      </Bloco>

      <Bloco titulo="Ter o app na tela do celular">
        <div className="space-y-2 text-sm text-cacau">
          <p><strong className="text-chocolate">Android (Chrome):</strong> toque nos 3 pontinhos ⋮ e em &quot;Adicionar à tela inicial&quot;.</p>
          <p><strong className="text-chocolate">iPhone (Safari):</strong> toque em compartilhar (quadrado com a seta) e em &quot;Adicionar à Tela de Início&quot;.</p>
        </div>
      </Bloco>

      <button type="button" onClick={sair} className="mx-auto flex h-12 items-center gap-2 text-sm text-cacau">
        <LogOut className="size-4" /> Sair deste celular
      </button>
    </div>
  );
}
