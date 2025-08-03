import os
import json
import random

# Carpeta de salida
OUTPUT_FOLDER = "niveles"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Lista de biomas posibles
biomas = [
    "Bosque", "Desierto", "Pantano", "Tundra", "Caverna", "Ruinas",
    "Volcán", "Marisma", "Jungla", "Llanura", "Montaña", "Lago Subterráneo"
]

# Rarezas posibles de objetos
rareza_items = ["Normal", "Infrecuente", "Rara", "Épica", "Única", "Legendaria", "Mítica"]

# Enemigos de ejemplo
enemigos = [
    "Goblin", "Orco", "No-Muerto", "Esqueleto", "Slime", "Bestia mágica",
    "Arácnido gigante", "Elemental", "Sombra", "Guardia maldito"
]

# Número de niveles básicos
NUM_NIVELES = 20

def generar_nivel(numero):
    nivel = {}

    # Nombres de niveles
    nivel["id"] = numero
    nivel["nombre"] = f"Nivel {numero}"

    # Bioma aleatorio
    nivel["bioma"] = random.choice(biomas)

    # ¿Tiene jefe?
    nivel["jefe"] = (numero % 10 == 0)

    # ¿Tiene campamento? (en 10.5, 20.5...)
    nivel["campamento_seguro"] = False

    # Cofres (2-5 cofres con rarezas)
    cofres = []
    for _ in range(random.randint(2, 5)):
        cofres.append({
            "pos_x": random.randint(0, 30),
            "pos_y": random.randint(0, 30),
            "rareza": random.choices(
                rareza_items,
                weights=[40, 30, 15, 8, 4, 2, 1],
                k=1
            )[0]
        })
    nivel["cofres"] = cofres

    # Enemigos (5-15 enemigos por nivel)
    enemigos_nivel = []
    for _ in range(random.randint(5, 15)):
        enemigos_nivel.append({
            "pos_x": random.randint(0, 30),
            "pos_y": random.randint(0, 30),
            "tipo": random.choice(enemigos)
        })
    nivel["enemigos"] = enemigos_nivel

    return nivel

# Generar niveles 1 al 20
for i in range(1, NUM_NIVELES + 1):
    nivel_data = generar_nivel(i)
    file_path = os.path.join(OUTPUT_FOLDER, f"nivel_{i}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(nivel_data, f, indent=4, ensure_ascii=False)

# Generar campamentos en subniveles como 10.5, 20.5, etc.
for i in range(10, NUM_NIVELES + 1, 10):
    campamento = {
        "id": f"{i}.5",
        "nombre": f"Campamento seguro del Nivel {i}",
        "bioma": "Zona Segura",
        "jefe": False,
        "campamento_seguro": True,
        "cofres": [],
        "enemigos": []
    }
    file_path = os.path.join(OUTPUT_FOLDER, f"nivel_{i}_5.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(campamento, f, indent=4, ensure_ascii=False)

print(f"✅ Se generaron {NUM_NIVELES + (NUM_NIVELES // 10)} archivos .json en la carpeta 'niveles/'")