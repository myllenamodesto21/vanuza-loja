"use client";

import { ArrowLeft, Fingerprint, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { supabaseNavegador } from "@/lib/supabase/navegador";

const CHAVE_EMAIL = "vanuza.email";
type Etapa = "inicio" | "email" | "codigo";

function traduzir(erro: unknown) {
  const msg = erro instanceof Error ? erro.message : String(erro ?? "");
  if (/NotAllowed|cancel|abort/i.test(msg)) return "Cancelado. Toque de novo quando quiser.";
  if (/expired|invalid|token/i.test(msg)) return "Código errado ou vencido. Peça um novo.";
  if (/rate|too many|seconds/i.test(msg)) return "Muitas tentativas. Espere 1 minutinho e tente de novo.";
  if (/passkey|credential|webauthn/i.test(msg)) return "Este celular ainda não tem a digital cadastrada. Entre com o código do e-mail.";
  if (/fetch|network/i.test(msg)) return "Sem internet agora. Tente de novo.";
  return "Não deu certo. Tente de novo.";
}

export default function Entrar() {
  const [etapa, setEtapa] = useState<Etapa>("inicio");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [temDigital, setTemDigital] = useState(true);
  const [nome, setNome] = useState("");
  const campoCodigo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- e-mail lembrado no aparelho
      setEmail(localStorage.getItem(CHAVE_EMAIL) ?? "");
      setNome(localStorage.getItem("vanuza.nome") ?? "");
    } catch {}
    setTemDigital(typeof window !== "undefined" && "PublicKeyCredential" in window);
  }, []);

  function irParaGestao(primeiraVez = false) {
    window.location.href = primeiraVez ? "/gestao?digital=1" : "/gestao";
  }

  async function entrarComDigital() {
    setErro("");
    setOcupado(true);
    try {
      const { error } = await supabaseNavegador().auth.signInWithPasskey();
      if (error) throw error;
      irParaGestao();
    } catch (e) {
      setErro(traduzir(e));
      setOcupado(false);
    }
  }

  async function pedirCodigo(e?: React.FormEvent) {
    e?.preventDefault();
    setErro("");
    const limpo = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(limpo)) return setErro("Confira o e-mail.");
    setOcupado(true);
    try {
      const sb = supabaseNavegador();
      const { data: pode } = await sb.rpc("email_pode_entrar", { p_email: limpo });
      if (pode) {
        const { error } = await sb.auth.signInWithOtp({ email: limpo, options: { shouldCreateUser: false } });
        if (error) throw error;
      }
      try {
        localStorage.setItem(CHAVE_EMAIL, limpo);
      } catch {}
      setEmail(limpo);
      setEtapa("codigo");
      setTimeout(() => campoCodigo.current?.focus(), 50);
    } catch (e) {
      setErro(traduzir(e));
    } finally {
      setOcupado(false);
    }
  }

  async function conferirCodigo(valor: string) {
    setErro("");
    setOcupado(true);
    try {
      const { error } = await supabaseNavegador().auth.verifyOtp({ email, token: valor, type: "email" });
      if (error) throw error;
      irParaGestao(true);
    } catch (e) {
      setErro(traduzir(e));
      setCodigo("");
      setOcupado(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-rose/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-white blur-3xl" />

      <div className="relative w-full max-w-sm text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca.webp" alt="Vanuza Empreendimentos" className="mx-auto size-36 rounded-full shadow-[0_18px_50px_-18px_rgba(134,80,58,0.6)]" />
        <p className="mt-6 font-manuscrita text-3xl text-cobre">{nome ? `Olá, ${nome}!` : "Olá!"}</p>
        <h1 className="font-titulo text-3xl font-medium">Gestão da loja</h1>

        {etapa === "inicio" && (
          <div className="mt-8 space-y-3">
            {temDigital && (
              <button
                type="button"
                onClick={entrarComDigital}
                disabled={ocupado}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-chocolate text-lg text-creme shadow-lg transition active:scale-[0.98] disabled:opacity-70"
              >
                {ocupado ? <Loader2 className="size-6 animate-spin" /> : <Fingerprint className="size-7" strokeWidth={1.5} />}
                Entrar com a digital
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setErro("");
                setEtapa("email");
              }}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-white/80 text-chocolate ring-1 ring-linho transition active:scale-[0.98]"
            >
              <Mail className="size-5" strokeWidth={1.6} />
              Receber código no e-mail
            </button>
            {temDigital && (
              <p className="pt-2 text-sm text-cacau">
                Digital ou rosto, do jeito que você desbloqueia o celular. Primeira vez neste celular? Use o código do e-mail.
              </p>
            )}
          </div>
        )}

        {etapa === "email" && (
          <form onSubmit={pedirCodigo} className="mt-8 space-y-3 text-left">
            <label className="block text-sm text-cacau" htmlFor="email">Seu e-mail</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-2xl bg-white px-4 text-lg ring-1 ring-linho outline-none focus:ring-2 focus:ring-rose"
              autoFocus
            />
            <button
              type="submit"
              disabled={ocupado}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-chocolate text-creme transition active:scale-[0.98] disabled:opacity-70"
            >
              {ocupado && <Loader2 className="size-5 animate-spin" />}
              Mandar o código
            </button>
            <button type="button" onClick={() => setEtapa("inicio")} className="mx-auto flex items-center gap-1 pt-2 text-sm text-cacau">
              <ArrowLeft className="size-4" /> Voltar
            </button>
          </form>
        )}

        {etapa === "codigo" && (
          <div className="mt-8 space-y-3">
            <p className="text-cacau">
              Mandamos um código de números para <strong className="text-chocolate">{email}</strong>. Pode demorar um minutinho (olhe também o spam).
            </p>
            <input
              ref={campoCodigo}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={codigo}
              disabled={ocupado}
              onChange={(e) => {
                // O Supabase manda 6 ou 8 números, conforme a configuração do projeto.
                const valor = e.target.value.replace(/\D/g, "").slice(0, 10);
                setCodigo(valor);
                if (valor.length === 8) conferirCodigo(valor);
              }}
              placeholder="00000000"
              className="h-16 w-full rounded-2xl bg-white text-center text-2xl tracking-[0.35em] ring-1 ring-linho outline-none focus:ring-2 focus:ring-rose"
              aria-label="Código do e-mail"
            />
            <button
              type="button"
              onClick={() => conferirCodigo(codigo)}
              disabled={ocupado || codigo.length < 6}
              className="flex h-14 w-full items-center justify-center rounded-full bg-chocolate text-creme transition active:scale-[0.98] disabled:opacity-40"
            >
              Entrar
            </button>
            {ocupado && <Loader2 className="mx-auto size-6 animate-spin text-cobre" />}
            <div className="flex justify-center gap-5 pt-1 text-sm text-cacau">
              <button type="button" onClick={() => setEtapa("email")}>Trocar e-mail</button>
              <button type="button" onClick={() => pedirCodigo()} disabled={ocupado}>Mandar de novo</button>
            </div>
          </div>
        )}

        {erro && <p className="mt-4 animate-surgir rounded-2xl bg-promo/10 px-4 py-3 text-sm text-promo">{erro}</p>}

        <Link href="/" className="mt-10 inline-block text-sm text-cacau underline-offset-2 hover:underline">
          Ver a loja
        </Link>
      </div>
    </div>
  );
}
