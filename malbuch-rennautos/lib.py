"""Zeichen-Bibliothek fuer das Rennauto-Malbuch (reportlab, nur Vektoren)."""
import math
from contextlib import contextmanager
from reportlab.lib.colors import white, black, HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth

PW, PH = 8.5 * 72, 11 * 72
X0, X1 = 40, PW - 40          # sicherer Bereich links/rechts


class St:
    c = None
    sc = 1.0
    mirror = False
    color = None   # dict role->hex  (None = Malvorlage, alles weiss)
    LW = 6.5


def fillc(role):
    if St.color and role in St.color:
        return HexColor(St.color[role])
    return white


def setup(c, color=None, lw=6.5):
    St.c, St.color, St.LW, St.sc, St.mirror = c, color, lw, 1.0, False
    c.setStrokeColor(black)
    c.setLineJoin(1)
    c.setLineCap(1)
    c.setLineWidth(lw)


@contextmanager
def T(x=0, y=0, s=1.0, flip=False, rot=0):
    c = St.c
    c.saveState()
    c.translate(x, y)
    if rot:
        c.rotate(rot)
    old = (St.sc, St.mirror)
    c.scale(-s if flip else s, s)
    St.sc = St.sc * s
    if flip:
        St.mirror = not St.mirror
    c.setLineWidth(St.LW / St.sc)
    yield
    c.restoreState()
    St.sc, St.mirror = old


def _path(cmds):
    p = St.c.beginPath()
    for k in cmds:
        if k[0] == 'M': p.moveTo(*k[1:])
        elif k[0] == 'L': p.lineTo(*k[1:])
        elif k[0] == 'C': p.curveTo(*k[1:])
        elif k[0] == 'Z': p.close()
    return p


def shape(cmds, role='w'):
    St.c.setFillColor(fillc(role))
    St.c.drawPath(_path(cmds), stroke=1, fill=1)


def poly(pts, role='w', closed=True):
    cmds = [('M',) + tuple(pts[0])] + [('L',) + tuple(p) for p in pts[1:]]
    if closed:
        cmds.append(('Z',))
    shape(cmds, role)


def line(pts, lwmul=1.0):
    c = St.c
    if lwmul != 1.0:
        c.setLineWidth(St.LW * lwmul / St.sc)
    cmds = [('M',) + tuple(pts[0])] + [('L',) + tuple(p) for p in pts[1:]]
    c.drawPath(_path(cmds), stroke=1, fill=0)
    if lwmul != 1.0:
        c.setLineWidth(St.LW / St.sc)


def curve(x0, y0, x1, y1, x2, y2, x3, y3):
    St.c.drawPath(_path([('M', x0, y0), ('C', x1, y1, x2, y2, x3, y3)]), stroke=1, fill=0)


def circ(x, y, r, role='w'):
    St.c.setFillColor(fillc(role))
    St.c.circle(x, y, r, stroke=1, fill=1)


def ell(x, y, rx, ry, role='w'):
    St.c.setFillColor(fillc(role))
    St.c.ellipse(x - rx, y - ry, x + rx, y + ry, stroke=1, fill=1)


def rrect(x, y, w, h, r=6, role='w'):
    St.c.setFillColor(fillc(role))
    St.c.roundRect(x, y, w, h, min(r, abs(w) / 2, abs(h) / 2), stroke=1, fill=1)


def dot(x, y, r):
    St.c.setFillColor(black)
    St.c.circle(x, y, r, stroke=0, fill=1)


def blackpoly(pts):
    St.c.setFillColor(black)
    St.c.drawPath(_path([('M',) + tuple(pts[0])] + [('L',) + tuple(p) for p in pts[1:]] + [('Z',)]), stroke=0, fill=1)


def blackrect(x, y, w, h):
    St.c.setFillColor(black)
    St.c.rect(x, y, w, h, stroke=0, fill=1)


def blob(circles, rects=(), role='w'):
    """Saubere Vereinigung mehrerer Kreise/Rechtecke mit einer Aussenlinie."""
    c = St.c
    lw = St.LW / St.sc
    c.setFillColor(black)
    for (x, y, r) in circles:
        c.circle(x, y, r, stroke=1, fill=1)
    for (x, y, w, h, r) in rects:
        c.roundRect(x, y, w, h, r, stroke=1, fill=1)
    c.setFillColor(fillc(role))
    for (x, y, r) in circles:
        c.circle(x, y, max(r - lw / 2 + .2, 1), stroke=0, fill=1)
    for (x, y, w, h, r) in rects:
        c.roundRect(x + lw / 2 - .2, y + lw / 2 - .2, w - lw + .4, h - lw + .4, max(r - lw / 2, 0), stroke=0, fill=1)


