"""Arena monthly pools, diamond layout, and deterministic mission assignment."""
from __future__ import annotations

from calendar import monthrange
from datetime import datetime

XP_BY_RANK = {"silver": 100, "gold": 200, "plat": 300, "master": 500}
TYPE_LABELS = {
    "precision": "Precizitás",
    "speed": "Sebesség",
    "control": "Kontroll",
    "mechanic": "Mechanika",
}
RANK_LABELS = {
    "silver": "Silver Aréna",
    "gold": "Gold Aréna",
    "plat": "Platinum Aréna",
    "master": "Master Aréna",
}
TREE_LABELS = {"dribble": "Dribble", "aerial": "Aerial"}
MASTER_TITLES = {"dribble": "dribble_master", "aerial": "aerial_master"}
RELATED = {
    "precision": ["t10", "t7"],
    "speed": ["t15", "t2"],
    "control": ["t8", "t27"],
    "mechanic": ["t9", "t13"],
}
DEMO_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

# Diamond tree, bottom (tier 0) = Silver, top = Master.
# cols = nodes in the row (for centering).
LAYOUT = [
    {"slot": "s0", "rank": "silver", "tier": 0, "col": 0, "cols": 1},
    {"slot": "s1", "rank": "silver", "tier": 1, "col": 0, "cols": 2},
    {"slot": "s2", "rank": "silver", "tier": 1, "col": 1, "cols": 2},
    {"slot": "s3", "rank": "silver", "tier": 2, "col": 0, "cols": 3},
    {"slot": "s4", "rank": "silver", "tier": 2, "col": 1, "cols": 3},
    {"slot": "s5", "rank": "silver", "tier": 2, "col": 2, "cols": 3},
    {"slot": "g0", "rank": "gold", "tier": 3, "col": 0, "cols": 4},
    {"slot": "g1", "rank": "gold", "tier": 3, "col": 1, "cols": 4},
    {"slot": "g2", "rank": "gold", "tier": 3, "col": 2, "cols": 4},
    {"slot": "g3", "rank": "gold", "tier": 3, "col": 3, "cols": 4},
    {"slot": "g4", "rank": "gold", "tier": 4, "col": 0, "cols": 5},
    {"slot": "g5", "rank": "gold", "tier": 4, "col": 1, "cols": 5},
    {"slot": "g6", "rank": "gold", "tier": 4, "col": 2, "cols": 5},
    {"slot": "g7", "rank": "gold", "tier": 4, "col": 3, "cols": 5},
    {"slot": "g8", "rank": "gold", "tier": 4, "col": 4, "cols": 5},
    {"slot": "g9", "rank": "gold", "tier": 5, "col": 0, "cols": 4},
    {"slot": "g10", "rank": "gold", "tier": 5, "col": 1, "cols": 4},
    {"slot": "g11", "rank": "gold", "tier": 5, "col": 2, "cols": 4},
    {"slot": "g12", "rank": "gold", "tier": 5, "col": 3, "cols": 4},
    {"slot": "p0", "rank": "plat", "tier": 6, "col": 0, "cols": 3},
    {"slot": "p1", "rank": "plat", "tier": 6, "col": 1, "cols": 3},
    {"slot": "p2", "rank": "plat", "tier": 6, "col": 2, "cols": 3},
    {"slot": "p3", "rank": "plat", "tier": 7, "col": 0, "cols": 2},
    {"slot": "p4", "rank": "plat", "tier": 7, "col": 1, "cols": 2},
    {"slot": "m0", "rank": "master", "tier": 8, "col": 0, "cols": 1},
]


def _m(tree: str, rank: str, n: int, typ: str, text: str) -> dict:
    return {
        "id": f"{tree}-{rank}-{n}",
        "tree": tree,
        "rank": rank,
        "index": n,
        "type": typ,
        "text": text,
        "xp": XP_BY_RANK[rank],
        "videoUrl": DEMO_VIDEO,
        "relatedTutorialIds": RELATED[typ],
    }


