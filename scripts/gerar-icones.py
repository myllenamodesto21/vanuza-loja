# Ícone do app: só o V com a moça da logo, sobre creme, com borda quadrada arredondada (como os ícones do celular).
# Uso: python3 scripts/gerar-icones.py <logo.png> normal|mask <saida.png>
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math, sys

src = Image.open(sys.argv[1]).convert("RGB")
N = 1024
CAIXA = (186, 34, 532, 265)       # V e a moça, na logo original
ARO = (318, 305, 277)             # centro e raio de dentro do aro original (o que passa disso é aro)
COROA = (264, 20, 364, 92)        # sai do ícone
CREME = np.array([243.0, 231.0, 220.0])

def papel_ajustado(a, valido):
    h, w, _ = a.shape
    lum = a.mean(axis=2); sat = a.max(axis=2) - a.min(axis=2)
    papel = valido & (lum > np.percentile(lum[valido], 45)) & (sat < 60)
    papel = np.asarray(Image.fromarray(np.uint8(papel * 255)).filter(ImageFilter.MinFilter(9)), dtype=bool)
    yy, xx = np.mgrid[0:h, 0:w]; X = xx / w - .5; Y = yy / h - .5
    termos = [X**i * Y**j for i in range(5) for j in range(5 - i)]
    A = np.stack([t[papel] for t in termos], axis=1)
    campo = np.empty_like(a)
    for k in range(3):
        coef, *_ = np.linalg.lstsq(A, a[..., k][papel], rcond=None)
        campo[..., k] = sum(c * t for c, t in zip(coef, termos))
    return np.maximum(campo, 1)

def desenho(escala):
    """Só os traços do V e da moça (1 = papel), na escala pedida."""
    c = src.crop(CAIXA)
    w, h = int(c.width * escala), int(c.height * escala)
    c = c.resize((w, h), Image.LANCZOS)
    a = np.asarray(c, dtype=float)
    # o que fica fora do desenho: aro, coroa, coração e o traço à esquerda do V
    fora = Image.new("L", (w, h), 0); d = ImageDraw.Draw(fora)
    def p(x, y): return ((x - CAIXA[0]) * escala, (y - CAIXA[1]) * escala)
    cx, cy, r = ARO
    big = Image.new("L", (w, h), 255)
    ImageDraw.Draw(big).ellipse((*p(cx - r, cy - r), *p(cx + r, cy + r)), fill=0)
    fora.paste(255, (0, 0), big)
    d.rectangle((*p(*COROA[:2]), *p(*COROA[2:])), fill=255)
    # lado de fora da perna esquerda do V (coração e o traço que sai dele)
    d.polygon([p(150, 132), p(198, 132), p(296, 268), p(150, 268)], fill=255)
    # brilho do aro antigo acima do braço da moça (canto de cima, à direita)
    d.polygon([p(436, 20), p(560, 20), p(560, 200), p(532, 185)], fill=255)
    d.rectangle((*p(364, 20), *p(560, 47)), fill=255)
    d.polygon([p(433, 40), p(560, 40), p(560, 110), p(446, 92)], fill=255)
    fora = np.asarray(fora.filter(ImageFilter.GaussianBlur(1.6 * escala)), dtype=float)[..., None] / 255
    valido = fora[..., 0] < 0.5
    tinta = np.clip(a / papel_ajustado(a, valido), 0, 1)
    lum = tinta.mean(axis=2, keepdims=True)
    peso = np.clip((lum - 0.9) / 0.1, 0, 1); peso = peso * peso * (3 - 2 * peso)
    tinta = tinta * (1 - peso) + peso
    return 1 - (1 - tinta) * (1 - fora)

def fundo():
    yy, xx = np.mgrid[0:N, 0:N]
    dist = np.clip(np.hypot(xx - N / 2, yy - N * 0.46) / (N * 0.72), 0, 1)
    return CREME * (1.025 - 0.075 * dist[..., None])

def borda(img, inset, raio, larg):
    """Aro rose gold em quadrado arredondado, com brilho que gira em volta."""
    G = 2; M = N * G
    m = Image.new("L", (M, M), 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle((inset * G, inset * G, M - inset * G, M - inset * G), radius=raio * G, outline=255, width=int(larg * G))
    m = m.resize((N, N), Image.LANCZOS)
    a = np.asarray(m, dtype=float) / 255
    yy, xx = np.mgrid[0:N, 0:N]
    t = ((np.arctan2(yy - N / 2, xx - N / 2) + math.pi * 0.75) / (2 * math.pi) * 2) % 1
    stops = [(0, (128, 76, 52)), (.25, (214, 165, 134)), (.45, (246, 222, 204)), (.6, (196, 139, 107)), (.8, (150, 92, 64)), (1, (128, 76, 52))]
    cor = np.zeros((N, N, 3))
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        sel = (t >= t0) & (t <= t1); f = ((t - t0) / (t1 - t0))[sel][:, None]
        cor[sel] = np.array(c0) + (np.array(c1) - np.array(c0)) * f
    base = np.asarray(img, dtype=float)
    sombra = np.asarray(Image.fromarray(np.uint8(a * 255)).filter(ImageFilter.GaussianBlur(8)), dtype=float) / 255
    sombra = np.roll(sombra, 5, axis=0)[..., None] * 0.18
    base = base * (1 - sombra) + np.array([150, 100, 75]) * sombra
    base = base * (1 - a[..., None]) + cor * a[..., None]
    return Image.fromarray(np.uint8(np.clip(base, 0, 255)))

def icone(largura_rel, com_borda):
    escala = N * largura_rel / (CAIXA[2] - CAIXA[0])
    t = desenho(escala); h, w, _ = t.shape
    f = fundo()
    x0 = (N - w) // 2 + int(N * 0.01); y0 = (N - h) // 2
    f[y0:y0 + h, x0:x0 + w] *= t
    img = Image.fromarray(np.uint8(np.clip(f, 0, 255)))
    if com_borda:
        img = borda(img, N * 0.05, N * 0.175, N * 0.02)
    return img

if sys.argv[2] == "normal":
    icone(0.74, True).save(sys.argv[3])
else:
    icone(0.62, False).save(sys.argv[3])
