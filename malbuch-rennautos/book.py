import sys
from reportlab.pdfgen import canvas
from lib import *
import lib
from cars import CARS, SIZE, topcar
from scenes import scene, foreground, SCENES
from lib import stars_sky, moon, sun, cloud, balloon, bunting, flower, cone
import objects as O

DECO = ['num', 'flame', 'star', 'stripe', 'bolt', 'checker', 'heart', 'smile']
TYPES = ['formula', 'gt', 'rally', 'stock', 'kart', 'dragster', 'vintage', 'truck', 'front']
WORDS = {2: 'VROOM!', 5: 'ZOOM!', 8: 'GO!', 11: 'BRUM!', 14: 'WOW!', 17: 'BEEP!', 20: 'FAST!', 23: 'ZOOM!', 26: 'VROOM!', 29: 'GO!'}


def car_page(c, kind, sc, deco, n, mirror=False, word=None, gy=285):
    w, h = SIZE[kind]
    s = min(545 / w, 380 / h)
    if kind == 'front':
        mirror = False
    scene(sc, gy)
    if word:
        word_bubble(word, 430, 690, 58, 8)
    if kind != 'front':
        speed_lines(X0, 120, [gy + 50, gy + 80, gy + 25]) if not mirror else speed_lines(PW - 120, X1, [gy + 50, gy + 80, gy + 25])
    road(gy)
    foreground(sc, gy)
    with T(PW / 2, gy, s, flip=mirror):
        CARS[kind](deco, n)


def two_car_page(c, a, b, sc, da, db, na, nb):
    sky = {'hills': lambda: (sun(110, 700, 40), cloud(430, 712, 1.0)),
           'night': lambda: (moon(110, 700, 36), stars_sky([(250, 710, 12), (380, 690, 10), (500, 710, 14)])),
           'finish': lambda: (balloon(90, 670, 20), balloon(520, 680, 20), bunting(750, 8))}
    ks = list(sky)
    sky[ks[hash(sc) % 3 if False else (len(sc) % 3)]]()
    for (kind, gy, d, n, mir) in ((a, 470, da, na, False), (b, 215, db, nb, True)):
        w, h = SIZE[kind]
        s = min(500 / w, 190 / h)
        road(gy)
        with T(PW / 2, gy, s, flip=mir):
            CARS[kind](d, n)
    for x in range(70, 560, 110):
        cone(x, 120, 0.9) if False else None
    for x in (90, 306, 520):
        flower(x, 90, 1.2)


def obj_page(c, fn, s=1.2, stars=True, dy=0):
    if stars:
        for (x, y, r) in ((90, 660, 16), (520, 690, 12), (500, 130, 18), (100, 120, 12), (300, 720, 10), (545, 420, 9), (66, 380, 11)):
            star(x, y, r, 'sun')
    with T(PW / 2, PH / 2 + dy, s):
        fn()


def grid_page(c, fn, cols, rows, size, pad_y=0, jitter=False):
    cw = (X1 - X0) / cols
    ch = 640 / rows
    for j in range(rows):
        for i in range(cols):
            cx = X0 + cw * (i + .5)
            cy = 70 + ch * (rows - j - .5) + pad_y
            with T(cx, cy, min(cw, ch) / size):
                fn(i, j)


def count_page(c, n):
    # n Autos (Frontansicht) + grosse Zahl
    pos = {1: [(306, 290)], 2: [(165, 290), (447, 290)], 3: [(125, 290), (306, 290), (487, 290)]}[n]
    sc = {1: 1.45, 2: .82, 3: .56}[n]
    for (x, y) in pos:
        with T(x, y - 115 * sc, sc):
            CARS['front']('num', str(n))
    text_out(str(n), 306, 640, 230)
    for x in (110, 500):
        star(x, 640, 22, 'sun')


def title_page(c, T1, T2, T3):
    for (x, y, r) in ((90, 660, 18), (520, 690, 14), (480, 160, 18), (100, 140, 14)):
        star(x, y, r, 'sun')
    text_out(T1, PW / 2, 600, 46)
    text_out(T2, PW / 2, 520, 70)
    text_out(T3, PW / 2, 450, 46)
    with T(PW / 2, 220, 1.0):
        CARS['gt']('star', '1')
    road(220)


