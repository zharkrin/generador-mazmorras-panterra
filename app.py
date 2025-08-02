import os
import random
import json
from flask import Flask, render_template, send_file, request, jsonify
from flask_cors import CORS
from io import BytesIO
import svgwrite

app = Flask(__name__)
CORS(app)

def generar_salas_svg(ancho=1400, alto=1000, nivel=1):
    salas = []

    tipos = ["normal", "cofre", "trampa", "enemigos", "especial", "bloqueada"]

    for _ in range(random.randint(10, 20)):
        tipo = random.choice(tipos)
        sala = {
            "x": random.randint(50, ancho - 150),
            "y": random.randint(50, alto - 150),
            "w": random.randint(60, 110),
            "h": random.randint(60, 110),
            "tipo": tipo
        }

        if tipo == "cofre":
            sala["rareza"] = random.choices(
                ["Normal", "Infrecuente", "Raro", "Épico", "Legendario", "Único", "Mítico"],
                weights=[30, 25, 20, 10, 7, 5, 3]
            )[0]
            sala["oro"] = random.randint(20, 200)
            sala["objeto"] = random.choice(["Espada", "Poción", "Anillo", "Pergamino", "Armadura"])

        elif tipo == "trampa":
            sala["trampa"] = random.choice(["Flechas", "Pozo", "Gas", "Magia"])
            sala["daño"] = random.randint(5, 30)
            sala["detección"] = random.randint(10, 20)

        elif tipo == "enemigos":
            sala["cantidad"] = random.randint(2, 6)
            sala["enemigo"] = random.choice(["Goblin", "No-muerto", "Bestia", "Elemental"])
            sala["rareza"] = random.choice(["Normal", "Raro", "Élite"])

        elif tipo == "especial":
            sala["evento"] = random.choice(["Altar", "Portal", "Puzzle", "NPC", "Ruinas"])

        elif tipo == "bloqueada":
            sala["llave"] = f"LL-{random.randint(100,999)}"

        salas.append(sala)

    # Sala final (jefe o especial)
    tipo_final = random.choice(["jefe", "especial"])
    jefe = {
        "x": random.randint(50, ancho - 150),
        "y": random.randint(50, alto - 150),
        "w": random.randint(80, 130),
        "h": random.randint(80, 130),
        "tipo": tipo_final
    }

    if tipo_final == "jefe":
        jefe["nombre"] = random.choice(["Hidra", "Señor Espectral", "Gólem Ancestral", "Archimago Oscuro"])
        jefe["nivel"] = nivel
        jefe["loot"] = random.choice(["Legendario", "Épico", "Único"])
    elif tipo_final == "especial":
        jefe["evento"] = random.choice(["Altar", "Portal", "Puzzle", "NPC", "Ruinas"])

    salas.append(jefe)
    return salas

def generar_svg(salas, ancho=1400, alto=1000):
    dwg = svgwrite.Drawing(size=(ancho, alto))
    for sala in salas:
        color = {
            "normal": "#cccccc",
            "cofre": "#ffd700",
            "trampa": "#ff4444",
            "enemigos": "#aa00ff",
            "especial": "#00ffff",
            "bloqueada": "#4444ff",
            "jefe": "#ff8800"
        }.get(sala["tipo"], "#999999")

        dwg.add(dwg.rect(
            insert=(sala["x"], sala["y"]),
            size=(sala["w"], sala["h"]),
            fill=color,
            stroke="#000",
            stroke_width=2
        ))

    return dwg.tostring()

@app.route('/generar', methods=['GET'])
def generar():
    nivel = int(request.args.get("nivel", 1))
    ancho = int(request.args.get("ancho", 1400))
    alto = int(request.args.get("alto", 1000))

    salas = generar_salas_svg(ancho=ancho, alto=alto, nivel=nivel)
    svg_data = generar_svg(salas, ancho=ancho, alto=alto)

    return jsonify({
        "svg": svg_data,
        "json": salas
    })

if __name__ == '__main__':
    app.run(debug=True)