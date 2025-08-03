import os
import json
import random

# Configuración
TIPOS_TILES = ['Bosque', 'Desierto', 'Lava', 'Nieve', 'Piedra']
NUMERO_NIVELES = 10
ANCHURA = 6   # número de tiles en x
ALTURA = 6    # número de tiles en y
CARPETA = 'niveles'

os.makedirs(CARPETA, exist_ok=True)

for i in range(1, NUMERO_NIVELES + 1):
    nivel = {
        "tiles": []
    }

    for y in range(ALTURA):
        for x in range(ANCHURA):
            tile = {
                "x": x,
                "y": y,
                "tipo": random.choice(TIPOS_TILES)
            }
            nivel["tiles"].append(tile)

    nombre_archivo = os.path.join(CARPETA, f"nivel-{i}.json")
    with open(nombre_archivo, 'w') as archivo:
        json.dump(nivel, archivo, indent=2)

print(f"{NUMERO_NIVELES} niveles generados en la carpeta '{CARPETA}'.")
