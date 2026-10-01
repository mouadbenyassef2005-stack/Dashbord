import math
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, black, white
from reportlab.pdfbase.pdfmetrics import stringWidth
from lib import *
import lib
from cars import CARS

IN = 72
PAGES = 104
SPINE = PAGES * 0.002252 * IN
BLEED = 0.125 * IN
COL = dict(body='#E53935', body2='#FFC107', glass='#B3E5FC', tire='#37474F', hub='#CFD8DC', hubc='#78909C',
           accent='#FFEB3B', badge='#FFFFFF', helmet='#1E88E5', visor='#B3E5FC', light='#FFF59D', skin='#FFCC80',
           sun='#FFEB3B', road='#546E7A', flag='#EF5350', cone='#FF7043', base='#37474F', trunk='#8D6E63', leaf='#43A047')
LET = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#E53935', '#FB8C00', '#FDD835']

TXT = {
    'EN': dict(a='MY FIRST', b1='RACE', b2='CARS', c='COLORING BOOK', d='100 fast cars & racing things\nto color and learn', age='1-3', ages='AGES',
               back='Start your engines!\n\nThis big, bold coloring book is made for little racers.\n100 simple, friendly pictures: race cars, helmets,\ntrophies, flags, tires and more.\n\n* 100 easy pictures to color and learn\n* Bold lines help toddlers stay in the lines\n* Builds fine motor skills and vocabulary\n* Perfect for ages 1, 2 and 3\n* Big 8.5" x 11" pages'),
    'DE': dict(a='MEIN ERSTES', b1='RENN', b2='AUTOS', c='MALBUCH', d='100 schnelle Autos & Rennsachen\nzum Ausmalen und Lernen', age='1-3', ages='AB 1 JAHR',
               back='Motoren an!\n\nDieses grosse Malbuch mit dicken Linien ist\nfuer kleine Rennfahrer gemacht.\n100 einfache Motive: Rennautos, Helme,\nPokale, Flaggen, Reifen und mehr.\n\n* 100 einfache Motive zum Ausmalen\n* Dicke Linien helfen, in den Linien zu bleiben\n* Foerdert Feinmotorik und Wortschatz\n* Ideal ab 1 Jahr\n* Grosses Format 21,6 x 27,9 cm'),
}


def otext(c, txt, x, y, size, fill, outline=black, ow=None, font='Helvetica-Bold'):
    ow = ow or size * 0.16
    c.saveState()
    c.setLineJoin(1); c.setLineCap(1)
    t = c.beginText(); t.setFont(font, size); t.setTextOrigin(x, y); t.setTextRenderMode(2)
    c.setLineWidth(ow); c.setStrokeColor(outline); c.setFillColor(outline); t.textOut(txt); c.drawText(t)
    t = c.beginText(); t.setFont(font, size); t.setTextOrigin(x, y); t.setTextRenderMode(0)
    c.setFillColor(fill); t.setFillColor(fill); t.textOut(txt); c.drawText(t)
    c.restoreState()


def ctext(c, txt, cx, y, size, fill, **k):
    x = cx - stringWidth(txt, 'Helvetica-Bold', size) / 2
    if k.get('ow', 1) > 1:
        otext(c, txt, x, y, size, black, ow=k['ow'])
        otext(c, txt, x, y, size, fill, ow=0.1, outline=fill)
    else:
        otext(c, txt, x, y, size, fill, **k)