def build_pages(L):
    P = []
    # --- Autos in Seitenansicht
    k_order = list(range(9))
    rounds = 6
    idx = 0
    for r in range(rounds + 1):
        for k in k_order:
            if r == rounds and k not in (0, 1, 2, 4):
                continue
            kind = TYPES[k]
            sc = SCENES[(k * 3 + r * 3 + 1) % 10] if kind != 'front' else SCENES[(r * 3 + 2) % 10]
            deco = DECO[(k + r * 3) % 8]
            n = str(((idx * 7 + 3) % 97) + 1)
            word = WORDS.get(idx % 31)
            mir = (idx % 3 == 1)
            P.append(lambda c, kind=kind, sc=sc, deco=deco, n=n, mir=mir, word=word: car_page(c, kind, sc, deco, n, mir, word))
            idx += 1
    # --- Rennen mit zwei Autos
    duels = [('formula', 'gt'), ('rally', 'stock'), ('dragster', 'vintage'), ('kart', 'truck'),
             ('gt', 'rally'), ('stock', 'formula'), ('vintage', 'kart'), ('truck', 'dragster')]
    for i, (a, b) in enumerate(duels):
        P.append(lambda c, a=a, b=b, i=i: two_car_page(c, a, b, SCENES[(i * 3 + 2) % 10], DECO[i % 8], DECO[(i + 3) % 8], str(i + 1), str(i + 5)))
    # --- Einzelmotive
    for fn, s in ((O.helmet, 1.35), (O.trophy, 1.3), (O.crossed_flags, 1.5), (O.steering_wheel, 1.5), (O.tire_big, 1.5),
                  (O.start_lights, 1.1), (O.fuel_pump, 1.4), (O.tools, 1.5), (O.stopwatch, 1.5), (O.podium, 1.3),
                  (O.speedometer, 1.5), (O.jerrycan, 1.4), (O.toolbox, 1.5), (O.medal, 1.4), (O.goggles, 1.1),
                  (O.glove, 1.3), (O.signs, 1.45), (O.big_cone, 1.5), (O.oilcan, 1.4), (O.pit_garage, 1.1),
                  (O.finish_arch, 1.1), (O.track, 1.2)):
        P.append(lambda c, fn=fn, s=s: obj_page(c, fn, s))
    P.append(lambda c: car_page(c, 'front', 'sky', 'star', '5', False, 'HELLO!'))
    P.append(lambda c: car_page(c, 'front', 'finish', 'heart', '8', False, None))
    # --- Muster- / Zaehlseiten
    P.append(lambda c: grid_page(c, lambda i, j: O.tire_big(), 2, 3, 340))
    P.append(lambda c: grid_page(c, lambda i, j: O.big_cone(), 2, 3, 340))
    P.append(lambda c: grid_page(c, lambda i, j: O.crossed_flags(), 2, 3, 470))
    P.append(lambda c: grid_page(c, lambda i, j: O.helmet(), 2, 2, 320))
    P.append(lambda c: grid_page(c, lambda i, j: O.trophy(), 2, 2, 400))
    P.append(lambda c: grid_page(c, lambda i, j: O.steering_wheel(), 2, 3, 340))
    P.append(lambda c: grid_page(c, lambda i, j: CARS['front'](DECO[(i + j * 3) % 8], str(i + j * 3 + 1)), 2, 3, 380))
    for n in (1, 2, 3):
        P.append(lambda c, n=n: count_page(c, n))
    return P


TXT = {
    'EN': dict(t1='My First', t2='RACE CARS', t3='Coloring Book', sub='Ages 1-3', own='This book belongs to:',
               thx1='Great job, little racer!', thx2='You crossed the finish line!', rev='Loved this book? Please leave a short review - it helps a lot!'),
    'DE': dict(t1='Mein erstes', t2='RENNAUTOS', t3='Malbuch', sub='Ab 1 Jahr', own='Dieses Buch gehoert:',
               thx1='Super gemacht, kleiner Rennfahrer!', thx2='Du bist im Ziel!', rev='Gefaellt dir das Buch? Wir freuen uns ueber eine kurze Bewertung!'),
}


def build(lang, outfile, only=None):
    L = TXT[lang]
    c = canvas.Canvas(outfile, pagesize=(PW, PH))
    c.setTitle(f"{L['t1']} {L['t2']} {L['t3']}")
    c.setAuthor('')

    def new(fn):
        setup(c)
        fn()
        c.showPage()

    new(lambda: (title_page(c, L['t1'], L['t2'], L['t3']), text_out(L['sub'], PW / 2, 110, 30)))

    def belongs():
        text_out(L['own'], PW / 2, 600, 36)
        line([(110, 520), (PW - 110, 520)], 1.0)
        with T(PW / 2, 280, 1.0):
            CARS['front']('num', '1')
    new(belongs)
    pages = build_pages(L)
    assert len(pages) == 100, len(pages)
    for i, p in enumerate(pages):
        if only is not None and i not in only:
            continue
        setup(c)
        p(c)
        c.showPage()

    def thanks():
        text_out(L['thx1'], PW / 2, 600, 36)
        text_out(L['thx2'], PW / 2, 540, 30)
        with T(PW / 2, 280, 1.0):
            O.trophy()
        c.setFont('Helvetica', 14)
        c.drawCentredString(PW / 2, 100, L['rev'])
    new(thanks)
    c.save()


if __name__ == '__main__':
    build('EN', 'interior_EN.pdf')
    build('DE', 'interior_DE.pdf')
    print('done')