DRIBBLE = (
    [_m("dribble", "master", n, t, x) for n, t, x in [
        (1, "control", "A tetődön vezesd el háttal a labdát az egyik kaputól a másik kapuig, fordulj meg és vezesd vissza, majd háttal Flick-eld be a kapuba."),
        (2, "precision", "Delayed Breezi-vel lődd az oldalsó falra a labdát, majd Redirect-eld a kapuba."),
        (3, "speed", "Tegyél Powerslide-al egy 360°-os fordulatot a labdával, majd Breezi Flick-eld be a kapuba legalább 100km/h-val."),
    ]]
    + [_m("dribble", "plat", n, t, x) for n, t, x in [
        (1, "control", "Tegyél a pályán egy teljes kört a labdával boost használata nélkül, úgy hogy minden nagy boost-on áthaladsz, majd vezesd be abba a kapuba amelyikből indultál."),
        (2, "precision", "Csinálj legalább 3 Bounce Dribble-t, majd lődd Powershot-tal a kapu bal felső sarkába."),
        (3, "precision", "Csinálj legalább 3 Bounce Dribble-t, majd lődd Powershot-tal a kapu jobb felső sarkába."),
        (4, "mechanic", "Lőj be egy Delayed Breezi Flick-et."),
        (5, "precision", "Lőj be egy Breezi Flick-et a kapu bal felső sarkába."),
        (6, "precision", "Lőj be egy Breezi Flick-et a kapu jobb felső sarkába."),
        (7, "speed", "Cselezz Powerslide Cut-tal, majd lődd kapu bal felső sarkába legalább 110km/h-val."),
        (8, "speed", "Cselezz Powerslide Cut-tal, majd lődd kapu jobb felső sarkába legalább 110km/h-val."),
        (9, "control", "Vezesd hátrafele egy kis ideig a labdát, majd Flick-eld a kapu bal oldalába."),
        (10, "control", "Vezesd hátrafele egy kis ideig a labdát, majd Flick-eld a kapu jobb oldalába."),
        (11, "mechanic", "Lőj be egy Delayed Musty Flick-et."),
        (12, "speed", "Lőj be egy Musty Flick-et ami legalább 100km/h, a kapu bal felső sarkába."),
        (13, "speed", "Lőj be egy Musty Flick-et ami legalább 100km/h, a kapu jobb felső sarkába."),
        (14, "mechanic", "Wall Dash-elj az oldalfalon boost használata nélkül, kerülj Supersonic-ba, majd lődd be a labdát a kapuba."),
        (15, "control", "Flick-eld előre a labdát, csinálj egy Zap Dash-t, kapd el a labdát, majd Flick-eld a kapuba."),
        (16, "control", "Vezesd be háttal az egyik kapuból a másik kapuba a labdát, úgy hogy a labda a tetődön van."),
        (17, "control", "Tegyél Powerslide-al egy 360°-os fordulatot a labdával, majd Flick-eld be a kapuba."),
        (18, "control", "Flick-eld előre a labdát, kapd el, majd Flick-eld be a kapuba."),
        (19, "control", "Csinálj balra egy 180°-os Powerslide kanyart, úgy hogy a tetődön marad a labda, majd Flick-eld a kapuba."),
        (20, "control", "Csinálj jobbra egy 180°-os Powerslide kanyart, úgy hogy a tetődön marad a labda, majd Flick-eld a kapuba."),
        (21, "control", "Vezesd be az egyik kapuból a labdát a másik kapuba, úgy hogy a labda a tetődön van és nem használsz Boost-ot."),
    ]]
    + [_m("dribble", "gold", n, t, x) for n, t, x in [
        (1, "precision", "Lőj be egy Powershot-ot a kapu bal felső sarkába."),
        (2, "precision", "Lőj be egy Powershot-ot a kapu jobb felső sarkába."),
        (3, "precision", "Csinálj legalább 2 Bounce Dribble-t, majd lődd Powershot-tal a kapu bal oldalába a labdát."),
        (4, "precision", "Csinálj legalább 2 Bounce Dribble-t, majd lődd Powershot-tal a kapu jobb oldalába a labdát."),
        (5, "mechanic", "Csinálj egy Wall Dash-t, ugorj le a falról, úgy hogy Wave Dash-elsz a földön, majd Powershot-tal lődd be a labdát a kapu bal oldalába."),
        (6, "mechanic", "Csinálj egy Wall Dash-t, ugorj le a falról, úgy hogy Wave Dash-elsz a földön, majd Powershot-tal lődd be a labdát a kapu jobb oldalába."),
        (7, "speed", "Lőj be egy Musty Flick-et, ami legalább 100 km/h."),
        (8, "precision", "Lőj be egy Musty Flick-et a kapu bal felső sarkába."),
        (9, "precision", "Lőj be egy Musty Flick-et a kapu jobb felső sarkába."),
        (10, "mechanic", "Lőj be egy Breezi Flick-et a kapu bal oldalába."),
        (11, "mechanic", "Lőj be egy Breezi Flick-et a kapu jobb oldalába."),
        (12, "precision", "Lőj be egy Kuxir Pinch-et."),
        (13, "mechanic", "Csinálj egy Zap Dash-t, majd lődd be a labdát a kapuba."),
        (14, "mechanic", "Csinálj egy Horse Dash-t, majd lődd be a labdát a kapuba."),
        (15, "mechanic", "Csinálj egy Curve Dash-t, úgy hogy legurulsz az oldalsó falról, majd lődd a labdát a kapuba."),
        (16, "precision", "Flick-eld fel az egyik kapu Backboard-jára a labdát, majd vedd le és Powershot-tal lődd a másik kapu bal oldalába."),
        (17, "precision", "Flick-eld fel az egyik kapu Backboard-jára a labdát, majd vedd le és Powershot-tal lődd a másik kapu jobb oldalába."),
        (18, "control", "Add magadnak Backboard-ra a labdát, vedd le anélkül hogy lepattanna, majd vezesd be a labdát a másik kapuba."),
        (19, "control", "Add magadnak Backboard-ra a labdát, vedd le anélkül hogy lepattanna, majd félpályánál ejtsd le és Powershot-tal lődd a kapuba."),
        (20, "control", "Add magadnak Backboard-ra a labdát, vedd le anélkül hogy lepattanna, majd félpályáról Flick-eld a kapuba."),
        (21, "speed", "Lődd az oldalfalnak a labdát, majd a visszapattanót vedd át és Flick-eld a kapuba legalább 100km/h-val."),
        (22, "control", "Lődd az oldalfalnak a labdát, majd a visszapattanót vedd át és pattanás nélkül vezesd a kapuba."),
        (23, "precision", "Lődd az oldalfalnak a labdát, majd a visszapattanót azonnal lődd a kapu bal oldalába, úgy hogy nem pattan le a labda."),
        (24, "precision", "Lődd az oldalfalnak a labdát, majd a visszapattanót azonnal lődd a kapu jobb oldalába, úgy hogy nem pattan le a labda."),
        (25, "speed", "Flick-eld az oldalfalnak a labdát, majd a visszapattanót lődd azonnal a kapuba legalább 100km/h-val."),
        (26, "control", "Flick-eld az oldalfalnak a labdát, majd a visszapattanót vedd át és Flick-eld a kapuba."),
        (27, "precision", "Flick-eld az oldalfalnak a labdát, majd a visszapattanót azonnal lődd a kapu bal oldalába, úgy hogy nem pattan le a labda."),
        (28, "precision", "Flick-eld az oldalfalnak a labdát, majd a visszapattanót azonnal lődd a kapu jobb oldalába, úgy hogy nem pattan le a labda."),
        (29, "control", "Flick-eld az oldalfalnak a labdát, majd a visszapattanót vedd át és pattanás nélkül vezesd a kapuba."),
        (30, "mechanic", "Csinálj egy Half Flip-pet, majd 45°-os Flick-el lődd a labdát a kapuba."),
        (31, "precision", "Flick-eld fel a labdát, majd pattanás után lődd a kapu bal oldalába."),
        (32, "precision", "Flick-eld fel a labdát, majd pattanás után lődd a kapu jobb oldalába."),
        (33, "precision", "Flick-eld fel a labdát, kapd el, majd Flick-eld be a kapu bal felső sarkába."),
        (34, "precision", "Flick-eld fel a labdát, kapd el, majd Flick-eld be a kapu jobb felső sarkába."),
        (35, "precision", "Cselezz Powerslide Cut-tal, majd lődd kapu bal felső sarkába a labdát."),
        (36, "precision", "Cselezz Powerslide Cut-tal, majd lődd kapu jobb felső sarkába a labdát."),
        (37, "control", "Tegyél a pályán egy teljes kört a labdával, úgy hogy minden nagy boost-on áthaladsz, majd vezesd be abba a kapuba amelyikből indultál."),
        (38, "control", "Vezesd be az egyik kapuból a labdát a másik kapuba, úgy hogy a labda a tetődön van."),
        (39, "control", "Menj 2 keréken egy kis ideig, majd lődd a labdát a kapuba."),
        (40, "control", "Flick-eld mögéd a labdát, kapd el, csináld meg még egyszer, majd Flick-eld a kapu bal oldalába."),
        (41, "control", "Flick-eld mögéd a labdát, kapd el, csináld meg még egyszer, majd Flick-eld a kapu jobb oldalába."),
        (42, "speed", "Passzold előre magadnak a labdát középkezdésből, majd vedd át és Flick-eld a kapu bal felső sarkába legalább 100km/h-val."),
        (43, "speed", "Passzold előre magadnak a labdát középkezdésből, majd vedd át és Flick-eld a kapu jobb felső sarkába legalább 100km/h-val."),
        (44, "precision", "Passzold előre magadnak a labdát középkezdésből, majd Air Roll-al ráfordulva lődd azonnal a kapu bal oldalába."),
        (45, "precision", "Passzold előre magadnak a labdát középkezdésből, majd Air Roll-al ráfordulva lődd azonnal a kapu jobb oldalába."),
    ]]
    + [_m("dribble", "silver", n, t, x) for n, t, x in [
        (1, "precision", "Lőj be egy 45° Flick-et a kapu bal felső sarkába."),
        (2, "precision", "Lőj be egy 45° Flick-et a kapu jobb felső sarkába."),
        (3, "precision", "Lőj be egy 180° Flick-et a kapu bal oldalába."),
        (4, "precision", "Lőj be egy 180° Flick-et a kapu jobb oldalába."),
        (5, "precision", "Flick-eld be a labdát a kapu bal oldalába."),
        (6, "precision", "Flick-eld be a labdát a kapu jobb oldalába."),
        (7, "mechanic", "Lőj be egy Musty Flick-et."),
        (8, "precision", "Cselezz Powerslide Cut-tal, majd lődd a kapu bal oldalába a labdát."),
        (9, "precision", "Cselezz Powerslide Cut-tal, majd lődd a kapu jobb oldalába a labdát."),
        (10, "control", "Középről vezesd be a labdát a kapuba, anélkül hogy a labda leesne rólad."),
        (11, "mechanic", "Csinálj egy Wavedash-t az oldalsó falról lejőve, majd Flick-eld a labdát a kapuba."),
        (12, "precision", "Lődd az oldalfalnak a labdát félpályáról, majd mikor visszapattan, lődd a kapuba."),
        (13, "precision", "Gurítsd fel erősen az oldalfalra a labdát, majd a falról azonnal lődd a kapuba."),
        (14, "precision", "Lődd Backboard-ra a labdát középkezdésből, majd pattanásnál lődd a kapuba."),
        (15, "precision", "Vezesd fel a labdát az oldalfalra, üsd el, menj le a földre, majd mielőtt még lepattanna, lődd a kapuba a labdát."),
    ]]
)

