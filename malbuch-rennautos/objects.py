"""Einzelmotive rund um den Rennsport (lokal um (0,0), Groesse ca. 300)."""
from lib import *
from cars import topcar


def helmet():
    shape([('M', -130, -90), ('C', -158, 40, -90, 132, 10, 132), ('C', 100, 132, 142, 70, 142, 0), ('L', 142, -52),
           ('C', 142, -92, 104, -100, 60, -100), ('L', -60, -92), ('Z',)], 'helmet')
    shape([('M', 16, 6), ('L', 128, 6), ('C', 142, 6, 142, 62, 120, 66), ('L', 24, 68), ('C', 6, 62, 6, 6, 16, 6), ('Z',)], 'visor')
    curve(-100, 90, -40, 120, 20, 130, 40, 120)
    curve(-120, 40, -50, 80, 10, 100, 40, 94)
    circ(-62, -22, 32, 'badge'); text_out('1', -62, -22, 38)
    line([(30, -30), (110, -30)], 0.7); line([(30, -46), (100, -46)], 0.7)
    for i in range(3):
        line([(-20 + i * 14, 112 - i * 4), (-8 + i * 14, 104 - i * 4)], 0.7)


def trophy():
    ell(-86, 56, 32, 42, 'accent'); ell(86, 56, 32, 42, 'accent')
    ell(-86, 56, 16, 26); ell(86, 56, 16, 26)
    shape([('M', -76, 110), ('L', 76, 110), ('C', 76, 10, 44, -26, 0, -34), ('C', -44, -26, -76, 10, -76, 110), ('Z',)], 'accent')
    star(0, 56, 32, 'badge')
    rrect(-14, -78, 28, 48, 4, 'accent')
    rrect(-62, -112, 124, 34, 10, 'body')
    rrect(-92, -142, 184, 34, 10, 'body2')
    for (x, y, r) in ((-130, 130, 14), (130, 120, 18), (0, 150, 10)):
        star(x, y, r, 'sun')


def crossed_flags():
    for ang in (-32, 32):
        with T(0, 0, 1, rot=ang):
            rrect(-7, -190, 14, 380, 6, 'body')
    for ang in (-32, 32):
        with T(0, 0, 1, rot=ang, flip=(ang > 0)):
            # Fahne: 4 x 3 Karos
            fx, fy, fw, fh = 7, 70, 168, 120
            rrect(fx, fy, fw, fh, 4)
            cw, ch = fw / 4, fh / 3
            for i in range(4):
                for j in range(3):
                    if (i + j) % 2 == 0:
                        blackrect(fx + i * cw, fy + j * ch, cw, ch)
            St.c.setFillColor(white)
            St.c.rect(fx, fy, fw, fh, stroke=1, fill=0)
            circ(0, 196, 12, 'accent')
    circ(0, 0, 22, 'accent')


def steering_wheel():
    circ(0, 0, 150, 'body'); circ(0, 0, 104)
    rrect(-120, -26, 240, 52, 22, 'body2')
    rrect(-26, -126, 52, 112, 20, 'body2')
    circ(0, 0, 54, 'accent'); star(0, 0, 36, 'badge')
    rrect(-14, 134, 28, 34, 4, 'accent') if False else None
    rrect(-20, 100, 40, 54, 6, 'badge')


def tire_big():
    circ(0, 0, 150, 'tire')
    for i in range(24):
        with T(0, 0, 1, rot=i * 15):
            rrect(-10, 122, 20, 36, 5, 'w')
    circ(0, 0, 100, 'hub'); circ(0, 0, 70)
    circ(0, 0, 24, 'hubc')
    for i in range(5):
        a = math.radians(90 + i * 72)
        circ(46 * math.cos(a), 46 * math.sin(a), 9, 'w')
    for i in range(5):
        a = math.radians(90 + 36 + i * 72)
        with T(48 * math.cos(a), 48 * math.sin(a), 1, rot=i * 72 - 54):
            pass


def start_lights():
    rrect(-230, -80, 460, 150, 34, 'body')
    for i in range(5):
        x = -176 + i * 88
        circ(x, -5, 36, 'body2'); circ(x, -5, 22, 'light')
    rrect(-200, -190, 24, 112, 6); rrect(176, -190, 24, 112, 6)
    rrect(-240, -204, 100, 20, 8); rrect(140, -204, 100, 20, 8)


def fuel_pump():
    rrect(-90, -150, 180, 300, 26, 'body')
    rrect(-62, 40, 124, 80, 14, 'glass')
    for i, y in enumerate((70, 90)):
        pass
    text_out('88', 0, 80, 40)
    rrect(-62, -20, 124, 44, 10, 'badge')
    for x in (-36, 0, 36):
        circ(x, 2, 11, 'light')
    rrect(-112, -178, 224, 30, 10, 'body2')
    shape([('M', 90, 70), ('C', 150, 70, 150, -40, 130, -70)], 'w') if False else None
    curve(90, 60, 170, 60, 170, -60, 138, -90)
    rrect(120, -140, 36, 60, 10, 'body2')
    drop = [('M', 0, 30), ('C', -22, 0, -18, -26, 0, -26), ('C', 18, -26, 22, 0, 0, 30), ('Z',)]
    with T(-0, 130, 0.5): pass


