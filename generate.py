from flask import Flask, render_template, session, redirect, url_for
import random

app = Flask(__name__)
app.secret_key = "mazmorra-secreta"

BIOMAS = ["bosque", "caverna", "ruinas", "desierto", "tundra"]

BIOMA_ELEMENTOS = {
    "bosque": ["árboles", "río", "arbustos", "setas"],
    "caverna": ["estalactitas", "estalagmitas", "lagos subterráneos", "murciélagos"],
    "ruinas": ["columnas rotas", "escombros", "tumbas", "trampas antiguas"],
    "desierto": ["dunas", "rocas erosionadas", "cactus", "ruinas medio enterradas"],
    "tundra": ["hielo", "ventisca", "pinos congelados", "cuevas de hielo"]
}

@app.route("/")
def inicio():
    session["niveles"] = [random.choice(BIOMAS) for _ in range(100)]
    return redirect(url_for("mostrar_nivel", numero=0))

@app.route("/nivel/<int:numero>")
def mostrar_nivel(numero):
    niveles = session.get("niveles", [])
    if numero < 0 or numero >= len(niveles):
        return redirect(url_for("inicio"))

    bioma = niveles[numero]
    elementos = BIOMA_ELEMENTOS.get(bioma, [])

    return render_template("mazmorra.html",
                           numero=numero + 1,
                           total=len(niveles),
                           bioma=bioma,
                           elementos=elementos)

if __name__ == "__main__":
    app.run(debug=True)