AERIAL = (
    [_m("aerial", "master", n, t, x) for n, t, x in [
        (1, "precision", "Lőj be egy Psycho-t."),
        (2, "control", "Lőj be egy Ground to Air Dribble Ceiling Shot Musty Double Tap-et."),
        (3, "speed", "Lőj be egy Ceiling Pinch Ground Pinch-et, ami legalább 120km/h."),
    ]]
    + [_m("aerial", "plat", n, t, x) for n, t, x in [
        (1, "control", "Flick-eld fel a labdát, csinálj legalább 3 érintést a levegőben, majd vezesd be a kapuba pattanás nélkül."),
        (2, "speed", "Lőj be egy Ceiling Pinch-et, ami legalább 140km/h."),
        (3, "mechanic", "Lőj be egy Double Flip Reset-et."),
        (4, "control", "Lőj be egy Cross-Map Air Dribble Flip Reset Musty-t."),
        (5, "control", "Lőj be egy Cross-Map Pop Reset-et."),
        (6, "precision", "Lődd az oldalsó falnak a labdát középkezdésből, majd ugorj utána azonnal és Redirect-eld."),
        (7, "mechanic", "Lőj be egy Double Flip Reset Musty Double Tap-et."),
        (8, "speed", "Lőj be egy Ground Pinch-et, ami legalább 160km/h."),
        (9, "mechanic", "Lőj be egy Flip Reset Plan B-t."),
        (10, "control", "Lőj be egy Double Pop Reset-et."),
        (11, "mechanic", "Lőj be egy Double Flip Reset Pogo-t."),
        (12, "mechanic", "Lőj be egy Double Flip Reset Musty-t."),
        (13, "precision", "Lőj be egy Ceiling Pinch Double Tap-et."),
        (14, "mechanic", "Lőj be egy Stall Reset Musty-t."),
        (15, "control", "Lőj be egy Ground to Air Dribble Flip Reset Musty Double Tap-et."),
        (16, "precision", "Lőj be egy Ceiling Wave Dash Musty Double Tap-et."),
        (17, "control", "Lőj be egy Ground to Air Dribble Ceiling Shot-ot."),
        (18, "control", "Lőj be egy TKO Reset-et."),
        (19, "mechanic", "Lőj be egy Triple Flip Reset-et."),
        (20, "precision", "Lőj be egy Musty Side-Wall Redirect-et."),
        (21, "mechanic", "Lőj be egy Reset Maktuf Reset-et."),
    ]]
    + [_m("aerial", "gold", n, t, x) for n, t, x in [
        (1, "mechanic", "Lőj be egy Ceiling Pinch-et."),
        (2, "mechanic", "Lőj be egy Pop Reset-et."),
        (3, "mechanic", "Lőj be egy Flip Reset-et."),
        (4, "precision", "Csinálj egy Ceiling Wave Dash-t, majd lődd a kapu bal oldalába a labdát."),
        (5, "precision", "Csinálj egy Ceiling Wave Dash-t, majd lődd a kapu jobb oldalába a labdát."),
        (6, "control", "Lőj be egy Ground to Air Dribble-t a saját kapudból indulva, úgy hogy nem pattan le a labda."),
        (7, "control", "Lőj be egy Wall to Air Dribble-t, úgy hogy a labda nem pattan le."),
        (8, "control", "Lőj be egy Wall to Air Dribble Double Tap-et."),
        (9, "control", "Lőj be egy Ground to Air Dribble Double Tap-et."),
        (10, "control", "Lőj be egy Turtle Air Dribble-t az oldalsó falról."),
        (11, "precision", "Lőj be egy Ceiling Shot-ot a kapu bal felső sarkába."),
        (12, "precision", "Lőj be egy Ceiling Shot-ot a kapu jobb felső sarkába."),
        (13, "mechanic", "Lőj be egy Ceiling Shot Musty-t."),
        (14, "mechanic", "Lőj be egy Ceiling Shot Pogo-t."),
        (15, "mechanic", "Lőj be egy Musty Flip Reset-et."),
        (16, "mechanic", "Lőj be egy Flip Reset Musty-t."),
        (17, "mechanic", "Lőj be egy Stall Reset-et."),
        (18, "mechanic", "Lőj be egy Ground Pinch-et."),
        (19, "control", "Csinálj egy Musty-t az oldalfalról, majd Air Dribble-el vezesd be a labdát a kapuba anélkül hogy lepattanna."),
        (20, "precision", "Flick-eld fel magadnak a labdát, majd levegőben lődd a kapu bal felső sarkába."),
        (21, "precision", "Flick-eld fel magadnak a labdát, majd levegőben lődd a kapu jobb felső sarkába."),
        (22, "control", "Tegyél meg egy teljes kört a pálya körül a levegőben, úgy hogy minden nagy boost felett elhaladsz, de nem érsz hozzá semmihez, majd utána lődd be a labdát a kapuba."),
        (23, "mechanic", "Lőj be egy Ceiling Shot-ot, úgy hogy Flip Cancel-el lövöd a kapu bal oldalába a labdát."),
        (24, "mechanic", "Lőj be egy Ceiling Shot-ot, úgy hogy Flip Cancel-el lövöd a kapu jobb oldalába a labdát."),
        (25, "mechanic", "Lőj be egy Backflip Reset-et."),
        (26, "mechanic", "Lőj be egy Flip Reset Pogo-t."),
        (27, "control", "Lőj be egy Cross-Map Air Dribble-t, anélkül hogy lepattanna a labda."),
        (28, "control", "Lőj be egy Ground to Air Dribble Flip Reset Musty-t."),
        (29, "control", "Vidd fel a bal oldali sarokba a labdát, majd onnan vezesd be a kapu elé és a falról elugorva lődd be a kapuba."),
        (30, "control", "Vidd fel a jobb oldali sarokba a labdát, majd onnan vezesd be a kapu elé és a falról elugorva lődd be a kapuba."),
        (31, "precision", "Add magadnak Backboard-ra a labdát, ugorj fel rá minél hamarabb és erősen Clear-eld ki, majd vezesd be a labdát a kapuba."),
        (32, "precision", "Add magadnak Backboard-ra a labdát, pattanásnál erősen Clear-eld ki, majd vezesd be a labdát a kapuba."),
        (33, "control", "Lőj be egy Ground to Air Dribble Flip Reset-et."),
        (34, "precision", "Lőj be egy Musty Double Tap-et."),
        (35, "precision", "Középről lődd Backboardra a labdát, majd minél hamarabb ugorj utána és Double Tap-eld."),
        (36, "mechanic", "Lőj be egy Flip Reset Pogo Musty-t."),
        (37, "precision", "Lőj be egy Flip Reset Musty Double Tap-et az oldalfalról."),
        (38, "precision", "Lőj be egy Ceiling Shot Musty Double Tap-et."),
        (39, "precision", "Lőj be egy Ceiling Wave Dash Musty-t a kapu bal oldalába."),
        (40, "precision", "Lőj be egy Ceiling Wave Dash Musty-t a kapu jobb oldalába."),
        (41, "precision", "Lőj be egy Ceiling Wave Dash Pogo-t a kapu bal oldalába."),
        (42, "precision", "Lőj be egy Ceiling Wave Dash Pogo-t a kapu jobb oldalába."),
        (43, "mechanic", "Lőj be egy Musty Flip Reset Musty-t az oldalfalról."),
        (44, "control", "Lőj be egy Turtle Reset Air Dribble Musty-t."),
        (45, "mechanic", "Lőj be egy Plan B-t."),
    ]]
    + [_m("aerial", "silver", n, t, x) for n, t, x in [
        (1, "precision", "Repülj középről a kapu bal felső sarkába, majd vezesd be a labdát a másik kapuba."),
        (2, "precision", "Repülj középről a kapu jobb felső sarkába, majd vezesd be a labdát a másik kapuba."),
        (3, "control", "Háttal repülj be az egyik kapuból a másikba, majd vezesd be a labdát a másik kapuba."),
        (4, "control", "Oldalasan repülj be az egyik kapuból a másikba, majd vezesd be a labdát a másik kapuba."),
        (5, "precision", "Üsd el az oldalfalról a labdát, majd ugorj utána és lődd be a kapuba."),
        (6, "precision", "Középről lődd Backboardra a labdát, majd mikor visszapattan ugorj utána és lődd be a kapuba."),
        (7, "precision", "Add fel magadnak középkezdésből a labdát, majd repülj fel és lődd be a kapuba."),
        (8, "control", "Lőj be félpályáról egy Ground to Air Dribble-t, úgy hogy a labda nem pattan le."),
        (9, "control", "Repülj el az egyik kapuból a másik kapuba, úgy hogy végig lenyomva tartod a Directional Air Roll-t, majd vezesd be a labdát a másik kapuba."),
        (10, "control", "Repülj fel és érj hozzá a Ceiling-hez, érkezz le a 4 kerekedre, majd vezesd be a labdát a kapuba."),
        (11, "precision", "Flick-eld fel magadnak a labdát, majd levegőben lődd a kapu bal oldalába."),
        (12, "precision", "Flick-eld fel magadnak a labdát, majd levegőben lődd a kapu jobb oldalába."),
        (13, "mechanic", "Repülj fel a Ceiling-re és szerezd meg a Reset-et, használd el a Flipped, majd vezesd be a labdát a kapuba."),
        (14, "mechanic", "Gurulj fel a Ceiling-re, csinálj egy Pogo-t, majd vezesd be a labdát a kapuba."),
        (15, "mechanic", "Csinálj egy Fast Aerialt, majd vezesd be a labdát a kapuba."),
    ]]
)

