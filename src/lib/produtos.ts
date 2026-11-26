import { hojeISO } from "./formatacao";

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  icone: string;
  ordem: number;
  ativa: boolean;
};

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  categoria_id: string | null;
  preco: number;
  preco_promocional: number | null;
  promocao_ate: string | null;
  tamanhos: string[];
  cores: string[];
  quantidade: number | null;
  esgotado: boolean;
  visivel: boolean;
  destaque: boolean;
  fotos: string[];
  criado_em: string;
  atualizado_em: string;
};

export type Loja = {
  nome: string;
  frase: string;
  whatsapp: string;
  endereco: string;
  instagram: string | null;
  horario: string | null;
};

export const LOJA_PADRAO: Loja = {
  nome: "Vanuza Empreendimentos",
  frase: "Mais que moda, é você!",
  whatsapp: "5592991124806",
  endereco: "Rua Louro, nº 02, Honório Roldão, Manaus",
  instagram: null,
  horario: null,
};

export const COLUNAS_PRODUTO =
  "id, nome, descricao, categoria_id, preco, preco_promocional, promocao_ate, tamanhos, cores, quantidade, esgotado, visivel, destaque, fotos, criado_em, atualizado_em";

// Supabase devolve numeric como texto em alguns casos: normaliza.
export function normalizarProduto(linha: Record<string, unknown>): Produto {
  const p = linha as unknown as Produto;
  return {
    ...p,
    preco: Number(p.preco),
    preco_promocional: p.preco_promocional == null ? null : Number(p.preco_promocional),
    tamanhos: p.tamanhos ?? [],
    cores: p.cores ?? [],
    fotos: p.fotos ?? [],
  };
}

export function emPromocao(p: Pick<Produto, "preco_promocional" | "promocao_ate" | "preco">, hoje = hojeISO()) {
  return (
    p.preco_promocional != null &&
    p.preco_promocional < p.preco &&
    (p.promocao_ate == null || p.promocao_ate >= hoje)
  );
}

export function precoAtual(p: Produto, hoje = hojeISO()) {
  return emPromocao(p, hoje) ? (p.preco_promocional as number) : p.preco;
}

export function descontoPercentual(p: Produto) {
  if (p.preco_promocional == null) return 0;
  return Math.round((1 - p.preco_promocional / p.preco) * 100);
}

// Novo: cadastrado nos últimos 10 dias.
export function ehNovo(p: Produto, agora = Date.now()) {
  return agora - new Date(p.criado_em).getTime() < 10 * 24 * 60 * 60 * 1000;
}

export function ultimasPecas(p: Produto) {
  return !p.esgotado && p.quantidade != null && p.quantidade > 0 && p.quantidade <= 2;
}

export function urlFoto(caminho: string | undefined, mini = false) {
  if (!caminho) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const arquivo = mini ? caminhoDaMiniatura(caminho) : caminho;
  return `${base}/storage/v1/object/public/produtos/${arquivo}`;
}

// "abc/123.webp" -> "abc/123-mini.webp"
export function caminhoDaMiniatura(caminho: string) {
  return caminho.replace(/(\.\w+)$/, "-mini$1");
}

export function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export const ATALHOS_TAMANHOS: { nome: string; valores: string[] }[] = [
  { nome: "Roupa", valores: ["PP", "P", "M", "G", "GG", "XG"] },
  { nome: "Plus", valores: ["G1", "G2", "G3", "G4"] },
  { nome: "Calçado", valores: ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"] },
  { nome: "Infantil", valores: ["RN", "1", "2", "4", "6", "8", "10", "12", "14", "16"] },
  { nome: "Jeans", valores: ["36", "38", "40", "42", "44", "46", "48"] },
  { nome: "Perfume", valores: ["30 ml", "50 ml", "75 ml", "100 ml"] },
];
