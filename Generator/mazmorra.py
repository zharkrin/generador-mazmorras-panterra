import random

# Definimos los biomas disponibles y su imagen asociada
BIOMAS = [
    {
        "nombre": "Bosque",
        "imagen": "static/tiles/Bosque.png",
        "entorno": "bosque",
        "clima": "templado",
        "dificultad": "media"
    },
    {
        "nombre": "Caverna",
        "imagen": "static/tiles/Caverna.png",
        "entorno": "subterráneo",
        "clima": "húmedo",
        "dificultad": "media"
    },
    {
        "nombre": "Desierto",
        "imagen": "static/tiles/Desierto.png",
        "entorno": "árido",
        "clima": "caliente",
        "dificultad": "alta"
    },
    {
        "nombre": "Pantano",
        "imagen": "static/tiles/Pantano.png",
        "entorno": "fangoso",
        "clima": "húmedo",
        "dificultad": "alta"
    },
    {
        "nombre": "Volcán",
        "imagen": "static/tiles/Volcan.png",
        "entorno": "rocoso",
        "clima": "caliente",
        "dificultad": "muy alta"
    },
    {
        "nombre": "Mar",
        "imagen": "static/tiles/Mar.png",
        "entorno": "acuático",
        "clima": "variable",
        "dificultad": "muy alta"
    },
    {
        "nombre": "Tundra",
        "imagen": "static/tiles/Tundra.png",
        "entorno": "nevado",
        "clima": "frío",
        "dificultad": "alta"
    },
    {
        "nombre": "Ruinas",
        "imagen": "static/tiles/Ruinas.png",
        "entorno": "urbano abandonado",
        "clima": "templado",
        "dificultad": "media"
    }
]

def generar_bioma(nivel):
    """Genera un bioma aleatorio según el nivel"""
    if nivel % 10 == 0:
        # Cada 10 niveles, garantizamos un bioma nuevo
        bioma = random.choice(BIOMAS)
    else:
        # En otros niveles, se puede repetir
        bioma = random.choices(BIOMAS, weights=[2]*len(BIOMAS))[0]
    return bioma