def star_pts(cx, cy, R, r=None, n=5, rot=90):
    r = r or R * 0.45
    pts = []
    for i in range(2 * n):
        a = math.radians(rot + i * 180 / n)
        rad = R if i % 2 == 0 else r
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return pts


def star(cx, cy, R, role='accent'):
    poly(star_pts(cx, cy, R), role)


def text_out(txt, x, y, size, role='w', font='Helvetica-Bold', anchor='c'):
    """Konturschrift (zum Ausmalen). Bleibt auch in gespiegelten Autos lesbar."""
    c = St.c
    with T(x, y, 1, flip=St.mirror):
        w = stringWidth(txt, font, size)
        ox = -w / 2 if anchor == 'c' else 0
        t = c.beginText()
        t.setTextRenderMode(2)
        t.setFont(font, size)
        t.setTextOrigin(ox, -size * 0.35)
        c.setFillColor(fillc(role))
        t.textOut(txt)
        c.drawText(t)


# ------------------------------------------------------------------ kleine Bauteile
def wheel(x, y, r):
    circ(x, y, r, 'tire')
    circ(x, y, r * 0.55, 'hub')
    circ(x, y, r * 0.16, 'hubc')


def driver(x, y, r=24):
    circ(x, y, r, 'helmet')
    rrect(x + r * 0.1, y - r * 0.25, r * 0.85, r * 0.7, r * 0.3, 'visor')
    line([(x - r * 0.9, y + r * 0.1), (x - r * 0.1, y + r * 0.55)], 0.8)


def flame(cx, cy, R, rot=0, role='accent'):
    with T(cx, cy, R / 50.0, rot=rot):
        shape([('M', 0, -46), ('C', -40, -46, -46, -6, -28, 20), ('C', -26, 8, -18, 4, -14, -4),
               ('C', -16, 22, -6, 38, 4, 50), ('C', 10, 36, 8, 26, 18, 14), ('C', 26, 22, 28, 28, 28, 28),
               ('C', 44, 8, 46, -46, 0, -46), ('Z',)], role)


def bolt(cx, cy, R, role='accent'):
    with T(cx, cy, R / 50.0):
        poly([(10, 50), (-30, -5), (-4, -5), (-14, -50), (32, 8), (6, 8)], role)


def heart(cx, cy, R, role='accent'):
    with T(cx, cy, R / 50.0):
        shape([('M', 0, -45), ('C', -70, 0, -45, 50, 0, 22), ('C', 45, 50, 70, 0, 0, -45), ('Z',)], role)


def checker(cx, cy, w, h, cols=4, rows=2):
    cw, ch = w / cols, h / rows
    for i in range(cols):
        for j in range(rows):
            x, y = cx - w / 2 + i * cw, cy - h / 2 + j * ch
            if (i + j) % 2 == 0:
                blackrect(x, y, cw, ch)
    St.c.setFillColor(white)
    St.c.rect(cx - w / 2, cy - h / 2, w, h, stroke=1, fill=0)


def decor(kind, cx, cy, w, h, n='7'):
    r = min(w, h) / 2
    if kind == 'num':
        circ(cx, cy, r, 'badge'); text_out(n, cx, cy, r * 1.25)
    elif kind == 'star':
        star(cx, cy, r * 1.05)
    elif kind == 'flame':
        flame(cx, cy, r * 1.05, rot=0)
    elif kind == 'bolt':
        bolt(cx, cy, r * 1.05)
    elif kind == 'heart':
        heart(cx, cy, r * 0.95)
    elif kind == 'stripe':
        rrect(cx - w / 2, cy + h * 0.06, w, h * 0.26, 5, 'accent')
        rrect(cx - w / 2, cy - h * 0.34, w, h * 0.26, 5, 'accent')
    elif kind == 'checker':
        checker(cx, cy, w, h * 0.7)
    elif kind == 'smile':
        circ(cx, cy, r, 'accent'); dot(cx - r * .35, cy + r * .2, r * .1); dot(cx + r * .35, cy + r * .2, r * .1)
        curve(cx - r * .45, cy - r * .1, cx - r * .2, cy - r * .55, cx + r * .2, cy - r * .55, cx + r * .45, cy - r * .1)