DEFAULT_MISSIONS = list(DRIBBLE + AERIAL)


def get_missions() -> list[dict]:
    from .catalog import load

    data = load("arena")
    if isinstance(data, list) and data:
        return data
    return list(DEFAULT_MISSIONS)


def catalog() -> dict[str, dict]:
    return {m["id"]: m for m in get_missions() if isinstance(m, dict) and m.get("id")}


def pools() -> dict:
    missions = get_missions()
    return {
        "dribble": {r: [m for m in missions if m.get("tree") == "dribble" and m.get("rank") == r] for r in XP_BY_RANK},
        "aerial": {r: [m for m in missions if m.get("tree") == "aerial" and m.get("rank") == r] for r in XP_BY_RANK},
    }


def current_month() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def month_end_iso(month: str) -> str:
    y, m = (int(x) for x in month.split("-"))
    last = monthrange(y, m)[1]
    return f"{y:04d}-{m:02d}-{last:02d}T23:59:59"


def _djb2(s: str) -> int:
    h = 5381
    for ch in s:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return h


def prev_month(month: str) -> str:
    y, m = (int(x) for x in month.split("-"))
    m -= 1
    if m < 1:
        y -= 1
        m = 12
    return f"{y:04d}-{m:02d}"


def pick_pool(tree: str, rank: str, month: str, n: int, exclude_ids: set[str] | None = None) -> list[dict]:
    exclude = exclude_ids or set()
    rank_pool = pools()[tree][rank]
    pool = [m for m in rank_pool if m["id"] not in exclude]
    if len(pool) < n:
        pool = list(rank_pool)
    pool.sort(key=lambda m: _djb2(f"{month}|{tree}|{m['id']}"))
    return pool[:n]


