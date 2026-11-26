"use client";

import {
  BadgePercent,
  ChevronRight,
  ExternalLink,
  EyeOff,
  LayoutGrid,
  LogOut,
  Package,
  PackageX,
  Plus,
  Settings,
  Share2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AtivarDigital, useDigital } from "@/components/gestao/digital";
import { useGestao } from "@/components/gestao/provedor";
import { FotoProduto } from "@/components/loja/foto-produto";
import { formatarDiaMes, formatarMoeda, hojeISO, somarDias } from "@/lib/formatacao";
import { emPromocao, precoAtual } from "@/lib/produtos";
import { enderecoDoSite } from "@/lib/whatsapp";

function saudacao() {
  const hora = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Manaus" }).format(new Date()));
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function CartaoDigital() {
  const params = useSearchParams();
  const { chaves } = useDigital();
  if (chaves == null) return null;
  if (chaves.length > 0 && !params.get("digital")) return null;
  return <AtivarDigital />;
}

export default function InicioGestao() {
  const { produtos, sair, avisar, nome } = useGestao();
  const hoje = hojeISO();
  const aVenda = produtos.filter((p) => p.visivel && !p.esgotado);
  const promo = produtos.filter((p) => p.visivel && emPromocao(p, hoje));
  const esgotados = produtos.filter((p) => p.esgotado);
  const escondidos = produtos.filter((p) => !p.visivel);
  const acabando = promo.filter((p) => p.promocao_ate && p.promocao_ate <= somarDias(hoje, 2));

  async function compartilharLoja() {
    const url = enderecoDoSite();
    const texto = "Olha as novidades da loja! Escolha e peça pelo WhatsApp:";
    if (navigator.share) await navigator.share({ title: "Vanuza Empreendimentos", text: texto, url }).catch(() => {});
    else {
      await navigator.clipboard.writeText(`${texto} ${url}`);
      avisar("Link copiado!");
    }
  }

  const numeros = [
    { nome: "À venda", valor: aVenda.length, Icone: Package, href: "/gestao/produtos" },
    { nome: "Em promoção", valor: promo.length, Icone: BadgePercent, href: "/gestao/produtos?filtro=promocao" },
    { nome: "Esgotados", valor: esgotados.length, Icone: PackageX, href: "/gestao/produtos?filtro=esgotados" },
    { nome: "Escondidos", valor: escondidos.length, Icone: EyeOff, href: "/gestao/produtos?filtro=escondidos" },
  ];

  const atalhos = [
    { nome: "Novo produto", detalhe: "foto, nome e preço", href: "/gestao/produtos/novo", Icone: Plus, destaque: true },
    { nome: "Postar no status", detalhe: "imagem pronta com preço", href: "/gestao/status", Icone: Smartphone },
    { nome: "Criar promoção", detalhe: "vários de uma vez", href: "/gestao/promocoes", Icone: BadgePercent },
    { nome: "Categorias", detalhe: "organizar a loja", href: "/gestao/categorias", Icone: LayoutGrid },
  ];

  return (
    <div className="pb-barra px-4 pt-6" style={{ paddingTop: "calc(1.5rem + env(safe-area-inset-top))" }}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca-pequena.webp" alt="" className="size-14 rounded-full" />
        <div>
          <p className="font-manuscrita text-2xl leading-none text-cobre">{saudacao()},</p>
          <h1 className="font-titulo text-3xl font-medium leading-tight">{nome || "Bem-vinda"}!</h1>
        </div>
        <Link href="/gestao/loja" className="ml-auto grid size-11 place-items-center rounded-full bg-white/70 ring-1 ring-linho" aria-label="Ajustes da loja">
          <Settings className="size-5" strokeWidth={1.6} />
        </Link>
      </div>

      <div className="mt-6">
        <Suspense>
          <CartaoDigital />
        </Suspense>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {numeros.map(({ nome, valor, Icone, href }) => (
          <Link key={nome} href={href} className="rounded-3xl bg-white/70 p-4 ring-1 ring-linho/60 transition active:scale-[0.97]">
            <Icone className="size-5 text-cobre" strokeWidth={1.6} />
            <p className="mt-2 font-titulo text-4xl font-medium leading-none">{valor}</p>
            <p className="mt-1 text-sm text-cacau">{nome}</p>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-xs uppercase tracking-[0.2em] text-cacau">O que vamos fazer?</h2>
      <div className="grid grid-cols-2 gap-3">
        {atalhos.map(({ nome, detalhe, href, Icone, destaque }) => (
          <Link
            key={nome}
            href={href}
            className={`flex flex-col gap-3 rounded-3xl p-4 transition active:scale-[0.97] ${destaque ? "bg-chocolate text-creme" : "bg-areia/80"}`}
          >
            <span className={`grid size-11 place-items-center rounded-full ${destaque ? "ouro-rose text-chocolate" : "bg-creme text-cobre-escuro"}`}>
              <Icone className="size-5" strokeWidth={1.8} />
            </span>
            <span>
              <span className="block font-medium">{nome}</span>
              <span className={`block text-xs ${destaque ? "text-creme/70" : "text-cacau"}`}>{detalhe}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={compartilharLoja} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/70 text-sm ring-1 ring-linho/60 active:scale-[0.97]">
          <Share2 className="size-4.5" /> Mandar link da loja
        </button>
        <a href="/" target="_blank" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/70 text-sm ring-1 ring-linho/60 active:scale-[0.97]">
          <ExternalLink className="size-4.5" /> Ver como cliente
        </a>
      </div>

      {acabando.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xs uppercase tracking-[0.2em] text-promo">Promoções acabando</h2>
          <div className="space-y-2">
            {acabando.map((p) => (
              <Link key={p.id} href={`/gestao/produtos/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 ring-1 ring-linho/60">
                <FotoProduto caminho={p.fotos[0]} nome="" className="size-12 rounded-xl" />
                <span className="min-w-0 flex-1 truncate text-sm">{p.nome}</span>
                <span className="text-xs text-promo">até {formatarDiaMes(p.promocao_ate as string)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {produtos.length > 0 && (
        <>
          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cacau">Últimos cadastrados</h2>
            <Link href="/gestao/produtos" className="flex items-center text-sm text-cobre-escuro">
              Todos <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="sem-rolagem -mx-4 flex gap-3 overflow-x-auto px-4">
            {produtos.slice(0, 10).map((p) => (
              <Link key={p.id} href={`/gestao/produtos/${p.id}`} className="w-28 shrink-0">
                <FotoProduto caminho={p.fotos[0]} nome={p.nome} className="aspect-[4/5] w-full rounded-2xl" />
                <p className="mt-1.5 truncate text-xs">{p.nome}</p>
                <p className="text-xs font-semibold">{formatarMoeda(precoAtual(p, hoje))}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={sair} className="mx-auto mt-10 flex items-center gap-2 text-sm text-cacau">
        <LogOut className="size-4" /> Sair deste celular
      </button>
    </div>
  );
}