def tools():
    with T(0, 0, 1, rot=40):
        rrect(-16, -124, 32, 248, 14, 'body')
        for y in (-124, 124):
            circ(0, y, 44, 'body')
            poly([(math.cos(math.radians(60 * i)) * 24, y + math.sin(math.radians(60 * i)) * 24) for i in range(6)], 'w')
    with T(0, 0, 1, rot=-40):
        rrect(-26, -20, 52, 140, 22, 'body2')
        for y in (10, 40, 70):
            line([(-26, y), (26, y)], 0.6)
        rrect(-9, -170, 18, 154, 5, 'w')
        poly([(-9, -170), (9, -170), (15, -208), (-15, -208)], 'w')


def stopwatch():
    rrect(-24, 128, 48, 40, 8, 'body2'); rrect(-40, 160, 80, 22, 8, 'body2')
    with T(0, 0, 1, rot=-45):
        rrect(-16, 118, 32, 42, 6, 'body2')
    circ(0, 0, 130, 'body'); circ(0, 0, 100)
    for i in range(12):
        with T(0, 0, 1, rot=i * 30):
            line([(0, 84), (0, 98)], 1.0)
    line([(0, 0), (0, 70)], 1.4); line([(0, 0), (48, -28)], 1.4)
    circ(0, 0, 12, 'accent')
    checker(0, -52, 70, 20, 7, 2)


def podium():
    rrect(-180, -150, 120, 120, 6, 'body2'); rrect(-60, -150, 120, 170, 6, 'accent'); rrect(60, -150, 120, 84, 6, 'body')
    text_out('2', -120, -100, 62); text_out('1', 0, -90, 72); text_out('3', 120, -128, 52)
    for (x, y) in ((-120, 14), (0, 60), (120, -40)):
        with T(x, y, 0.8):
            circ(0, 0, 30, 'helmet'); rrect(2, -6, 28, 20, 8, 'visor')
            rrect(-22, -70, 44, 40, 10, 'body')
    star(0, 150, 30, 'sun'); star(-110, 110, 16, 'sun'); star(110, 110, 16, 'sun')


def speedometer():
    circ(0, 0, 150, 'body'); circ(0, 0, 120)
    for i in range(11):
        a = math.radians(210 - i * 24)
        r1, r2 = 100, 116 if i % 2 == 0 else 108
        line([(r1 * math.cos(a), r1 * math.sin(a)), (r2 * math.cos(a), r2 * math.sin(a))], 1.0)
    for i in (0, 5, 10):
        a = math.radians(210 - i * 24)
        text_out(str(i * 2), 80 * math.cos(a), 80 * math.sin(a), 18)
    poly([(-8, 0), (60, 58), (-0, 8)], 'accent') if False else None
    with T(0, 0, 1, rot=-35):
        poly([(-8, 0), (0, 92), (8, 0)], 'accent')
    circ(0, 0, 18, 'body2')
    rrect(-40, -88, 80, 30, 8, 'glass'); text_out('GO!', 0, -73, 22)


def jerrycan():
    rrect(-110, -140, 220, 280, 22, 'body')
    poly([(-110, 100), (-60, 140), (60, 140), (110, 100)], 'body') if False else None
    rrect(-70, 140, 100, 36, 10, 'body2'); rrect(36, 134, 36, 26, 6, 'body2')
    rrect(-60, 100, 70, 14, 7, 'body2') if False else None
    line([(-80, -90), (80, 90)], 1.4); line([(-80, 90), (80, -90)], 1.4)
    rrect(-60, 60, 120, 0.1, 0) if False else None
    flame(0, 0, 36, role='accent')


def toolbox():
    rrect(-72, 40, 144, 110, 40, 'body2')
    rrect(-46, 36, 92, 80, 26, 'w')
    rrect(-150, -100, 300, 170, 20, 'body')
    line([(-150, 0), (150, 0)])
    rrect(-26, -14, 52, 38, 8, 'badge')
    star(0, -56, 26, 'accent')
    circ(-104, -60, 9); circ(104, -60, 9)


def medal():
    poly([(-70, 190), (-20, 190), (30, 60), (-20, 60)], 'body2')
    poly([(70, 190), (20, 190), (-30, 60), (20, 60)], 'body')
    circ(0, -20, 100, 'accent'); circ(0, -20, 76); star(0, -20, 56, 'sun')


def goggles():
    shape([('M', -240, 20), ('C', -250, -30, -230, -50, -170, -40), ('L', -150, 10), ('Z',)], 'body') if False else None
    rrect(-250, -30, 90, 60, 20, 'body'); rrect(160, -30, 90, 60, 20, 'body')
    circ(-90, 0, 85, 'body'); circ(90, 0, 85, 'body')
    circ(-90, 0, 62, 'glass'); circ(90, 0, 62, 'glass')
    rrect(-34, -18, 68, 36, 14, 'body2')
    curve(-120, 20, -100, 40, -70, 40, -50, 20); curve(60, 20, 80, 40, 110, 40, 130, 20)
    star(-90, 6, 16, 'sun'); star(90, 6, 16, 'sun')


