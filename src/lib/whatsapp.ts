import { formatarMoeda } from "./formatacao";

export type ItemSacola = {
  chave: string;
  produtoId: string;
  nome: string;
  preco: number;
  foto: string | null;
  tamanho: string | null;
  cor: string | null;
  quantidade: number;
};

export function linkWhatsapp(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function telefoneBonito(numero: string) {
  const n = numero.replace(/^55/, "");
  return `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}`;
}

function detalhes(item: Pick<ItemSacola, "tamanho" | "cor">) {
  const partes = [item.tamanho && `tam. ${item.tamanho}`, item.cor && `cor ${item.cor}`].filter(Boolean);
  return partes.length ? ` (${partes.join(", ")})` : "";
}

export function mensagemDoPedido(itens: ItemSacola[], site: string) {
  const linhas = itens.map(
    (i) =>
      `• ${i.quantidade}x ${i.nome}${detalhes(i)}: ${formatarMoeda(i.preco * i.quantidade)}\n  ${site}/produto/${i.produtoId}`,
  );
  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  return [
    "Oi, Vanuza! Vi no catálogo e quero estes itens:",
    "",
    ...linhas,
    "",
    `Total: ${formatarMoeda(total)}`,
    "",
    "Ainda tem disponível?",
  ].join("\n");
}

export function mensagemDeUmProduto(
  item: Pick<ItemSacola, "nome" | "preco" | "tamanho" | "cor" | "produtoId">,
  site: string,
) {
  return [
    `Oi, Vanuza! Tenho interesse neste item:`,
    "",
    `• ${item.nome}${detalhes(item)}: ${formatarMoeda(item.preco)}`,
    `${site}/produto/${item.produtoId}`,
    "",
    "Ainda tem disponível?",
  ].join("\n");
}

export function enderecoDoSite() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanuza-loja.vercel.app").replace(/\/$/, "");
}
