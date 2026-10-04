"""Rennautos (Seitenansicht, nach rechts fahrend, Boden bei y=0)."""
from lib import *


def formula(d, n='1', helmet=True):
    if helmet:
        driver(-25, 86, 23)
    rrect(-152, 60, 12, 40, 4, 'body2')
    rrect(-206, 96, 104, 16, 7, 'body2')
    rrect(-206, 90, 13, 36, 5, 'body2')
    shape([('M', -170, 22), ('L', -170, 64), ('C', -168, 88, -120, 96, -85, 88), ('C', -60, 82, -45, 66, -10, 64),
           ('L', 110, 52), ('C', 160, 46, 200, 40, 228, 34), ('C', 238, 32, 238, 22, 226, 22), ('Z',)], 'body')
    rrect(180, 4, 66, 14, 6, 'body2')
    rrect(236, 4, 12, 36, 5, 'body2')
    wheel(-110, 46, 46)
    wheel(150, 34, 34)
    decor(d, 38, 40, 40, 34, n)


def gt(d, n='5', helmet=False):
    shape([('M', -205, 28), ('L', -205, 62), ('C', -205, 78, -190, 84, -160, 88), ('C', -110, 92, -85, 126, -40, 128),
           ('L', 40, 128), ('C', 80, 128, 100, 100, 140, 88), ('C', 190, 80, 215, 70, 215, 50), ('L', 215, 28), ('Z',)], 'body')
    shape([('M', -78, 94), ('C', -60, 118, -48, 120, -34, 120), ('L', 34, 120), ('C', 58, 120, 72, 104, 88, 94), ('Z',)], 'glass')
    if helmet:
        pass
    line([(-4, 94), (-4, 40)])
    rrect(-28, 74, 18, 7, 3)
    rrect(-222, 94, 66, 13, 6, 'body2')
    line([(-205, 88), (-205, 94)]); line([(-170, 88), (-170, 94)])
    ell(196, 62, 14, 10, 'light')
    rrect(-206, 52, 9, 18, 3, 'light')
    wheel(-125, 36, 36)
    wheel(125, 36, 36)
    decor(d, 52, 60, 64, 44, n)


def rally(d, n='3', helmet=True):
    poly([(-175, 34), (-175, 88), (-150, 100), (-100, 140), (20, 140), (78, 102), (170, 92), (190, 72), (190, 34)], 'body')
    poly([(-104, 100), (-82, 132), (-8, 132), (-8, 100)], 'glass')
    poly([(4, 100), (4, 132), (18, 132), (60, 102), (60, 100)], 'glass')
    rrect(-70, 140, 60, 16, 6, 'body2')           # Dachluftung
    rrect(-190, 96, 14, 26, 4, 'body2')           # Spoilerstuetze
    rrect(-206, 118, 56, 12, 5, 'body2')
    circ(176, 66, 12, 'light'); circ(176, 66, 4)
    rrect(-182, 40, 12, 22, 3, 'light')
    driver(-48, 116, 15) if helmet else None
    wheel(-105, 42, 42)
    wheel(108, 42, 42)
    rrect(200, 44, 12, 40, 4, 'body2')
    decor(d, 28, 62, 66, 44, n)


def stock(d, n='9', helmet=True):
    poly([(-205, 30), (-205, 82), (-175, 98), (-98, 120), (-98, 128), (46, 128), (98, 96), (200, 90), (212, 66), (212, 30)], 'body')
    poly([(-86, 100), (-60, 122), (-6, 122), (-6, 100)], 'glass')
    poly([(6, 100), (6, 122), (40, 122), (80, 100)], 'glass')
    line([(0, 96), (0, 42)])
    rrect(-34, 80, 20, 7, 3)
    rrect(-220, 100, 56, 13, 6, 'body2')
    ell(196, 62, 14, 10, 'light')
    rrect(-206, 54, 9, 18, 3, 'light')
    if helmet:
        pass
    wheel(-125, 38, 38)
    wheel(128, 38, 38)
    decor(d, -50, 60, 64, 44, n)


def kart(d, n='8', helmet=True):
    rrect(-98, 22, 196, 22, 10, 'body')
    rrect(-40, 44, 60, 36, 12, 'body2')                 # Sitz
    rrect(-84, 44, 26, 52, 8, 'body2')
    rrect(98, 28, 14, 30, 6, 'body2')
    # Fahrer
    rrect(-52, 52, 54, 66, 18, 'body')
    driver(-22, 142, 28)
    line([(-6, 100), (30, 106), (52, 112)], 1.4)
    line([(46, 70), (46, 112)], 1.4)
    rrect(36, 108, 30, 9, 4, 'body2')
    rrect(78, 26, 52, 42, 10, 'badge')
    wheel(-72, 28, 28)
    wheel(78, 22, 22)
    decor('num' if d in ('num', 'stripe', 'checker') else d, 104, 47, 40, 34, n)


def dragster(d, n='4', helmet=True):
    rrect(-90, 66, 80, 34, 8, 'body2')                  # Motor
    poly([(-80, 100), (-20, 100), (-30, 124), (-70, 124)], 'body2')
    for x in (-72, -54, -36, -22):
        rrect(x - 4, 100, 8, 34, 3)
    driver(70, 78, 21)
    rrect(-250, 104, 80, 14, 6, 'body2')
    rrect(-240, 56, 12, 50, 4, 'body2'); rrect(-200, 56, 12, 50, 4, 'body2')
    shape([('M', -236, 34), ('L', -236, 62), ('C', -150, 76, -60, 70, 40, 62), ('C', 120, 56, 190, 44, 238, 30),
           ('L', 238, 22), ('L', -230, 22), ('Z',)], 'body')
    wheel(-172, 58, 58)
    wheel(204, 20, 20)
    decor(d, 112, 50, 40, 22, n)
    