def front(c, ox, oy, L):
    W, H = 8.5 * IN, 11 * IN
    # Hintergrund + Strahlen
    c.setFillColor(HexColor('#29A9F5')); c.rect(ox - BLEED, oy - BLEED, W + 2 * BLEED, H + 2 * BLEED, stroke=0, fill=1)
    cx, cy = ox + W / 2, oy + 330
    c.setFillColor(HexColor('#5CC2FF'))
    for i in range(0, 24, 2):
        a0, a1 = math.radians(i * 15), math.radians(i * 15 + 15)
        p = c.beginPath(); p.moveTo(cx, cy)
        R = 1200
        p.lineTo(cx + R * math.cos(a0), cy + R * math.sin(a0)); p.lineTo(cx + R * math.cos(a1), cy + R * math.sin(a1)); p.close()
        c.clipPath  # noqa
        c.drawPath(p, stroke=0, fill=1)
    # Rahmen aus Kontrollflaggen-Streifen oben/unten
    # Strasse
    c.setFillColor(HexColor('#455A64')); c.rect(ox - BLEED, oy - BLEED, W + 2 * BLEED, 150 + BLEED, stroke=0, fill=1)
    for i in range(int(W // 60) + 2):
        c.setFillColor(white); c.roundRect(ox + i * 60 - 20, oy + 62, 34, 9, 4, stroke=0, fill=1)
    n = int((W + 2 * BLEED) // 24) + 1
    for i in range(n):
        c.setFillColor(black if i % 2 == 0 else white); c.rect(ox - BLEED + i * 24, oy + 148, 24, 14, stroke=0, fill=1)
    # Titel
    ctext(c, L['a'], cx, oy + H - 90, 46, white, ow=7)
    # RACE / CARS
    size = 118
    for word, y in ((L['b1'], oy + H - 200), (L['b2'], oy + H - 305)):
        w = stringWidth(word, 'Helvetica-Bold', size)
        x = cx - w / 2
        xs = []
        for ch in word:
            xs.append(x); x += stringWidth(ch, 'Helvetica-Bold', size)
        for i, ch in enumerate(word):
            otext(c, ch, xs[i], y, size, black, ow=14)
        for i, ch in enumerate(word):
            col = HexColor(LET[(i + (0 if word == L['b1'] else 4)) % len(LET)])
            otext(c, ch, xs[i], y, size, col, ow=0.1, outline=col)
    # Banner
    c.setFillColor(HexColor('#E53935')); c.setStrokeColor(black); c.setLineWidth(6)
    c.roundRect(cx - 190, oy + H - 372, 380, 52, 10, stroke=1, fill=1)
    ctext(c, L['c'], cx, oy + H - 358, 32, white, ow=0.1)
    # Auto gross
    setup(c, COL, 5)
    with T(cx, oy + 168, 1.28):
        CARS['gt']('num', '1')
    # Fahrer-Helm-Maskottchen im Himmel? -> Wolken
    setup(c, COL, 5)
    cloud(ox + 80, oy + 640, 0.8); cloud(ox + W - 80, oy + 700, 0.8)
    # Untertitel
    for i, line_ in enumerate(L['d'].split('\n')):
        ctext(c, line_, cx, oy + 108 - i * 24 + 6, 19, white, ow=4) if False else None
    # Altersbadge
    c.setFillColor(HexColor('#1E88E5')); c.setStrokeColor(white); c.setLineWidth(5)
    c.circle(ox + W - 78, oy + 250 + 150, 52, stroke=1, fill=1)
    ctext(c, L['ages'], ox + W - 78, oy + 400 + 20, 13 if len(L['ages'])>6 else 16, white, ow=0.1)
    ctext(c, L['age'], ox + W - 78, oy + 400 - 26, 38, white, ow=0.1)
    # Slogan-Plakette unten
    c.setFillColor(white); c.setStrokeColor(black); c.setLineWidth(5)
    c.roundRect(ox + 40, oy + 8, W - 80, 52, 14, stroke=1, fill=1)
    ls = L['d'].split('\n')
    c.setFillColor(black); c.setFont('Helvetica-Bold', 15)
    c.drawCentredString(cx, oy + 40, ls[0]); c.drawCentredString(cx, oy + 20, ls[1])


def back(c, ox, oy, L):
    W, H = 8.5 * IN, 11 * IN
    c.setFillColor(HexColor('#29A9F5')); c.rect(ox - BLEED, oy - BLEED, W + 2 * BLEED, H + 2 * BLEED, stroke=0, fill=1)
    c.setFillColor(white); c.setStrokeColor(black); c.setLineWidth(5)
    c.roundRect(ox + 50, oy + 330, W - 100, 400, 20, stroke=1, fill=1)
    y = oy + 700
    c.setFillColor(black)
    for i, ln in enumerate(L['back'].split('\n')):
        c.setFont('Helvetica-Bold' if i == 0 else 'Helvetica', 26 if i == 0 else 15)
        c.drawString(ox + 80, y, ln); y -= 38 if i == 0 else 22
    setup(c, COL, 5)
    with T(ox + W / 2, oy + 190, 0.9):
        CARS['rally']('star', '3')
    # Barcode-Freifeld
    c.setFillColor(white); c.rect(ox + W - 170, oy + 40, 130, 80, stroke=0, fill=1)


def build(lang, out):
    L = TXT[lang]
    w = 2 * 8.5 * IN + SPINE + 2 * BLEED
    h = 11 * IN + 2 * BLEED
    c = canvas.Canvas(out, pagesize=(w, h))
    c.saveState(); p = c.beginPath(); p.rect(0, 0, BLEED + 8.5 * IN, h); c.clipPath(p, stroke=0, fill=0)
    back(c, BLEED, BLEED, L); c.restoreState()
    c.setFillColor(HexColor('#E53935')); c.rect(BLEED + 8.5 * IN, 0, SPINE, h, stroke=0, fill=1)
    fx = BLEED + 8.5 * IN + SPINE
    c.saveState(); p = c.beginPath(); p.rect(fx, 0, 8.5 * IN + BLEED, h); c.clipPath(p, stroke=0, fill=0)
    front(c, fx, BLEED, L); c.restoreState()
    c.save()
    # nur Frontcover
    c2 = canvas.Canvas(out.replace('wrap', 'front'), pagesize=(8.5 * IN, 11 * IN))
    front(c2, 0, 0, L)
    c2.save()


if __name__ == '__main__':
    build('EN', 'cover_wrap_EN.pdf'); build('DE', 'cover_wrap_DE.pdf')