def _rank_need(rank: str) -> int:
    return sum(1 for s in LAYOUT if s["rank"] == rank)


def month_mission_ids(tree: str, month: str) -> set[str]:
    """Previous-month picks (no further exclusion) so we can keep the pool fresh."""
    ids: set[str] = set()
    for rank in XP_BY_RANK:
        ids.update(m["id"] for m in pick_pool(tree, rank, month, _rank_need(rank)))
    return ids


def monthly_assignment(tree: str, month: str | None = None) -> list[dict]:
    month = month or current_month()
    exclude = month_mission_ids(tree, prev_month(month))
    by_rank: dict[str, list[dict]] = {}
    for rank in XP_BY_RANK:
        by_rank[rank] = pick_pool(tree, rank, month, _rank_need(rank), exclude)
    idx = {r: 0 for r in XP_BY_RANK}
    out = []
    for slot in LAYOUT:
        rank = slot["rank"]
        mission = by_rank[rank][idx[rank]]
        idx[rank] += 1
        out.append({**slot, "mission": mission})
    return out


def slot_by_id(tree: str, slot: str, month: str | None = None) -> dict | None:
    for item in monthly_assignment(tree, month):
        if item["slot"] == slot:
            return item
    return None


def parents_of(slot: str) -> list[str]:
    node = next((s for s in LAYOUT if s["slot"] == slot), None)
    if node is None or node["tier"] == 0:
        return []
    below = [s for s in LAYOUT if s["tier"] == node["tier"] - 1]

    def norm(s: dict) -> float:
        return 0.5 if s["cols"] <= 1 else s["col"] / (s["cols"] - 1)

    target = norm(node)
    best = min(abs(norm(s) - target) for s in below)
    return [s["slot"] for s in below if abs(norm(s) - target) <= best + 0.001]


