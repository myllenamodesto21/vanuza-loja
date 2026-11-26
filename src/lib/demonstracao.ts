import type { Categoria, Produto } from "./produtos";

// Só para ver o visual sem Supabase (npm run dev sem .env.local).
export const CATEGORIAS_DEMO: Categoria[] = [
  ["Perfumaria", "perfumaria", "perfume"],
  ["Feminino", "feminino", "vestido"],
  ["Masculino", "masculino", "camisa"],
  ["Infantil", "infantil", "infantil"],
  ["Calçados", "calcados", "sapato"],
  ["Bolsas", "bolsas", "bolsa"],
  ["Variedades", "variedades", "sparkles"],
].map(([nome, slug, icone], i) => ({
  id: `00000000-0000-4000-8000-00000000000${i + 1}`,
  nome,
  slug,
  icone,
  ordem: i + 1,
  ativa: true,
}));

const agora = new Date().toISOString();
const antigo = "2026-10-01T12:00:00Z";

function produto(
  n: number,
  nome: string,
  categoria: number,
  preco: number,
  extra: Partial<Produto> = {},
): Produto {
  return {
    id: `10000000-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`,
    nome,
    descricao: "Peça linda, com caimento perfeito e tecido de qualidade. Chama no WhatsApp para ver mais fotos.",
    categoria_id: CATEGORIAS_DEMO[categoria].id,
    preco,
    preco_promocional: null,
    promocao_ate: null,
    tamanhos: [],
    cores: [],
    quantidade: null,
    esgotado: false,
    visivel: true,
    destaque: false,
    fotos: [],
    criado_em: antigo,
    atualizado_em: antigo,
    ...extra,
  };
}

export const PRODUTOS_DEMO: Produto[] = [
  produto(1, "Vestido midi floral", 1, 139.9, { tamanhos: ["P", "M", "G"], preco_promocional: 109.9, destaque: true, criado_em: agora }),
  produto(2, "Perfume Rose Gold 100 ml", 0, 189.9, { preco_promocional: 159.9, quantidade: 2 }),
  produto(3, "Camisa polo masculina", 2, 79.9, { tamanhos: ["M", "G", "GG"], cores: ["Azul", "Preta"], criado_em: agora }),
  produto(4, "Conjunto infantil verão", 3, 69.9, { tamanhos: ["2", "4", "6", "8"] }),
  produto(5, "Sandália salto bloco", 4, 119.9, { tamanhos: ["34", "35", "36", "37", "38"], destaque: true }),
  produto(6, "Bolsa transversal caramelo", 5, 99.9, { preco_promocional: 79.9 }),
  produto(7, "Blusa de alça cetim", 1, 59.9, { tamanhos: ["P", "M", "G"], esgotado: true }),
  produto(8, "Kit presente hidratante", 6, 49.9, { criado_em: agora }),
];
