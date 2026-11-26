import {
  Baby,
  Backpack,
  Crown,
  Footprints,
  Gem,
  Gift,
  Glasses,
  Handbag,
  Heart,
  Shirt,
  Sparkles,
  Watch,
  type LucideProps,
} from "lucide-react";

type Props = { className?: string; strokeWidth?: number };

function Vestido(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <path d="M9 2.5v3.2c0 .8-.4 1.5-1 2l-.3.2L9.5 11 5 21h14l-4.5-10 1.8-3.1-.3-.2c-.6-.5-1-1.2-1-2V2.5" />
      <path d="M9 2.5c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
      <path d="M9.5 11h5" />
    </svg>
  );
}

function Perfume(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <rect x="10" y="2.5" width="4" height="3" rx="0.6" />
      <path d="M10.5 5.5v2.2M13.5 5.5v2.2" />
      <rect x="5.5" y="7.7" width="13" height="13.8" rx="3.2" />
      <path d="M9 13.5c1.8-1.5 4.2-1.5 6 0" />
      <path d="M17 3.5h2.5M18.25 2.25v2.5" />
    </svg>
  );
}

function Salto(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.5} strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <path d="M3 9.5c0-1 .8-1.6 1.7-1.3 2.4.8 4 2.6 5.5 4.9 1 1.6 2.6 2.4 4.5 2.4H19c1.4 0 2.5 1.1 2.5 2.5v.5H8.5" />
      <path d="M3 9.5v3.5c0 1.5.6 3 1.6 4.1L5.5 18" />
      <path d="M5.5 18v3.5" />
    </svg>
  );
}

const LUCIDE: Record<string, React.ComponentType<LucideProps>> = {
  camisa: Shirt,
  infantil: Baby,
  bolsa: Handbag,
  sparkles: Sparkles,
  joia: Gem,
  relogio: Watch,
  oculos: Glasses,
  presente: Gift,
  coracao: Heart,
  tenis: Footprints,
  mochila: Backpack,
  coroa: Crown,
};

const PROPRIOS: Record<string, (p: Props) => React.ReactElement> = {
  vestido: Vestido,
  perfume: Perfume,
  sapato: Salto,
};

export const ICONES_CATEGORIA: { chave: string; nome: string }[] = [
  { chave: "perfume", nome: "Perfume" },
  { chave: "vestido", nome: "Vestido" },
  { chave: "camisa", nome: "Camisa" },
  { chave: "infantil", nome: "Infantil" },
  { chave: "sapato", nome: "Salto" },
  { chave: "tenis", nome: "Tênis" },
  { chave: "bolsa", nome: "Bolsa" },
  { chave: "mochila", nome: "Mochila" },
  { chave: "joia", nome: "Joia" },
  { chave: "relogio", nome: "Relógio" },
  { chave: "oculos", nome: "Óculos" },
  { chave: "presente", nome: "Presente" },
  { chave: "coracao", nome: "Coração" },
  { chave: "coroa", nome: "Coroa" },
  { chave: "sparkles", nome: "Brilho" },
];

export function IconeCategoria({ icone, className, strokeWidth = 1.5 }: { icone: string } & Props) {
  const Proprio = PROPRIOS[icone];
  if (Proprio) return <Proprio className={className} strokeWidth={strokeWidth} />;
  const Lucide = LUCIDE[icone] ?? Sparkles;
  return <Lucide className={className} strokeWidth={strokeWidth} aria-hidden />;
}
