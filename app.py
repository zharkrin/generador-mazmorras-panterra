from flask import Flask, render_template, request, session, redirect, url_for
import random
import os

app = Flask(__name__)
app.secret_key = "panterra-secret"

FONDOS_PATH = os.path.join("static", "fondos")

@app.route("/", methods=["GET", "POST"])
def index():
    if "nivel" not in session:
        session["nivel"] = 1
    if "semilla" not in session:
        session["semilla"] = random.randint(1, 999999)

    if request.method == "POST":
        if "subir" in request.form:
            session["nivel"] += 1
        elif "bajar" in request.form and session["nivel"] > 1:
            session["nivel"] -= 1

    nivel = session["nivel"]
    semilla = session["semilla"]

    # Fondos
    fondos = [f for f in os.listdir(FONDOS_PATH) if f.endswith(".png")]
    random.seed(semilla + nivel)
    fondo = random.choice(fondos)

    # Salas generadas
    mapa_svg = generar_salas_svg(nivel, semilla)

    return render_template("index.html", fondo=f"fondos/{fondo}", nivel=nivel, mapa_svg=mapa_svg)

@app.route("/reiniciar")
def reiniciar():
    session.clear()
    return redirect(url_for("index"))


def generar_salas_svg(nivel, semilla, ancho=1200, alto=800):
    random.seed(semilla + nivel)

    num_salas = random.randint(6, 12)
    salas = []

    for _ in range(num_salas):
        w = random.randint(60, 150)
        h = random.randint(60, 150)
        x = random.randint(50, ancho - w - 50)
        y = random.randint(50, alto - h - 50)
        salas.append((x, y, w, h))

    # Conexiones simples (solo entre salas contiguas)
    conexiones = []
    for i in range(len(salas) - 1):
        x1, y1, w1, h1 = salas[i]
        x2, y2, w2, h2 = salas[i + 1]
        cx1 = x1 + w1 // 2
        cy1 = y1 + h1 // 2
        cx2 = x2 + w2 // 2
        cy2 = y2 + h2 // 2
        conexiones.append((cx1, cy1, cx2, cy2))

    # SVG resultante
    svg = f'<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg" style="background-color:#111;">'

    # Salas
    for x, y, w, h in salas:
        svg += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#444" stroke="#0f0" stroke-width="2"/>'

    # Conexiones
    for x1, y1, x2, y2 in conexiones:
        svg += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#0ff" stroke-width="2"/>'

    svg += '</svg>'
    return svg

if __name__ == "__main__":
    app.run(debug=True)