def is_unlocked(slot: str, completed_slots: set[str]) -> bool:
    pars = parents_of(slot)
    if not pars:
        return True
    return any(p in completed_slots for p in pars)


RANK_TIER = {"silver": 1, "gold": 2, "plat": 3, "master": 4}
STAR_CAP = 5


def format_acquired(month: str) -> str:
    return (month or "").replace("-", ".")


def award_arena_badge(user, tree: str, rank: str, month: str) -> dict:
    """Unlock or star-upgrade a tree rank badge. Same rank in the same month does not stack."""
    from sqlalchemy.orm.attributes import flag_modified

    badges = list(user.arena_badges or [])
    badge_id = f"{tree}-{rank}"
    found = next((b for b in badges if b.get("id") == badge_id), None)
    if found:
        if found.get("lastMonth") != month:
            found["stars"] = min(STAR_CAP, int(found.get("stars") or 1) + 1)
            found["lastMonth"] = month
        user.arena_badges = badges
        flag_modified(user, "arena_badges")
        return found
    badge = {
        "id": badge_id,
        "tree": tree,
        "rank": rank,
        "stars": 1,
        "acquired": month,
        "lastMonth": month,
    }
    badges.append(badge)
    user.arena_badges = badges
    flag_modified(user, "arena_badges")
    return badge


def current_arena_badge(user) -> dict | None:
    badges = [b for b in (user.arena_badges or []) if isinstance(b, dict)]
    if not badges:
        return None
    month = current_month()
    current = [b for b in badges if b.get("lastMonth") == month]
    pool = current or badges
    return max(pool, key=lambda b: (RANK_TIER.get(b.get("rank"), 0), int(b.get("stars") or 0)))


def arena_xp(mission_id: str) -> int:
    m = catalog().get(mission_id)
    if m:
        return int(m["xp"])
    if "-master-" in mission_id:
        return 500
    if "-plat-" in mission_id:
        return 300
    if "-gold-" in mission_id:
        return 200
    return 100
