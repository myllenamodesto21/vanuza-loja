"use client";

import { Check, ExternalLink, Loader2, Plus, Smartphone, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconeCategoria } from "@/components/icone-categoria";
import { formatarData, formatarMoeda, hojeISO, lerPreco, precoParaCampo, somarDias } from "@/lib/formatacao";
import { excluirProdutos, removerFotos, salvarProduto, type DadosProduto } from "@/lib/gestao";
import { ATALHOS_TAMANHOS, type Produto } from "@/lib/produtos";
import { cn } from "@/lib/utils";

import { Bloco, classeCampo, Interruptor, Pilula } from "./campos";
import { FotosDoProduto } from "./fotos-do-produto";
import { useGestao } from "./provedor";
import { TopoGestao } from "./casca";

const PERCENTUAIS = [10, 15, 20, 30, 40, 50];

function fimDoMes(hoje: string) {
  const [a, m] = hoje.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

export function FormularioProduto({ produto }: { produto?: Produto }) {
  const { categorias, recarregar, avisar } = useGestao();
  const router = useRouter();
  const hoje = hojeISO();

  const [fotos, setFotos] = useState<string[]>(produto?.fotos ?? []);
  const [enviando, setEnviando] = useState(0);
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [preco, setPreco] = useState(precoParaCampo(produto?.preco));
  const [categoriaId, setCategoriaId] = useState<string | null>(produto?.categoria_id ?? null);
  const [comPromo, setComPromo] = useState(produto?.preco_promocional != null);
  const [precoPromo, setPrecoPromo] = useState(precoParaCampo(produto?.preco_promocional));
  const [promoAte, setPromoAte] = useState<string>(produto?.promocao_ate ?? "");
  const [tamanhos, setTamanhos] = useState<string[]>(produto?.tamanhos ?? []);
  const [grupoTamanho, setGrupoTamanho] = useState(0);
  const [tamanhoNovo, setTamanhoNovo] = useState("");
  const [cores, setCores] = useState<string[]>(produto?.cores ?? []);
  const [corNova, setCorNova] = useState("");
  const [controlarEstoque, setControlarEstoque] = useState(produto?.quantidade != null);
  const [quantidade, setQuantidade] = useState(produto?.quantidade ?? 1);
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [destaque, setDestaque] = useState(produto?.destaque ?? false);
  const [visivel, setVisivel] = useState(produto?.visivel ?? true);
  const [esgotado, setEsgotado] = useState(produto?.esgotado ?? false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState<string | null>(null);

  const valorPreco = lerPreco(preco);
  const valorPromo = lerPreco(precoPromo);

  function aplicarPercentual(p: number) {
    if (!valorPreco) return setErros((e) => ({ ...e, preco: "Ponha o preço primeiro." }));
    setPrecoPromo(precoParaCampo(Math.round(valorPreco * (1 - p / 100) * 100) / 100));
  }

  function alternarTamanho(t: string) {
    setTamanhos((atual) => {
      if (atual.includes(t)) return atual.filter((x) => x !== t);
      // mantém a ordem do atalho
      const ordem = ATALHOS_TAMANHOS.flatMap((g) => g.valores);
      return [...atual, t].sort((a, b) => {
        const ia = ordem.indexOf(a), ib = ordem.indexOf(b);
        return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      });
    });
  }

  function adicionarLivre(valor: string, lista: string[], set: (l: string[]) => void, limpar: () => void) {
    const v = valor.trim();
    if (v && !lista.some((x) => x.toLowerCase() === v.toLowerCase())) set([...lista, v.slice(0, 20)]);
    limpar();
  }

  async function salvar() {
    const novos: Record<string, string> = {};
    if (!nome.trim()) novos.nome = "Dê um nome ao produto.";
    if (!valorPreco) novos.preco = "Ponha o preço (ex.: 89,90).";
    if (comPromo && (!valorPromo || (valorPreco && valorPromo >= valorPreco)))
      novos.promo = "O preço da promoção precisa ser menor que o normal.";
    setErros(novos);
    if (Object.keys(novos).length) {
      avisar("Falta arrumar um detalhe.", "erro");
      document.getElementById(`campo-${Object.keys(novos)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (enviando > 0) return avisar("Espere as fotos terminarem de subir.", "erro");

    const dados: DadosProduto = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      categoria_id: categoriaId,
      preco: valorPreco as number,
      preco_promocional: comPromo ? valorPromo : null,
      promocao_ate: comPromo && promoAte ? promoAte : null,
      tamanhos,
      cores,
      quantidade: controlarEstoque ? Math.max(0, quantidade) : null,
      esgotado: controlarEstoque ? quantidade <= 0 : esgotado,
      visivel,
      destaque,
      fotos,
    };

    setSalvando(true);
    try {
      const id = await salvarProduto(dados, produto?.id);
      const tiradas = (produto?.fotos ?? []).filter((f) => !fotos.includes(f));
      removerFotos(tiradas).catch(() => {});
      await recarregar();
      if (produto) {
        avisar("Salvo!");
        router.push("/gestao/produtos");
      } else {
        setSalvo(id);
      }
    } catch (e) {
      avisar((e as Error).message, "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!produto) return;
    if (!confirm(`Excluir "${produto.nome}" de vez? Se for só tirar da loja por um tempo, use "Aparece na loja".`)) return;
    try {
      await excluirProdutos([produto]);
      await recarregar();
      avisar("Produto excluído.");
      router.push("/gestao/produtos");
    } catch (e) {
      avisar((e as Error).message, "erro");
    }
  }

  if (salvo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="ouro-rose grid size-24 animate-pulo place-items-center rounded-full">
          <Check className="size-12 text-chocolate" strokeWidth={2.2} />
        </div>
        <p className="mt-5 font-manuscrita text-3xl text-cobre">que lindo!</p>
        <h1 className="font-titulo text-3xl font-medium">Produto cadastrado</h1>
        <p className="mt-1 text-cacau">Já está aparecendo na loja.</p>
        <div className="mt-8 grid w-full max-w-xs gap-3">
          <Link href={`/gestao/status?ids=${salvo}`} className="flex h-14 items-center justify-center gap-2 rounded-full bg-chocolate text-creme">
            <Smartphone className="size-5" /> Postar no status
          </Link>
          <button type="button" onClick={() => window.location.reload()} className="flex h-14 items-center justify-center gap-2 rounded-full bg-white/80 ring-1 ring-linho">
            <Plus className="size-5" /> Cadastrar outro
          </button>
          <Link href="/gestao/produtos" className="h-12 pt-3 text-sm text-cacau">Ver meus produtos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <TopoGestao
        titulo={produto ? "Editar produto" : "Novo produto"}
        voltar="/gestao/produtos"
        direita={
          produto && (
            <a href={`/produto/${produto.id}`} target="_blank" className="grid size-10 place-items-center rounded-full bg-white/70 ring-1 ring-linho" aria-label="Ver na loja">
              <ExternalLink className="size-4.5" />
            </a>
          )
        }
      />
      <div className="space-y-3 px-4">
        <Bloco titulo="Fotos" dica="A primeira é a capa. Pode pôr até 10.">
          <FotosDoProduto fotos={fotos} aoMudar={setFotos} aoEnviar={(n) => setEnviando((e) => e + n)} />
        </Bloco>

        <Bloco>
          <label id="campo-nome" className="block">
            <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-cacau">Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} placeholder="Ex.: Vestido midi floral" className={cn(classeCampo, "mt-2", erros.nome && "ring-2 ring-promo")} autoCapitalize="sentences" />
            {erros.nome && <span className="mt-1 block text-sm text-promo">{erros.nome}</span>}
          </label>
          <label id="campo-preco" className="mt-4 block">
            <span className="text-[13px] font-medium uppercase tracking-[0.14em] text-cacau">Preço</span>
            <span className={cn("mt-2 flex items-center rounded-2xl bg-creme ring-1 ring-linho focus-within:bg-white focus-within:ring-2 focus-within:ring-rose", erros.preco && "ring-2 ring-promo")}>
              <span className="pl-4 text-lg text-cacau">R$</span>
              <input value={preco} onChange={(e) => setPreco(e.target.value.replace(/[^\d,.]/g, ""))} inputMode="decimal" placeholder="0,00" className="h-14 w-full bg-transparent px-2 text-2xl font-semibold outline-none" />
            </span>
            {erros.preco && <span className="mt-1 block text-sm text-promo">{erros.preco}</span>}
          </label>
        </Bloco>

        <Bloco titulo="Categoria">
          <div className="grid grid-cols-3 gap-2">
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoriaId((a) => (a === c.id ? null : c.id))}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-3 text-xs transition active:scale-95",
                  categoriaId === c.id ? "bg-chocolate text-creme" : "bg-creme ring-1 ring-linho",
                  !c.ativa && "opacity-60",
                )}
              >
                <IconeCategoria icone={c.icone} className="size-6" strokeWidth={1.5} />
                {c.nome}
              </button>
            ))}
          </div>
        </Bloco>

        <Bloco>
          <Interruptor ligado={comPromo} aoMudar={setComPromo} rotulo="Está em promoção" detalhe="Aparece com o preço riscado e o selo de desconto" />
          {comPromo && (
            <div id="campo-promo" className="mt-3 animate-surgir space-y-3 border-t border-linho/70 pt-3">
              <div className="sem-rolagem -mx-4 flex gap-2 overflow-x-auto px-4">
                {PERCENTUAIS.map((p) => (
                  <Pilula key={p} ativa={!!valorPreco && !!valorPromo && Math.round((1 - valorPromo / valorPreco) * 100) === p} onClick={() => aplicarPercentual(p)}>
                    -{p}%
                  </Pilula>
                ))}
              </div>
              <span className={cn("flex items-center rounded-2xl bg-creme ring-1 ring-linho focus-within:bg-white focus-within:ring-2 focus-within:ring-rose", erros.promo && "ring-2 ring-promo")}>
                <span className="pl-4 text-lg text-promo">R$</span>
                <input value={precoPromo} onChange={(e) => setPrecoPromo(e.target.value.replace(/[^\d,.]/g, ""))} inputMode="decimal" placeholder="Preço da promoção" className="h-14 w-full bg-transparent px-2 text-2xl font-semibold text-promo outline-none placeholder:text-base placeholder:font-normal" />
              </span>
              {erros.promo && <span className="block text-sm text-promo">{erros.promo}</span>}
              {valorPreco && valorPromo && valorPromo < valorPreco && (
                <p className="text-sm text-cacau">
                  De <s>{formatarMoeda(valorPreco)}</s> por <strong className="text-promo">{formatarMoeda(valorPromo)}</strong>
                </p>
              )}
              <div>
                <p className="mb-2 text-sm text-cacau">Vale até</p>
                <div className="flex flex-wrap gap-2">
                  <Pilula ativa={!promoAte} onClick={() => setPromoAte("")}>Sem data</Pilula>
                  <Pilula ativa={promoAte === somarDias(hoje, 3)} onClick={() => setPromoAte(somarDias(hoje, 3))}>3 dias</Pilula>
                  <Pilula ativa={promoAte === somarDias(hoje, 7)} onClick={() => setPromoAte(somarDias(hoje, 7))}>1 semana</Pilula>
                  <Pilula ativa={promoAte === fimDoMes(hoje)} onClick={() => setPromoAte(fimDoMes(hoje))}>Fim do mês</Pilula>
                </div>
                <input type="date" value={promoAte} min={hoje} onChange={(e) => setPromoAte(e.target.value)} className={cn(classeCampo, "mt-2 h-12 text-base")} />
                {promoAte && <p className="mt-1 text-xs text-cacau">Termina sozinha depois de {formatarData(promoAte)}.</p>}
              </div>
            </div>
          )}
        </Bloco>

        <Bloco titulo="Tamanhos" dica="Toque para marcar. Deixe vazio se for tamanho único.">
          <div className="sem-rolagem -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4">
            {ATALHOS_TAMANHOS.map((g, i) => (
              <button key={g.nome} type="button" onClick={() => setGrupoTamanho(i)} className={cn("h-8 shrink-0 rounded-full px-3 text-xs", grupoTamanho === i ? "bg-rose/40 text-chocolate" : "text-cacau")}>
                {g.nome}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ATALHOS_TAMANHOS[grupoTamanho].valores.map((t) => (
              <Pilula key={t} ativa={tamanhos.includes(t)} onClick={() => alternarTamanho(t)}>{t}</Pilula>
            ))}
          </div>
          {tamanhos.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-linho/70 pt-3 text-sm">
              <span className="text-cacau">Marcados:</span>
              {tamanhos.map((t) => (
                <button key={t} type="button" onClick={() => alternarTamanho(t)} className="flex items-center gap-1 rounded-full bg-chocolate px-2.5 py-1 text-xs text-creme">
                  {t} <X className="size-3" />
                </button>
              ))}
            </div>
          )}
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); adicionarLivre(tamanhoNovo, tamanhos, setTamanhos, () => setTamanhoNovo("")); }}>
            <input value={tamanhoNovo} onChange={(e) => setTamanhoNovo(e.target.value)} placeholder="Outro tamanho" className={cn(classeCampo, "h-11 text-base")} />
            <button type="submit" className="h-11 shrink-0 rounded-2xl bg-areia px-4 text-sm">Pôr</button>
          </form>
        </Bloco>

        <Bloco titulo="Cores" dica="Opcional. Ex.: Preto, Nude, Rosa.">
          {cores.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {cores.map((c) => (
                <button key={c} type="button" onClick={() => setCores(cores.filter((x) => x !== c))} className="flex items-center gap-1 rounded-full bg-chocolate px-3 py-1.5 text-sm text-creme">
                  {c} <X className="size-3.5" />
                </button>
              ))}
            </div>
          )}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); adicionarLivre(corNova, cores, setCores, () => setCorNova("")); }}>
            <input value={corNova} onChange={(e) => setCorNova(e.target.value)} placeholder="Nome da cor" className={cn(classeCampo, "h-11 text-base")} autoCapitalize="words" />
            <button type="submit" className="h-11 shrink-0 rounded-2xl bg-areia px-4 text-sm">Pôr</button>
          </form>
        </Bloco>

        <Bloco>
          <Interruptor ligado={controlarEstoque} aoMudar={setControlarEstoque} rotulo="Contar quantas peças tenho" detalhe="Quando chega a zero, fica esgotado sozinho" />
          {controlarEstoque ? (
            <div className="mt-3 flex items-center justify-center gap-5 border-t border-linho/70 pt-3">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(0, q - 1))} className="grid size-12 place-items-center rounded-full bg-areia text-2xl">−</button>
              <span className="w-16 text-center font-titulo text-4xl font-medium">{quantidade}</span>
              <button type="button" onClick={() => setQuantidade((q) => q + 1)} className="grid size-12 place-items-center rounded-full bg-areia text-2xl">+</button>
            </div>
          ) : (
            <Interruptor ligado={esgotado} aoMudar={setEsgotado} rotulo="Esgotado" detalhe="Continua na loja, com o selo de esgotado" />
          )}
        </Bloco>

        <Bloco titulo="Descrição" dica="Opcional: tecido, medidas, fragrância, detalhes.">
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={1000} rows={4} className={cn(classeCampo, "h-auto py-3 text-base")} placeholder="Ex.: Tecido leve, não amassa, com forro." />
        </Bloco>

        <Bloco>
          <Interruptor ligado={visivel} aoMudar={setVisivel} rotulo="Aparece na loja" detalhe="Desligado, fica guardado só aqui na gestão" />
          <Interruptor ligado={destaque} aoMudar={setDestaque} rotulo="Queridinho" detalhe="Aparece em destaque no início da loja" />
        </Bloco>

        {produto && (
          <button type="button" onClick={excluir} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm text-promo">
            <Trash2 className="size-4" /> Excluir produto
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linho/70 bg-creme/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl gap-2">
          {produto && (
            <Link href={`/gestao/status?ids=${produto.id}`} className="grid size-14 shrink-0 place-items-center rounded-full bg-white ring-1 ring-linho" aria-label="Postar no status">
              <Smartphone className="size-5" />
            </Link>
          )}
          <button type="button" onClick={salvar} disabled={salvando} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-chocolate text-lg text-creme shadow-lg transition active:scale-[0.98] disabled:opacity-70">
            {salvando || enviando > 0 ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
            {enviando > 0 ? "Subindo fotos..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
