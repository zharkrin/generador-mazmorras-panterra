import json
import random
import os

# Ruta base del proyecto (ajusta si estás en entorno distinto)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, '..', 'static', 'biomas')

# Ruta al archivo de biomas
BIOMAS_JSON_PATH = os.path.join(STATIC_DIR, 'biomas.json')

# Cargar biomas base
def cargar_biomas():
    try:
        with open(BIOMAS_JSON_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error al cargar biomas]: {e}")
        return {}

# Selección lógica de cruces entre biomas (esto se define en JS pero puedes replicarlo aquí si lo necesitas)
def generar_cruce(bioma1, bioma2):
    if bioma1 == bioma2:
        return bioma1
    if {'pantano', 'jungla'} <= {bioma1, bioma2}:
        return 'selva pantanosa'
    if {'volcán', 'mar'} <= {bioma1, bioma2}:
        return 'volcán submarino'
    if {'desierto', 'pantano'} <= {bioma1, bioma2}:
        return 'arenas movedizas'
    if {'caverna', 'jungla'} <= {bioma1, bioma2}:
        return 'caverna selvática'
    return f"{bioma1} - {bioma2}"

# Generador de niveles con biomas
def generar_mazmorra(niveles=10):
    biomas = cargar_biomas()
    nombres_biomas = list(biomas.keys())

    resultado = []

    for nivel in range(1, niveles + 1):
        entrada = {
            'nivel': nivel,
            'tipo': 'normal',
            'biomas': [],
            'especial': None
        }

        # Niveles de jefe
        if nivel % 10 == 0:
            entrada['tipo'] = 'jefe'
            entrada['especial'] = {
                'boss_room': True,
                'teleportal': True
            }
            entrada['biomas'] = [random.choice(nombres_biomas)]

        # Niveles de descanso narrativo
        elif nivel % 10 == 5:
            entrada['tipo'] = 'seguro'
            entrada['especial'] = {
                'campamento': True,
                'pnjs': True
            }
            entrada['biomas'] = [random.choice(nombres_biomas)]

        # Nivel normal
        else:
            b1 = random.choice(nombres_biomas)
            b2 = random.choice(nombres_biomas)
            if b1 == b2:
                entrada['biomas'] = [b1]
            else:
                entrada['biomas'] = [generar_cruce(b1, b2)]

        resultado.append(entrada)

    return resultado

# Guardar como archivo JSON
def guardar_mazmorra_json(mazmorra, archivo='mazmorra_generada.json'):
    try:
        with open(archivo, 'w', encoding='utf-8') as f:
            json.dump(mazmorra, f, ensure_ascii=False, indent=4)
        print(f"✅ Mazmorra guardada en {archivo}")
    except Exception as e:
        print(f"[Error al guardar mazmorra]: {e}")

# Para pruebas directas
if __name__ == '__main__':
    mazmorra = generar_mazmorra(30)
    guardar_mazmorra_json(mazmorra)