def glove():
    with T(-104, 72, 1, rot=38):
        rrect(-28, -20, 56, 100, 26, 'body')
    rrect(-96, 20, 192, 150, 40, 'body')
    for i in range(4):
        h = (96, 112, 104, 84)[i]
        rrect(-96 + i * 48 + 2, 140, 44, h, 20, 'body')
    rrect(-110, -50, 220, 80, 14, 'body2')
    rrect(-110, -50, 220, 28, 14, 'accent')
    star(0, 94, 28, 'accent')


def signs():
    for (x, kind) in ((-110, 'speed'), (110, 'curve')):
        rrect(x - 7, -170, 14, 190, 4, 'body')
        if kind == 'speed':
            circ(x, 90, 96, 'badge'); circ(x, 90, 74); text_out('50', x, 90, 52)
        else:
            poly([(x - 100, 0), (x + 100, 0), (x, 170)], 'accent')
            poly([(x - 70, 14), (x + 70, 14), (x, 134)], 'w')
            curve(x - 26, 36, x - 26, 66, x + 26, 70, x + 26, 100)
            poly([(x + 26, 114), (x + 8, 90), (x + 44, 90)], 'body', True)


def big_cone():
    rrect(-120, -150, 240, 40, 10, 'base')
    poly([(-96, -110), (96, -110), (30, 140), (-30, 140)], 'cone')
    poly([(-66, -2), (66, -2), (50, 44), (-50, 44)], 'w')
    poly([(-38, 94), (38, 94), (30, 140), (-30, 140)], 'w') if False else None
    rrect(-14, 140, 28, 22, 8, 'cone')


def oilcan():
    shape([('M', -70, -110), ('L', 70, -110), ('L', 70, 40), ('C', 70, 62, 30, 70, 0, 100), ('L', 0, 100), ('C', -30, 70, -70, 62, -70, 40), ('Z',)], 'body') if False else None
    rrect(-90, -130, 180, 190, 24, 'body')
    poly([(60, 40), (170, 130), (180, 112), (84, 20)], 'body2')
    curve(40, 110, 140, 150, 220, 90, 240, 40) if False else None
    shape([('M', 0, 60), ('C', -40, 80, -40, 130, 0, 130), ('C', 40, 130, 40, 80, 0, 60), ('Z',)], 'sun') if False else None
    rrect(-20, 60, 40, 40, 10, 'body2')
    circ(0, -34, 44, 'badge'); text_out('OIL', 0, -34, 28)
    flame(0, 134, 22, role='sun') if False else None
    ell(-180, -20, 0.1, 0.1)


def pit_garage():
    rrect(-220, -150, 440, 250, 14, 'bld')
    rrect(-250, 100, 500, 44, 10, 'body2')
    rrect(-150, -130, 300, 190, 8, 'w')
    for i in range(6):
        line([(-150, -130 + i * 32), (150, -130 + i * 32)], 0.7)
    circ(0, 124, 20, 'badge'); text_out('PIT', 0, 124, 18)
    for (x, y) in ((-190, -150), (190, -150)):
        pass
    flag_x = 190
    line([(flag_x, 144), (flag_x, 230)], 1.1)
    poly([(flag_x, 230), (flag_x + 50, 215), (flag_x, 200)], 'flag')
    # Reifenstapel
    for i in range(3):
        rrect(-215, -140 + i * 0, 0, 0, 0)
    for i in range(3):
        ell(-190, -150 - 0 + 0, 0.1, 0.1)


def finish_arch():
    rrect(-250, -170, 36, 330, 8); rrect(214, -170, 36, 330, 8)
    rrect(-250, 130, 500, 100, 14)
    checker(0, 180, 440, 60, 14, 2)
    for i, x in enumerate((-150, -50, 50, 150)):
        pass
    star(-170, 180, 18, 'sun'); star(170, 180, 18, 'sun')


def flag_pole(x):
    line([(x, -170), (x, -100)])


def track():
    rrect(-230, -170, 460, 340, 150, 'road')
    rrect(-150, -90, 300, 180, 90, 'grassy')
    # gestrichelte Mittellinie
    for i in range(24):
        a = math.radians(i * 15)
    checker(-190, 0, 20, 70, 1, 5) if False else None
    rrect(-220, -26, 20 + 0, 52, 0) if False else None
    for i in range(5):
        for j in range(2):
            if (i + j) % 2 == 0:
                blackrect(-230 + j * 20, -50 + i * 20, 20, 20)
    topcar(-190, 90, rot=-8, s=0.72)
    topcar(0, 125, rot=-90, s=0.72)
    topcar(190, -50, rot=180, s=0.72)
    tree(0, -10, 0.7); circ(0, 0, 0.1)
    star(60, 20, 14, 'sun')
    pine(-60, -50, .5)


def mega_number(txt):
    text_out(txt, 0, 0, 380)


def rocket_car():
    pass
