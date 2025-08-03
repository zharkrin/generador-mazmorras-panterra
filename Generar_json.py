import os
import json
import random

# Configuración
TIPOS_TILES = ['Bosque', 'Desierto', 'Lava', 'Nieve', 'Piedra']
NUMERO_NIVELES = 30
ANCHURA = 6  # número de tiles en x
ALTURA = 6   # número de tiles en y
CARPETA = 'niveles'

os.makedirs(CARPETA, exist_ok=True)

for i in range(1, NUMERO_NIVELES + 1):
    nivel = {
        "tiles": []
    }

    centro_x = ANCHURA // 2
    centro_y = ALTURA // 2

    for y in range(ALTURA):
        for x in range(ANCHURA):
            tile = {
                "x": x,
                "y": y,
                "tipo": random.choice(TIPOS_TILES)
            }

            # Si es un nivel de jefe (cada 10 niveles), coloca la sala en el centro
            if i % 10 == 0 and x == centro_x and y == centro_y:
                tile["tipo"] = "Jefe"
                tile["jefe"] = True
                tile["circulo_magico"] = True  # Solo se activa tras el jefe

            nivel["tiles"].append(tile)

    nombre_archivo = os.path.join(CARPETA, f"nivel-{i}.json")
    with open(nombre_archivo, 'w') as archivo:
        json.dump(nivel, archivo, indent=2)

print(f"{NUMERO_NIVELES} niveles generados con jefes en los niveles 10, 20, 30...")