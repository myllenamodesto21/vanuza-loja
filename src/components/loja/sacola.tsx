"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { ItemSacola } from "@/lib/whatsapp";

type Sacola = {
  itens: ItemSacola[];
  quantidade: number;
  total: number;
  aberta: boolean;
  pulo: number;
  abrir: () => void;
  fechar: () => void;
  adicionar: (item: Omit<ItemSacola, "chave" | "quantidade">, quantidade?: number) => void;
  mudarQuantidade: (chave: string, quantidade: number) => void;
  remover: (chave: string) => void;
  esvaziar: () => void;
};

const CHAVE = "vanuza.sacola";
const ContextoSacola = createContext<Sacola | null>(null);

function lerGuardado(): ItemSacola[] {
  try {
    const texto = localStorage.getItem(CHAVE);
    const itens = texto ? (JSON.parse(texto) as ItemSacola[]) : [];
    return Array.isArray(itens) ? itens : [];
  } catch {
    return [];
  }
}

export function ProvedorSacola({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>([]);
  const [carregada, setCarregada] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [pulo, setPulo] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o que ficou guardado no aparelho
    setItens(lerGuardado());
    setCarregada(true);
  }, []);

  useEffect(() => {
    if (!carregada) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      // sem armazenamento (aba anônima): a sacola vale só nesta visita
    }
  }, [itens, carregada]);

  const adicionar = useCallback<Sacola["adicionar"]>((item, quantidade = 1) => {
    const chave = [item.produtoId, item.tamanho ?? "", item.cor ?? ""].join("|");
    setItens((atuais) => {
      const existente = atuais.find((i) => i.chave === chave);
      if (existente) {
        return atuais.map((i) =>
          i.chave === chave ? { ...i, quantidade: Math.min(i.quantidade + quantidade, 20) } : i,
        );
      }
      return [...atuais, { ...item, chave, quantidade }];
    });
    setPulo((p) => p + 1);
  }, []);

  const valor = useMemo<Sacola>(
    () => ({
      itens,
      quantidade: itens.reduce((s, i) => s + i.quantidade, 0),
      total: itens.reduce((s, i) => s + i.quantidade * i.preco, 0),
      aberta,
      pulo,
      abrir: () => setAberta(true),
      fechar: () => setAberta(false),
      adicionar,
      mudarQuantidade: (chave, quantidade) =>
        setItens((atuais) =>
          quantidade <= 0
            ? atuais.filter((i) => i.chave !== chave)
            : atuais.map((i) => (i.chave === chave ? { ...i, quantidade: Math.min(quantidade, 20) } : i)),
        ),
      remover: (chave) => setItens((atuais) => atuais.filter((i) => i.chave !== chave)),
      esvaziar: () => setItens([]),
    }),
    [itens, aberta, pulo, adicionar],
  );

  return <ContextoSacola.Provider value={valor}>{children}</ContextoSacola.Provider>;
}

export function useSacola() {
  const sacola = useContext(ContextoSacola);
  if (!sacola) throw new Error("useSacola fora do ProvedorSacola");
  return sacola;
}
