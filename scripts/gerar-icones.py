# Gera os ícones do app a partir da logo: python3 scripts/gerar-icones.py <logo.png> normal|mask <saida.png>
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, sys
src=Image.open(sys.argv[1]).convert('RGB')
N=1024
def fundo():
    # creme com luz no centro, igual ao miolo da logo
    bg=Image.new('RGB',(N,N)); px=bg.load()
    for y in range(N):
        for x in range(N):
            d=min(math.hypot(x-N/2,y-N*0.45)/(N*0.72),1)
            a=(246,236,227); b=(228,209,193)
            px[x,y]=tuple(int(a[i]+(b[i]-a[i])*d**1.3) for i in range(3))
    return bg
def anel(img, r, larg):
    cam=Image.new('RGBA',(N,N),(0,0,0,0)); p=cam.load(); cx=cy=N/2
    stops=[(0,(128,76,52)),(.25,(214,165,134)),(.45,(246,222,204)),(.6,(196,139,107)),(.8,(150,92,64)),(1,(128,76,52))]
    def cor(t):
        for (t0,c0),(t1,c1) in zip(stops,stops[1:]):
            if t<=t1:
                f=(t-t0)/(t1-t0); return tuple(int(c0[i]+(c1[i]-c0[i])*f) for i in range(3))
    for y in range(N):
        for x in range(N):
            d=math.hypot(x-cx,y-cy)
            if abs(d-r)<=larg/2+1:
                al=max(0,min(1,larg/2+1-abs(d-r)))
                t=((math.atan2(y-cy,x-cx)+math.pi*0.75)/(2*math.pi)*2)%1
                p[x,y]=cor(t)+(int(255*al),)
    sombra=cam.split()[3].filter(ImageFilter.GaussianBlur(10))
    img.paste((150,100,75),(0,6),sombra.point(lambda v:v*0.25))
    img.paste(cam,(0,0),cam)
caixa=(80,18,556,396)
conteudo=src.crop(caixa)
import numpy as np
def icone(largura_rel, raio_anel, larg_anel):
    bg=fundo()
    w=int(N*largura_rel); h=int(w*conteudo.height/conteudo.width)
    c=conteudo.resize((w,h),Image.LANCZOS)
    # o "papel" da logo: tira os traços escuros e suaviza
    papel=c.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(30))
    tinta=np.clip(np.asarray(c,dtype=float)/np.maximum(np.asarray(papel,dtype=float),1),0,1)
    # só o miolo da logo: o disco dentro do aro (centro 318,305; raio 268 na logo original), e a borda de baixo suavizada
    esc=w/conteudo.width
    mask=Image.new('L',(w,h),0)
    cx=(318-caixa[0])*esc; cy=(305-caixa[1])*esc; r=262*esc
    ImageDraw.Draw(mask).ellipse((cx-r,cy-r,cx+r,cy+r),fill=255)
    ImageDraw.Draw(mask).rectangle((0,h-6*esc,w,h),fill=0)
    m=np.asarray(mask.filter(ImageFilter.GaussianBlur(8*esc)),dtype=float)[...,None]/255
    tinta=1-(1-tinta)*m
    x=(N-w)//2; y=(N-h)//2+int(N*0.015)
    base=np.asarray(bg.crop((x,y,x+w,y+h)),dtype=float)
    bg.paste(Image.fromarray(np.uint8(base*tinta)),(x,y))
    anel(bg,N*raio_anel,larg_anel)
    return bg
qual=sys.argv[2]
if qual=='normal':
    img=icone(0.74,0.47,N*0.022)
else:
    img=icone(0.62,0.405,N*0.02)
img.save(sys.argv[3])
