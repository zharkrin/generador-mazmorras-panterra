import random

BIOMAS = ["bosque", "desierto", "caverna", "roca"]
ANCHO = 10
ALTO = 10

def generar_mapa():
    return {
        "ancho": ANCHO,
        "alto": ALTO,
        "tiles": [
            [random.choice(BIOMAS) for _ in range(ANCHO)]
            for _ in range(ALTO)
        ]
    }