// Compressão das fotos no próprio celular, antes de enviar: o envio fica rápido
// mesmo no 4G e o catálogo abre leve para as clientes.

async function carregar(arquivo: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch {
      // alguns formatos (HEIC antigo) caem no caminho abaixo
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function redimensionar(fonte: ImageBitmap | HTMLImageElement, lado: number, proporcao?: number) {
  const largura = "naturalWidth" in fonte ? fonte.naturalWidth : fonte.width;
  const altura = "naturalHeight" in fonte ? fonte.naturalHeight : fonte.height;

  // Recorte opcional (ex.: 4:5 para a miniatura), centralizado.
  let sx = 0, sy = 0, sw = largura, sh = altura;
  if (proporcao) {
    if (largura / altura > proporcao) {
      sw = altura * proporcao;
      sx = (largura - sw) / 2;
    } else {
      sh = largura / proporcao;
      sy = (altura - sh) / 2;
    }
  }
  const escala = Math.min(1, lado / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * escala);
  canvas.height = Math.round(sh * escala);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(fonte, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function paraBlob(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (webp) => {
        // O Safari antigo não gera WebP e devolve PNG: aí usamos JPEG.
        if (webp && webp.type === "image/webp") return resolver(webp);
        canvas.toBlob((jpg) => (jpg ? resolver(jpg) : rejeitar(new Error("Não deu para ler a foto."))), "image/jpeg", qualidade);
      },
      "image/webp",
      qualidade,
    );
  });
}

export async function prepararFoto(arquivo: File) {
  const fonte = await carregar(arquivo);
  const grande = await paraBlob(redimensionar(fonte, 1600), 0.84);
  const mini = await paraBlob(redimensionar(fonte, 640, 4 / 5), 0.8);
  if ("close" in fonte) fonte.close();
  const extensao = grande.type === "image/webp" ? "webp" : "jpg";
  return { grande, mini, extensao, tipo: grande.type };
}
