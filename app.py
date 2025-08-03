from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# Biomas disponibles (asegúrate de tener los archivos en static/Tiles/)
BIOMAS = ["bosque", "desierto", "cueva"]

# Ruta base a los tiles
TILE_PATH = {
    "bosque": "/static/Tiles/Bosque.png",
    "desierto": "/static/Tiles/Desierto.png",
    "cueva": "/static/Tiles/Cueva.png"
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/nivel/<int:nivel>")
def generar_nivel(nivel):
    """ Devuelve un JSON con el mapa de biomas para un nivel """
    filas = 10
    columnas = 10
    mapa = []

    for y in range(filas):
        fila = []
        for x in range(columnas):
            bioma = random.choice(BIOMAS)
            fila.append({
                "x": x,
                "y": y,
                "bioma": bioma,
                "imagen": TILE_PATH[bioma]
            })
        mapa.append(fila)

    return jsonify({
        "nivel": nivel,
        "filas": filas,
        "columnas": columnas,
        "tiles": mapa
    })

if __name__ == "__main__":
    app.run(debug=True)