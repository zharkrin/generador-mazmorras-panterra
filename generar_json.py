import os
import json
import random

# Configuración
TIPOS_TILES = ['Bosque', 'Desierto', 'Lava', 'Nieve', 'Piedra']
NUMERO_NIVELES = 30
ANCHURA = 6
ALTURA = 6
CARPETA = 'niveles'

os.makedirs(CARPETA, exist_ok=True)

def generar_nivel(nombre, tipo='normal'):
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

            if tipo == 'jefe' and x == centro_x and y == centro_y:
                tile["tipo"] = "Jefe"
                tile["jefe"] = True
                tile["circulo_magico"] = True

            elif tipo == 'campamento':
                if x == centro_x and y == centro_y:
                    tile["tipo"] = "Plaza"
                    tile["campamento"] = True
                    tile["pueblo"] = True
                elif abs(x - centro_x) <= 1 and abs(y - centro_y) <= 1:
                    # Añadir edificios del pueblo alrededor de la plaza
                    opciones = ['Casa', 'Tienda', 'Sanador', 'Herrero', 'Taberna']
                    tile["tipo"] = random.choice(opciones)
                    tile["pueblo"] = True

            nivel["tiles"].append(tile)

    with open(os.path.join(CARPETA, f"{nombre}.json"), 'w') as archivo:
        json.dump(nivel, archivo, indent=2)

# Generar niveles
for i in range(1, NUMERO_NIVELES + 1):
    generar_nivel(f"nivel-{i}")  # Normal

    if i % 10 == 0:
        generar_nivel(f"nivel-{i}", tipo='jefe')        # Nivel de jefe
        generar_nivel(f"nivel-{i}.5", tipo='campamento') # Pueblo / campamento

print(f"Se generaron {NUMERO_NIVELES} niveles con jefes y pueblos.")