# Gera os ícones do app a partir da logo: python3 scripts/gerar-icones.py <logo.png> normal|mask <saida.png>
# O miolo da logo (dentro do aro) vai sobre um fundo da mesma cor do papel dela, com transição longa,
# para não aparecer "dois fundos". Por cima, um aro rose gold na borda do ícone.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math, sys

src = Image.open(sys.argv[1]).convert("RGB")
N = 1024
CX, CY, R = 318, 305, 262  # centro e raio do miolo da logo original (dentro do aro)
caixa = (80, 18, 556, 396)  # coroa até EMPREENDIMENTOS

def anel(img, r, larg):
    cam = Image.new("RGBA", (N, N), (0, 0, 0, 0)); p = cam.load(); c = N / 2
    stops = [(0, (128, 76, 52)), (.25, (214, 165, 134)), (.45, (246, 222, 204)), (.6, (196, 139, 107)), (.8, (150, 92, 64)), (1, (128, 76, 52))]
    def cor(t):
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t <= t1:
                f = (t - t0) / (t1 - t0); return tuple(int(c0[i] + (c1[i] - c0[i]) * f) for i in range(3))
    for y in range(N):
        for x in range(N):
            d = math.hypot(x - c, y - c)
            if abs(d - r) <= larg / 2 + 1:
                al = max(0, min(1, larg / 2 + 1 - abs(d - r)))
                t = ((math.atan2(y - c, x - c) + math.pi * 0.75) / (2 * math.pi) * 2) % 1
                p[x, y] = cor(t) + (int(255 * al),)
    sombra = cam.split()[3].filter(ImageFilter.GaussianBlur(10))
    img.paste((150, 100, 75), (0, 6), sombra.point(lambda v: v * 0.22))
    img.paste(cam, (0, 0), cam)

def papel_ajustado(a, dentro):
    """Modelo suave do papel da logo (polinômio de grau 4), ajustado só nos pixels claros e sem cor (papel)."""
    h, w, _ = a.shape
    lum = a.mean(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    # papel: claro e pouco saturado, longe do desenho
    claro = lum > np.percentile(lum[dentro], 45)
    papel = dentro & claro & (sat < 60)
    papel = np.asarray(Image.fromarray(np.uint8(papel * 255)).filter(ImageFilter.MinFilter(9)), dtype=bool)
    yy, xx = np.mgrid[0:h, 0:w]
    X = xx / w - 0.5; Y = yy / h - 0.5
    termos = [X**i * Y**j for i in range(5) for j in range(5 - i)]
    A = np.stack([t[papel] for t in termos], axis=1)
    campo = np.empty_like(a)
    for k in range(3):
        coef, *_ = np.linalg.lstsq(A, a[..., k][papel], rcond=None)
        campo[..., k] = sum(cf * t for cf, t in zip(coef, termos))
    return np.maximum(campo, 1)

def icone(largura_rel, raio_anel, larg_anel):
    conteudo = src.crop(caixa)
    w = int(N * largura_rel); esc = w / conteudo.width; h = int(conteudo.height * esc)
    c = conteudo.resize((w, h), Image.LANCZOS)
    a = np.asarray(c, dtype=float)
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m)
    cx, cy, r = (CX - caixa[0]) * esc, (CY - caixa[1]) * esc, R * esc
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    d.rectangle((0, h - 8 * esc, w, h), fill=0)
    dentro = np.asarray(m, dtype=float) > 127
    campo = papel_ajustado(a, dentro)
    tinta = np.clip(a / campo, 0, 1.0)
    # o que ficou quase igual ao papel vira papel (tira manchinhas do fundo antigo)
    lum = tinta.mean(axis=2, keepdims=True)
    peso = np.clip((lum - 0.9) / 0.1, 0, 1); peso = peso * peso * (3 - 2 * peso)
    tinta = tinta * (1 - peso) + peso
    suave = np.asarray(m.filter(ImageFilter.GaussianBlur(10 * esc)), dtype=float)[..., None] / 255
    tinta = 1 - (1 - tinta) * suave

    cor_papel = np.array([243.0, 231.0, 220.0])
    yy, xx = np.mgrid[0:N, 0:N]
    dist = np.clip(np.hypot(xx - N / 2, yy - N * 0.46) / (N * 0.7), 0, 1)
    fundo = cor_papel * (1.02 - 0.07 * dist[..., None])
    x0 = (N - w) // 2; y0 = (N - h) // 2 + int(N * 0.015)
    fundo[y0:y0 + h, x0:x0 + w] *= tinta
    img = Image.fromarray(np.uint8(np.clip(fundo, 0, 255)))
    anel(img, N * raio_anel, larg_anel)
    return img

if sys.argv[2] == "normal":
    icone(0.74, 0.47, N * 0.022).save(sys.argv[3])
else:
    icone(0.62, 0.405, N * 0.02).save(sys.argv[3])