# ------------------------------------------------------------------ Szenerie (Seitenkoordinaten)
def cloud(x, y, s=1.0):
    with T(x, y, s):
        blob([(-40, 0, 24), (-8, 14, 32), (28, 6, 26), (52, -2, 18)], [(-62, -22, 130, 24, 12)])


def sun(x, y, r, face=True):
    for i in range(12):
        a = math.radians(i * 30)
        line([(x + (r + 10) * math.cos(a), y + (r + 10) * math.sin(a)),
              (x + (r + 34) * math.cos(a), y + (r + 34) * math.sin(a))])
    circ(x, y, r, 'sun')
    if face:
        dot(x - r * .33, y + r * .2, r * .09); dot(x + r * .33, y + r * .2, r * .09)
        curve(x - r * .45, y - r * .1, x - r * .2, y - r * .55, x + r * .2, y - r * .55, x + r * .45, y - r * .1)


def moon(x, y, r):
    shape([('M', x + r * .2, y + r), ('C', x - r * 1.5, y + r * .9, x - r * 1.5, y - r * .9, x + r * .2, y - r),
           ('C', x - r * .55, y - r * .5, x - r * .55, y + r * .5, x + r * .2, y + r), ('Z',)], 'sun')


def hills(gy, h1=70, h2=100):
    shape([('M', X0 - 10, gy), ('L', X0 - 10, gy + h1), ('C', 140, gy + h1 + 70, 230, gy + h1 + 70, 330, gy + h1 - 10),
           ('C', 400, gy + h1 - 60, 440, gy + 10, 500, gy), ('Z',)], 'hill2')
    shape([('M', 200, gy), ('C', 280, gy + h2 + 20, 440, gy + h2 + 40, X1 + 10, gy + h2 - 30), ('L', X1 + 10, gy), ('Z',)], 'hill')


def tree(x, gy, s=1.0):
    with T(x, gy, s):
        rrect(-9, 0, 18, 46, 4, 'trunk')
        blob([(0, 70, 28), (-22, 54, 22), (22, 54, 22), (0, 92, 20)], role='leaf')


def pine(x, gy, s=1.0):
    with T(x, gy, s):
        rrect(-8, 0, 16, 22, 3, 'trunk')
        poly([(-42, 20), (42, 20), (0, 78)], 'leaf')
        poly([(-34, 56), (34, 56), (0, 106)], 'leaf')
        poly([(-26, 90), (26, 90), (0, 136)], 'leaf')


def palm(x, gy, s=1.0):
    with T(x, gy, s):
        shape([('M', -9, 0), ('C', -4, 50, 6, 90, 22, 128), ('L', 36, 124), ('C', 22, 86, 14, 46, 10, 0), ('Z',)], 'trunk')
        for ang, ln in ((20, 70), (60, 66), (150, 66), (195, 70), (105, 56)):
            with T(30, 128, 1, rot=ang - 90):
                shape([('M', 0, 0), ('C', 14, 30, 14, 56, 0, ln), ('C', -14, 56, -14, 30, 0, 0), ('Z',)], 'leaf')


def cactus(x, gy, s=1.0):
    with T(x, gy, s):
        rrect(-14, 0, 28, 110, 14, 'leaf')
        rrect(-44, 40, 20, 46, 10, 'leaf'); rrect(-44, 40, 40, 18, 9, 'leaf')
        rrect(24, 56, 20, 40, 10, 'leaf'); rrect(4, 56, 40, 18, 9, 'leaf')


def mountains(gy, snow=True):
    for (x, w, h) in ((150, 190, 190), (330, 230, 250), (490, 170, 160)):
        poly([(x - w / 2, gy), (x, gy + h), (x + w / 2, gy)], 'hill2')
        if snow:
            poly([(x - w * .16, gy + h * .68), (x, gy + h), (x + w * .16, gy + h * .68), (x + w * .07, gy + h * .6),
                  (x, gy + h * .7), (x - w * .06, gy + h * .6)], 'snow')


