"use client";

// Leituras e gravações da gestão, direto do celular. Quem confere a permissão é o banco (RLS).

import { prepararFoto } from "./imagens";
import {
  COLUNAS_PRODUTO,
  caminhoDaMiniatura,
  normalizarProduto,
  type Categoria,
  type Loja,
  type Produto,
} from "./produtos";
import { supabaseNavegador } from "./supabase/navegador";

export type DadosProduto = Omit<Produto, "id" | "criado_em" | "atualizado_em">;

function falhou(erro: { message: string } | null, padrao: string): never | void {
  if (!erro) return;
  const msg = erro.message ?? "";
  if (/row-level security/i.test(msg)) throw new Error("Este acesso não pode mudar a loja.");
  if (/permission denied/i.test(msg)) throw new Error(`Falta liberar a tabela no Supabase (${msg}).`);
  if (/promocao_menor_que_preco/.test(msg)) throw new Error("O preço da promoção precisa ser menor que o preço normal.");
  if (/Failed to fetch|network/i.test(msg)) throw new Error("Sem internet agora. Tente de novo em instantes.");
  throw new Error(msg ? `${padrao} (${msg})` : padrao);
}

export async function souAdmin() {
  const { data, error } = await supabaseNavegador().rpc("eh_admin");
  if (error) return false;
  return data === true;
}

export async function meuNome() {
  const sb = supabaseNavegador();
  const { data: claims } = await sb.auth.getClaims();
  const email = String(claims?.claims?.email ?? "").toLowerCase();
  const { data } = await sb.from("administradores").select("nome").eq("email", email).maybeSingle();
  return (data as { nome: string } | null)?.nome || "";
}

export async function listarTudo() {
  const sb = supabaseNavegador();
  const [produtos, categorias, loja] = await Promise.all([
    sb.from("produtos").select(COLUNAS_PRODUTO).order("criado_em", { ascending: false }),
    sb.from("categorias").select("id, nome, slug, icone, ordem, ativa").order("ordem"),
    sb.from("loja").select("nome, frase, whatsapp, endereco, instagram, horario").eq("id", 1).maybeSingle(),
  ]);
  falhou(produtos.error, "Não deu para carregar os produtos.");
  falhou(categorias.error, "Não deu para carregar as categorias.");
  falhou(loja.error, "Não deu para carregar os dados da loja.");
  return {
    produtos: (produtos.data ?? []).map((p: Record<string, unknown>) => normalizarProduto(p)),
    categorias: (categorias.data ?? []) as Categoria[],
    loja: loja.data as Loja | null,
  };
}

export async function obterProdutoGestao(id: string) {
  const { data, error } = await supabaseNavegador().from("produtos").select(COLUNAS_PRODUTO).eq("id", id).maybeSingle();
  falhou(error, "Não deu para abrir o produto.");
  return data ? normalizarProduto(data) : null;
}

export async function salvarProduto(dados: DadosProduto, id?: string) {
  const sb = supabaseNavegador();
  if (id) {
    const { error } = await sb.from("produtos").update(dados).eq("id", id);
    falhou(error, "Não deu para salvar.");
    return id;
  }
  const { data, error } = await sb.from("produtos").insert(dados).select("id").single();
  falhou(error, "Não deu para salvar.");
  return (data as { id: string }).id;
}

export async function mudarProdutos(ids: string[], mudanca: Partial<DadosProduto>) {
  const { error } = await supabaseNavegador().from("produtos").update(mudanca).in("id", ids);
  falhou(error, "Não deu para salvar.");
}

export async function excluirProdutos(produtos: Pick<Produto, "id" | "fotos">[]) {
  const sb = supabaseNavegador();
  const { error } = await sb.from("produtos").delete().in("id", produtos.map((p) => p.id));
  falhou(error, "Não deu para excluir.");
  await removerFotos(produtos.flatMap((p) => p.fotos));
}

export async function duplicarProduto(p: Produto) {
  const { id: _id, criado_em: _c, atualizado_em: _a, ...resto } = p;
  void _id; void _c; void _a;
  return salvarProduto({ ...resto, nome: `${p.nome} (cópia)`.slice(0, 80), fotos: [] });
}

export async function enviarFoto(arquivo: File) {
  const { grande, mini, extensao, tipo } = await prepararFoto(arquivo);
  const base = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}`;
  const caminho = `${base}.${extensao}`;
  const sb = supabaseNavegador().storage.from("produtos");
  const opcoes = { contentType: tipo, cacheControl: "31536000", upsert: false };
  const [a, b] = await Promise.all([
    sb.upload(caminho, grande, opcoes),
    sb.upload(caminhoDaMiniatura(caminho), mini, opcoes),
  ]);
  falhou(a.error ?? b.error, "Não deu para enviar a foto.");
  return caminho;
}

export async function removerFotos(caminhos: string[]) {
  if (!caminhos.length) return;
  await supabaseNavegador()
    .storage.from("produtos")
    .remove(caminhos.flatMap((c) => [c, caminhoDaMiniatura(c)]));
}

export async function aplicarPromocao(ids: string[], desconto: { percentual?: number; preco?: number }, ate: string | null) {
  const { data, error } = await supabaseNavegador().rpc("aplicar_promocao", {
    p_ids: ids,
    p_percentual: desconto.percentual ?? null,
    p_preco: desconto.preco ?? null,
    p_ate: ate,
  });
  falhou(error, "Não deu para aplicar a promoção.");
  return data as number;
}

export async function encerrarPromocao(ids: string[]) {
  const { error } = await supabaseNavegador().rpc("encerrar_promocao", { p_ids: ids });
  falhou(error, "Não deu para encerrar a promoção.");
}

export async function salvarCategorias(categorias: Categoria[], removidas: string[]) {
  const sb = supabaseNavegador();
  if (removidas.length) {
    const { error } = await sb.from("categorias").delete().in("id", removidas);
    falhou(error, "Não deu para remover a categoria.");
  }
  const { error } = await sb
    .from("categorias")
    .upsert(categorias.map((c, i) => ({ ...c, ordem: i + 1 })));
  falhou(error, "Não deu para salvar as categorias.");
}

export async function salvarLoja(loja: Loja) {
  const { error } = await supabaseNavegador().from("loja").update(loja).eq("id", 1);
  falhou(error, "Não deu para salvar os dados da loja.");
}
