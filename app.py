from flask import Flask, render_template, request, session, redirect, url_for
import random
import os

app = Flask(__name__)
app.secret_key = "panterra-secret"  # Puedes cambiarlo

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

    fondos = [f for f in os.listdir(FONDOS_PATH) if f.endswith(".png")]
    random.seed(semilla + nivel)  # Semilla + nivel para generar un fondo estable por nivel
    fondo = random.choice(fondos)

    return render_template("index.html", fondo=f"fondos/{fondo}", nivel=nivel)

@app.route("/reiniciar")
def reiniciar():
    session.clear()
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)