from flask import Flask, jsonify, render_template, send_from_directory
import os
import random
import json

app = Flask(__name__)

# Ruta a los niveles de mazmorra generados
MAPAS_DIR = "niveles"

# Biomas disponibles (asegúrate de que existen como imagen en static/Tiles/)
BIOMAS = [
    "Bosque", "Caverna", "Desierto", "Ruinas", "Volcán",
    "Mar", "Pantano", "Hielo", "Cristal", "Abismo"
]

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/api/nivel/<int:nivel>')
def obtener_nivel(nivel):
    tiles = cargar_mapa(nivel)
    bioma = obtener_bioma(nivel)
    return jsonify({
        "nivel": nivel,
        "bioma": bioma,
        "tiles": tiles
    })

def obtener_bioma(nivel):
    # Repetimos los biomas cíclicamente según el número de nivel
    return BIOMAS[(nivel - 1) % len(BIOMAS)]

def cargar_mapa(nivel):
    ruta = os.path.join(MAPAS_DIR, f"nivel_{nivel}.json")
    if not os.path.exists(ruta):
        return []  # Nivel vacío

    with open(ruta, "r", encoding="utf-8") as archivo:
        datos = json.load(archivo)

    bioma = obtener_bioma(nivel)
    imagen = f"/static/Tiles/{bioma}.png"

    resultado = []
    for fila in datos:
        fila_convertida = []
        for tile in fila:
            fila_convertida.append({
                "x": tile["x"],
                "y": tile["y"],
                "imagen": imagen
            })
        resultado.append(fila_convertida)

    return resultado

@app.route('/static/<path:filename>')
def servir_static(filename):
    return send_from_directory("static", filename)

# Ejecutar servidor
if __name__ == '__main__':
    app.run(debug=True)