"use client";

import { Check, Fingerprint, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { formatarData } from "@/lib/formatacao";
import { supabaseNavegador } from "@/lib/supabase/navegador";

import { useGestao } from "./provedor";

type Chave = { id: string; friendly_name?: string; created_at: string; last_used_at?: string };

function nomeDoAparelho() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) {
    const modelo = ua.match(/Android [\d.]+; ([^;)]+)/)?.[1]?.trim();
    return modelo && modelo !== "K" ? modelo : "Celular Android";
  }
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Computador Windows";
  return "Aparelho";
}

export function useDigital() {
  const [chaves, setChaves] = useState<Chave[] | null>(null);
  const carregar = useCallback(
    () =>
      supabaseNavegador()
        .auth.passkey.list()
        .then(({ data }: { data: unknown }) => setChaves((data as Chave[] | null) ?? [])),
    [],
  );
  useEffect(() => {
    supabaseNavegador()
      .auth.passkey.list()
      .then(({ data }: { data: unknown }) => setChaves((data as Chave[] | null) ?? []));
  }, []);
  return { chaves, carregar };
}

export function AtivarDigital({ aoAtivar, compacto = false }: { aoAtivar?: () => void; compacto?: boolean }) {
  const { avisar } = useGestao();
  const [ocupado, setOcupado] = useState(false);
  const [feito, setFeito] = useState(false);

  async function ativar() {
    setOcupado(true);
    try {
      const sb = supabaseNavegador();
      const { data, error } = await sb.auth.registerPasskey();
      if (error) throw error;
      if (data?.id) await sb.auth.passkey.update({ passkeyId: data.id, friendlyName: nomeDoAparelho() });
      setFeito(true);
      avisar("Pronto! Da próxima vez, é só usar a digital.");
      aoAtivar?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      avisar(/NotAllowed|cancel|abort/i.test(msg) ? "Cancelado." : /exists|already/i.test(msg) ? "Este celular já está cadastrado." : "Não deu certo. Tente de novo.", "erro");
    } finally {
      setOcupado(false);
    }
  }

  if (compacto) {
    return (
      <button type="button" onClick={ativar} disabled={ocupado} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-chocolate text-creme disabled:opacity-70">
        {ocupado ? <Loader2 className="size-5 animate-spin" /> : <Fingerprint className="size-5" />}
        Cadastrar este aparelho
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-chocolate p-5 text-creme">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-rose/30 blur-2xl" />
      <div className="relative flex gap-4">
        <div className="ouro-rose grid size-14 shrink-0 place-items-center rounded-full">
          {feito ? <Check className="size-7 text-chocolate" /> : <Fingerprint className="size-8 text-chocolate" strokeWidth={1.5} />}
        </div>
        <div>
          <p className="font-titulo text-xl font-semibold">Entrar com a digital</p>
          <p className="mt-0.5 text-sm text-creme/80">
            Cadastre este celular uma vez e nunca mais precisa de código nem senha.
          </p>
        </div>
      </div>
      {!feito && (
        <button
          type="button"
          onClick={ativar}
          disabled={ocupado}
          className="relative mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-creme font-medium text-chocolate transition active:scale-[0.98] disabled:opacity-70"
        >
          {ocupado && <Loader2 className="size-5 animate-spin" />}
          Ativar agora
        </button>
      )}
    </div>
  );
}

export function ListaDigitais() {
  const { chaves, carregar } = useDigital();
  const { avisar } = useGestao();

  async function remover(id: string) {
    if (!confirm("Tirar este aparelho? Ele vai precisar do código do e-mail para entrar de novo.")) return;
    const { error } = await supabaseNavegador().auth.passkey.delete({ passkeyId: id });
    if (error) return avisar("Não deu para tirar.", "erro");
    avisar("Aparelho removido.");
    carregar();
  }

  if (chaves == null) return <Loader2 className="size-5 animate-spin text-cobre" />;

  return (
    <div className="space-y-3">
      {chaves.length === 0 && <p className="text-sm text-cacau">Nenhum aparelho com digital ainda.</p>}
      {chaves.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-linho/60">
          <Fingerprint className="size-6 text-cobre" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{c.friendly_name || "Aparelho"}</p>
            <p className="text-xs text-cacau">
              Desde {formatarData(c.created_at)}
              {c.last_used_at && ` · usado em ${formatarData(c.last_used_at)}`}
            </p>
          </div>
          <button type="button" onClick={() => remover(c.id)} className="grid size-10 place-items-center rounded-full text-cacau active:bg-areia" aria-label="Tirar aparelho">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <AtivarDigital compacto aoAtivar={carregar} />
    </div>
  );
}
