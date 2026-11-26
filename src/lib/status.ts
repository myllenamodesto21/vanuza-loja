// Monta a imagem do status do WhatsApp (1080 x 1920) no próprio celular.

import { formatarMoeda } from "./formatacao";
import { descontoPercentual, emPromocao, urlFoto, type Loja, type Produto } from "./produtos";
import { telefoneBonito } from "./whatsapp";

const L = 1080;
const A = 1920;

function fonteDaVariavel(nome: string, reserva: string) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return valor || reserva;
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolver(img);
    img.onerror = () => rejeitar(new Error("Não deu para carregar a foto."));
    img.src = src;
  });
}

function retanguloArredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cobrir(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / escala;
  const sh = h / escala;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function quebrarLinhas(ctx: CanvasRenderingContext2D, texto: string, largura: number, maxLinhas: number) {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > largura && atual) {
      linhas.push(atual);
      atual = p;
    } else atual = teste;
  }
  if (atual) linhas.push(atual);
  if (linhas.length > maxLinhas) {
    const cortadas = linhas.slice(0, maxLinhas);
    cortadas[maxLinhas - 1] = cortadas[maxLinhas - 1].replace(/\s*\S*$/, "") + "…";
    return cortadas;
  }
  return linhas;
}

function gradienteRose(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#8a5338");
  g.addColorStop(0.3, "#d9a98a");
  g.addColorStop(0.48, "#f3d6c2");
  g.addColorStop(0.62, "#c48b6b");
  g.addColorStop(1, "#8a5338");
  return g;
}

