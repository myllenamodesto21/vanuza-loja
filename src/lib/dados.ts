import "server-only";

import { cache } from "react";

import { supabaseConfigurado } from "./supabase/config";
import { supabasePublico } from "./supabase/publico";
import {
  COLUNAS_PRODUTO,
  LOJA_PADRAO,
  normalizarProduto,
  type Categoria,
  type Loja,
  type Produto,
} from "./produtos";
import { CATEGORIAS_DEMO, PRODUTOS_DEMO } from "./demonstracao";

// Leituras do catálogo para as páginas públicas. Sem Supabase configurado (ambiente local),
// mostra produtos de demonstração para dar para ver o visual.

export const obterLoja = cache(async (): Promise<Loja> => {
  if (!supabaseConfigurado()) return LOJA_PADRAO;
  const { data } = await supabasePublico()
    .from("loja")
    .select("nome, frase, whatsapp, endereco, instagram, horario")
    .eq("id", 1)
    .maybeSingle();
  return (data as Loja | null) ?? LOJA_PADRAO;
});

export const listarCategorias = cache(async (): Promise<Categoria[]> => {
  if (!supabaseConfigurado()) return CATEGORIAS_DEMO;
  const { data } = await supabasePublico()
    .from("categorias")
    .select("id, nome, slug, icone, ordem, ativa")
    .eq("ativa", true)
    .order("ordem");
  return (data as Categoria[] | null) ?? [];
});

export const listarProdutos = cache(async (): Promise<Produto[]> => {
  if (!supabaseConfigurado()) return PRODUTOS_DEMO;
  const { data } = await supabasePublico()
    .from("produtos")
    .select(COLUNAS_PRODUTO)
    .eq("visivel", true)
    .order("criado_em", { ascending: false })
    .limit(1000);
  return (data ?? []).map((linha) => normalizarProduto(linha));
});

export const obterProduto = cache(async (id: string): Promise<Produto | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const produtos = await listarProdutos();
  return produtos.find((p) => p.id === id) ?? null;
});
