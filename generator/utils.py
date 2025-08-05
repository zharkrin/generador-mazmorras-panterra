import random

def generar_bioma(nivel):
    biomas = [
        "bosque", "desierto", "pantano", "montaña", "llanura",
        "volcán", "caverna", "marino", "cristalino", "etéreo"
    ]
    return random.choice(biomas)

def generar_jefe(nivel):
    return {
        "tipo": "jefe",
        "nivel": nivel,
        "nombre": f"Jefe del Nivel {nivel}",
        "descripcion": "Un poderoso enemigo bloquea el avance. Solo los fuertes sobrevivirán.",
        "poder": random.randint(5 * nivel, 10 * nivel)
    }

def generar_campamento(nivel):
    return {
        "tipo": "campamento",
        "nivel": nivel + 0.5,
        "nombre": f"Campamento de Nivel {nivel + 0.5}",
        "descripcion": "Una zona segura entre peligros. Puedes descansar, comerciar y reorganizar al grupo.",
        "servicios": ["descanso", "comercio", "curación"]
    }