export async function gerarImagemStatus(produto: Produto, loja: Loja): Promise<File> {
  const titulo = fonteDaVariavel("--fonte-titulo", "Georgia, serif");
  const corpo = fonteDaVariavel("--fonte-corpo", "system-ui, sans-serif");
  const manuscrita = fonteDaVariavel("--fonte-manuscrita", "cursive");
  await Promise.all([
    document.fonts.load(`600 80px ${titulo}`),
    document.fonts.load(`500 40px ${corpo}`),
    document.fonts.load(`400 60px ${manuscrita}`),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = L;
  canvas.height = A;
  const ctx = canvas.getContext("2d")!;

  // Fundo creme com brilhos suaves.
  const fundo = ctx.createLinearGradient(0, 0, L, A);
  fundo.addColorStop(0, "#f8efe6");
  fundo.addColorStop(0.55, "#f3e4d6");
  fundo.addColorStop(1, "#e7cfba");
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, L, A);
  for (const [x, y, r, cor] of [
    [980, 160, 420, "rgba(201,154,125,0.28)"],
    [60, 1700, 480, "rgba(255,255,255,0.55)"],
  ] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, cor);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, L, A);
  }

  // Logo.
  const logo = await carregarImagem("/logo.jpg");
  ctx.save();
  ctx.beginPath();
  ctx.arc(L / 2, 150, 92, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(logo, L / 2 - 92, 58, 184, 184);
  ctx.restore();

  // Foto do produto (4:5) com aro rose gold.
  const fx = 150, fy = 282, fw = 780, fh = 975;
  ctx.save();
  ctx.shadowColor = "rgba(90,50,30,0.28)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  retanguloArredondado(ctx, fx - 8, fy - 8, fw + 16, fh + 16, 56);
  ctx.fillStyle = gradienteRose(ctx, fx, fy, fw, fh);
  ctx.fill();
  ctx.restore();
  ctx.save();
  retanguloArredondado(ctx, fx, fy, fw, fh, 48);
  ctx.clip();
  const src = urlFoto(produto.fotos[0]);
  if (src) {
    cobrir(ctx, await carregarImagem(src), fx, fy, fw, fh);
  } else {
    ctx.fillStyle = "#efe3d6";
    ctx.fillRect(fx, fy, fw, fh);
    ctx.globalAlpha = 0.25;
    ctx.drawImage(logo, L / 2 - 220, fy + fh / 2 - 220, 440, 440);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  const promo = emPromocao(produto);
  if (promo) {
    // Selo de desconto.
    const cx = fx + fw - 40, cy = fy + 40;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, 108, 0, Math.PI * 2);
    ctx.fillStyle = "#b8473a";
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = `600 64px ${corpo}`;
    ctx.fillText(`-${descontoPercentual(produto)}%`, cx, cy + 14);
    ctx.font = `500 26px ${corpo}`;
    ctx.fillText("PROMOÇÃO", cx, cy + 52);
  }

  // Nome.
  ctx.textAlign = "center";
  ctx.fillStyle = "#3a2419";
  ctx.font = `600 66px ${titulo}`;
  const linhas = quebrarLinhas(ctx, produto.nome, 900, 2);
  let y = 1368;
  linhas.forEach((linha, i) => ctx.fillText(linha, L / 2, y + i * 70));
  y += (linhas.length - 1) * 70;

  // Preço.
  if (promo) {
    y += 62;
    ctx.font = `400 42px ${corpo}`;
    ctx.fillStyle = "#6b4a3a";
    const de = `de ${formatarMoeda(produto.preco)}`;
    const largura = ctx.measureText(de).width;
    ctx.fillText(de, L / 2, y);
    ctx.fillRect(L / 2 - largura / 2, y - 14, largura, 3);
    y += 112;
    ctx.fillStyle = "#b8473a";
    ctx.font = `600 104px ${corpo}`;
    ctx.fillText(`por ${formatarMoeda(produto.preco_promocional as number)}`, L / 2, y);
  } else {
    y += 122;
    ctx.fillStyle = "#3a2419";
    ctx.font = `600 108px ${corpo}`;
    ctx.fillText(formatarMoeda(produto.preco), L / 2, y);
  }

  // Tamanhos.
  if (produto.tamanhos.length) {
    ctx.font = `400 34px ${corpo}`;
    ctx.fillStyle = "#6b4a3a";
    const tamanhos = produto.tamanhos.slice(0, 10).join("  ·  ");
    ctx.fillText(`Tam.  ${tamanhos}`, L / 2, y + 68);
  }

  // Frase da loja, manuscrita.
  ctx.fillStyle = "#a5694a";
  ctx.font = `400 58px ${manuscrita}`;
  ctx.fillText(loja.frase, L / 2, 1730);

  // WhatsApp.
  const pw = 760, ph = 104, px = (L - pw) / 2, py = 1772;
  retanguloArredondado(ctx, px, py, pw, ph, ph / 2);
  ctx.fillStyle = "#3a2419";
  ctx.fill();
  ctx.fillStyle = "#f7f1ea";
  ctx.font = `500 44px ${corpo}`;
  ctx.fillText(`Peça já: ${telefoneBonito(loja.whatsapp)}`, L / 2, py + 68);

  const blob: Blob = await new Promise((resolver, rejeitar) =>
    canvas.toBlob((b) => (b ? resolver(b) : rejeitar(new Error("Falhou ao gerar a imagem."))), "image/jpeg", 0.92),
  );
  const nome = produto.nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .slice(0, 40);
  return new File([blob], `vanuza-${nome}.jpg`, { type: "image/jpeg" });
}

// Abre o "compartilhar" do celular com as imagens (WhatsApp > Meu status).
// Sem esse recurso (computador), baixa as imagens.
export async function compartilharImagens(arquivos: File[]) {
  const dados = { files: arquivos };
  if (navigator.canShare?.(dados)) {
    try {
      await navigator.share(dados);
      return "compartilhou" as const;
    } catch (erro) {
      if ((erro as Error).name === "AbortError") return "cancelou" as const;
    }
  }
  for (const arquivo of arquivos) {
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement("a");
    a.href = url;
    a.download = arquivo.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  return "baixou" as const;
}
