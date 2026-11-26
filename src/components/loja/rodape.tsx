import { MapPin } from "lucide-react";
import Link from "next/link";

import type { Loja } from "@/lib/produtos";
import { linkWhatsapp, telefoneBonito } from "@/lib/whatsapp";

import { IconeWhatsapp } from "./icone-whatsapp";

export function Rodape({ loja }: { loja: Loja }) {
  return (
    <footer className="mt-16 border-t border-linho/70 bg-areia/60">
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-10 md:pb-12">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Vanuza Empreendimentos" className="size-24 rounded-full ring-1 ring-rose/50" />
          <p className="mt-3 font-manuscrita text-3xl text-cobre">{loja.frase}</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-md gap-3 text-sm">
          <a
            href={linkWhatsapp(loja.whatsapp, "Oi, Vanuza! Vim pelo catálogo.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-linho/60"
          >
            <IconeWhatsapp className="size-5 text-whatsapp" />
            <span>{telefoneBonito(loja.whatsapp)}</span>
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loja.endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-linho/60"
          >
            <MapPin className="size-5 text-cobre" strokeWidth={1.6} />
            <span>{loja.endereco}</span>
          </a>
          {loja.instagram && (
            <a
              href={`https://instagram.com/${loja.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-linho/60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="size-5 text-cobre" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
              <span>@{loja.instagram.replace(/^@/, "")}</span>
            </a>
          )}
          {loja.horario && <p className="pt-1 text-center text-cacau">{loja.horario}</p>}
        </div>
        <p className="mt-10 text-center text-xs text-cacau/80">
          © {new Date().getFullYear()} {loja.nome} ·{" "}
          <Link href="/gestao" className="underline-offset-2 hover:underline">
            Área da loja
          </Link>
        </p>
      </div>
    </footer>
  );
}