def city(gy):
    for (x, w, h) in ((X0, 100, 330), (X0 + 110, 90, 250), (X0 + 210, 110, 380), (X0 + 330, 90, 280), (X0 + 430, 100, 340)):
        rrect(x, gy, w, h, 8, 'bld')
        for i in range(2):
            for j in range(int((h - 60) // 70)):
                rrect(x + 18 + i * (w / 2 - 6), gy + 150 + j * 62, 24, 36, 5, 'win')


def stands(gy):
    rrect(X0, gy, X1 - X0, 250, 14, 'bld')
    for row in range(3):
        y = gy + 150 - row * 0 + row * 40 - 20
        for i in range(8):
            circ(X0 + 38 + i * 66 + (row % 2) * 30, y + 14, 16, 'skin')
    for i in range(4):
        x = X0 + 60 + i * 150
        line([(x, gy + 250), (x, gy + 320)], 0.9)
        poly([(x, gy + 320), (x + 50, gy + 304), (x, gy + 288)], 'flag')


def bunting(y, n=9, sag=26):
    pts = []
    xs = [X0 + i * (X1 - X0) / n for i in range(n + 1)]
    for i in range(n):
        xa, xb = xs[i], xs[i + 1]
        curve(xa, y, xa + 12, y - sag, xb - 12, y - sag, xb, y)
        mx = (xa + xb) / 2
        poly([(mx - 14, y - sag * .72), (mx + 14, y - sag * .72), (mx, y - sag * .72 - 34)], 'flag')


def balloon(x, y, r=26):
    ell(x, y, r, r * 1.2, 'accent')
    poly([(x - 5, y - r * 1.2), (x + 5, y - r * 1.2), (x, y - r * 1.2 - 8)], 'accent')
    curve(x, y - r * 1.2 - 8, x + 12, y - r * 1.2 - 30, x - 12, y - r * 1.2 - 50, x, y - r * 1.2 - 70)


def stars_sky(pts):
    for (x, y, r) in pts:
        star(x, y, r, 'sun')


def birds(pts):
    for (x, y, s) in pts:
        curve(x - 16 * s, y, x - 8 * s, y + 14 * s, x - 2 * s, y + 12 * s, x, y)
        curve(x, y, x + 2 * s, y + 12 * s, x + 8 * s, y + 14 * s, x + 16 * s, y)


def windmill(x, gy, s=1.0):
    with T(x, gy, s):
        poly([(-30, 0), (30, 0), (18, 110), (-18, 110)], 'bld')
        poly([(-24, 110), (24, 110), (0, 140)], 'roof')
        rrect(-10, 0, 20, 34, 8, 'win')
        for a in (0, 90, 180, 270):
            with T(0, 120, 1, rot=a + 20):
                rrect(-8, 0, 16, 76, 4, 'accent')
        circ(0, 120, 8)


def road(gy, depth=62, x0=None, x1=None, curb=True):
    x0 = X0 - 12 if x0 is None else x0
    x1 = X1 + 12 if x1 is None else x1
    rrect(x0, gy - depth, x1 - x0, depth, 14, 'road')
    n = int((x1 - x0) // 64)
    for i in range(n):
        rrect(x0 + 22 + i * 64, gy - depth / 2 - 4, 38, 8, 4, 'accent')
    if curb:
        # rot/weisse Randsteine unten
        k = int((x1 - x0) // 28)
        for i in range(k):
            if i % 2 == 0:
                blackrect(x0 + 6 + i * 28 - 0, gy - depth - 4, 28, 4)


def grass(x, y, s=1.0):
    with T(x, y, s):
        for dx, h in ((-10, 22), (0, 30), (10, 20)):
            line([(dx, 0), (dx + (dx / 5), h)])


def flower(x, y, s=1.0):
    with T(x, y, s):
        line([(0, 0), (0, 40)])
        for a in range(5):
            r = math.radians(90 + a * 72)
            circ(12 * math.cos(r), 48 + 12 * math.sin(r), 9, 'petal')
        circ(0, 48, 7, 'sun')


def cone(x, y, s=1.0):
    with T(x, y, s):
        rrect(-34, 0, 68, 12, 4, 'base')
        poly([(-26, 12), (26, 12), (8, 78), (-8, 78)], 'cone')
        poly([(-18, 34), (18, 34), (14, 48), (-14, 48)], 'w')


def tire_small(x, y, r=26):
    circ(x, y, r, 'tire'); circ(x, y, r * .5, 'hub'); circ(x, y, r * .12, 'hubc')


def speed_lines(x_from, x_to, ys):
    for y in ys:
        line([(x_from, y), (x_to, y)], 0.9)


def word_bubble(txt, x, y, size, rot=0):
    with T(x, y, 1, rot=rot):
        text_out(txt, 0, 0, size, 'accent')