def vintage(d, n='2', helmet=True):
    for (x, y) in ((-140, 50), (140, 50)):
        pass
    shape([('M', -195, 52), ('C', -190, 90, -150, 100, -90, 104), ('L', 30, 106), ('C', 100, 108, 150, 100, 188, 84),
           ('L', 188, 40), ('L', -195, 40), ('Z',)], 'body')
    rrect(186, 36, 22, 60, 8, 'body2')
    for i in range(4):
        line([(192, 46 + i * 12), (204, 46 + i * 12)], 0.6)
    poly([(-40, 106), (-30, 140), (-18, 140), (-18, 106)], 'glass')
    # Fahrer: Kappe und Brille
    circ(-80, 120, 22, 'skin')
    shape([('M', -102, 124), ('C', -102, 148, -58, 148, -58, 124), ('Z',)], 'helmet')
    rrect(-76, 118, 22, 12, 6, 'visor')
    shape([('M', -102, 112), ('C', -122, 108, -134, 120, -150, 112), ('L', -146, 132), ('C', -130, 126, -118, 138, -102, 126), ('Z',)], 'accent')
    for (x, y, r) in ((-140, 50, 50), (135, 44, 44)):
        circ(x, y, r, 'tire'); circ(x, y, r - 11, 'w'); circ(x, y, r * .15, 'hubc')
        for a in range(8):
            ang = math.radians(a * 45)
            line([(x + r * .15 * math.cos(ang), y + r * .15 * math.sin(ang)),
                  (x + (r - 11) * math.cos(ang), y + (r - 11) * math.sin(ang))], 0.6)
    decor(d, 20, 74, 52, 44, n)


def truck(d, n='6', helmet=True):
    rrect(-210, 40, 150, 52, 8, 'body2')                  # Ladeflaeche
    poly([(-80, 40), (-80, 130), (-20, 130), (30, 112), (60, 112), (80, 100), (210, 96), (214, 50), (214, 40)], 'body')
    poly([(-8, 110), (24, 110), (56, 96), (0, 96)], 'glass')
    poly([(-70, 98), (-70, 112), (-20, 112), (-20, 98)], 'glass')
    for i in range(4):
        circ(-60 + i * 30, 138, 9, 'light')
    rrect(-216, 96, 12, 40, 4); rrect(-236, 66, 24, 12, 4)
    ell(200, 70, 12, 10, 'light')
    wheel(-120, 50, 50)
    wheel(130, 50, 50)
    decor(d, 20, 76, 56, 42, n)


def front(d, n='7', helmet=True):
    rrect(-160, 12, 42, 86, 14, 'tire'); rrect(118, 12, 42, 86, 14, 'tire')
    rrect(-80, 118, 160, 88, 30, 'body2')
    rrect(-62, 134, 124, 56, 20, 'glass')
    circ(0, 160, 24, 'helmet'); rrect(-18, 156, 36, 16, 8, 'visor')
    rrect(-130, 30, 260, 108, 36, 'body')
    for sx in (-1, 1):
        circ(sx * 80, 100, 26, 'light'); circ(sx * 80, 100, 10); dot(sx * 80 + 4, 102, 5)
    curve(-46, 62, -26, 38, 26, 38, 46, 62)
    rrect(-34, 34, 68, 0.001, 0)
    rrect(-34, 24, 68, 20, 6, 'badge')
    rrect(-90, 204, 180, 14, 6, 'body2')
    line([(-60, 204), (-60, 200)]); line([(60, 204), (60, 200)])
    decor(d, 0, 100, 40, 36, n) if d not in ('stripe', 'checker') else None


CARS = {'formula': formula, 'gt': gt, 'rally': rally, 'stock': stock, 'kart': kart,
        'dragster': dragster, 'vintage': vintage, 'truck': truck, 'front': front}
# ungefaehre Breite/Hoehe in lokalen Einheiten (fuer Skalierung)
SIZE = {'formula': (460, 140), 'gt': (440, 135), 'rally': (440, 160), 'stock': (440, 135), 'kart': (260, 190),
        'dragster': (520, 130), 'vintage': (440, 160), 'truck': (450, 150), 'front': (330, 225)}


def topcar(x, y, rot=0, s=1.0, n=None, role='body'):
    """Auto von oben (fuer Rennstrecken)."""
    with T(x, y, s, rot=rot):
        rrect(-34, -22, 14, 20, 4, 'tire'); rrect(-34, 4, 0, 0, 0)
        rrect(-36, 14, 16, 22, 4, 'tire'); rrect(20, 14, 16, 22, 4, 'tire')
        rrect(-36, -50, 16, 22, 4, 'tire'); rrect(20, -50, 16, 22, 4, 'tire')
        shape([('M', -26, -62), ('L', 26, -62), ('L', 26, -30), ('C', 26, 0, 22, 30, 12, 62), ('L', -12, 62),
               ('C', -22, 30, -26, 0, -26, -30), ('Z',)], role)
        rrect(-14, -6, 28, 22, 8, 'glass')
        circ(0, -26, 8, 'badge')
        rrect(-30, -74, 60, 10, 4, 'body2'); rrect(-26, 58, 52, 10, 4, 'body2')
