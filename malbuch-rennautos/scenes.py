from lib import *

SCENES = ['hills', 'city', 'stadium', 'night', 'desert', 'snow', 'beach', 'country', 'finish', 'sky']


def scene(kind, gy, wide_top=740, ground=True):
    """Hintergrund fuer Seitenansicht-Seiten; gy = Bodenlinie des Autos."""
    top = wide_top
    if kind == 'hills':
        sun(110, top - 80, 44)
        cloud(400, top - 70, 1.1); cloud(300, top - 190, 0.8)
        hills(gy, 70, 105)
        tree(80, gy, 1.0); tree(520, gy + 8, 0.9); tree(470, gy + 4, 0.7)
    elif kind == 'city':
        cloud(130, top - 60, 1.0); cloud(460, top - 120, 0.9)
        birds([(300, top - 40, 1), (340, top - 70, .8)])
        city(gy)
    elif kind == 'stadium':
        bunting(top - 20)
        cloud(110, top - 140, .8); cloud(480, top - 150, .8)
        stands(gy)
    elif kind == 'night':
        moon(110, top - 80, 44)
        stars_sky([(250, top - 50, 14), (380, top - 100, 10), (470, top - 40, 16), (190, top - 170, 9),
                   (520, top - 200, 11), (320, top - 230, 12), (80, top - 230, 8)])
        mountains(gy, True)
    elif kind == 'desert':
        sun(480, top - 90, 50)
        cloud(150, top - 80, 1.0)
        shape([('M', X0 - 10, gy), ('C', 120, gy + 90, 260, gy + 90, 340, gy + 20), ('C', 420, gy - 20, 480, gy + 50, X1 + 10, gy + 40),
               ('L', X1 + 10, gy), ('Z',)], 'hill')
        cactus(90, gy, 1.2); cactus(500, gy, 1.0); cactus(440, gy, .6)
    elif kind == 'snow':
        cloud(150, top - 70, 1.0); cloud(440, top - 130, .9)
        mountains(gy + 20, True)
        pine(80, gy, 1.0); pine(130, gy, .7); pine(500, gy, 1.1); pine(450, gy, .75)
        for (x, y) in ((250, top - 60), (350, top - 180), (200, top - 220), (500, top - 250), (90, top - 160)):
            star(x, y, 14, 'snow')
    elif kind == 'beach':
        sun(120, top - 90, 46)
        cloud(430, top - 80, 1.0)
        palm(90, gy, 1.2); palm(500, gy, 1.0)
        birds([(300, top - 60, 1), (350, top - 90, .8)])
    elif kind == 'country':
        sun(480, top - 80, 44)
        cloud(180, top - 80, 1.0)
        hills(gy, 60, 90)
        tree(90, gy, 1.1); tree(150, gy + 6, 0.7)
        birds([(330, top - 140, 1), (370, top - 170, .8), (400, top - 120, .7)])
        tree(510, gy, .9)
    elif kind == 'finish':
        for (x, y) in ((90, top - 90), (500, top - 110), (160, top - 190), (440, top - 230)):
            balloon(x, y, 24)
        bunting(top - 20, 8)
        # Zielbogen
        rrect(X0 + 10, gy, 24, 250, 6); rrect(X1 - 34, gy, 24, 250, 6)
        rrect(X0 + 10, gy + 250, X1 - X0 - 20, 70, 10)
        checker(PW / 2, gy + 285, X1 - X0 - 50, 40, 14, 2)
    elif kind == 'sky':
        cloud(130, top - 70, 1.0); cloud(470, top - 90, 1.0); cloud(300, top - 220, .8)
        sun(300, top - 90, 40)
        birds([(110, top - 190, 1), (160, top - 210, .8), (500, top - 240, .8)])


def foreground(kind, gy, depth=62):
    """Details unterhalb der Strasse."""
    y = gy - depth - 30 + 10
    if kind in ('hills', 'country', 'sky'):
        for i, x in enumerate(range(70, 560, 95)):
            flower(x, y - 40 + (i % 2) * 10, 1.0) if i % 2 == 0 else grass(x, y - 30, 1.2)
    elif kind in ('stadium', 'city', 'finish'):
        for x in range(90, 560, 140):
            cone(x, y - 60, 1.0)
        for x in (160, 300, 440):
            tire_small(x + 0, y - 20, 22) if False else None
    elif kind in ('night', 'snow'):
        for x in range(80, 560, 100):
            star(x, y - 20, 14, 'sun')
    elif kind in ('desert', 'beach'):
        for x in range(80, 560, 120):
            grass(x, y - 30, 1.3)
        for x in (150, 370):
            circ(x + 20, y - 20, 12)
