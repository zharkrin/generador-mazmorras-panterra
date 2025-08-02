from flask import Flask, render_template, redirect, url_for, session
import random

app = Flask(__name__)
app.secret_key = "clave-secreta-muy-segura"

# Lista de biomas disponibles (asegúrate de tener la imagen en /static/fondos/)
BIOMAS = ["bosque", "caverna", "ruinas", "desierto", "tundra"]

@app.route("/")
def inicio():
    total_niveles = 10  # Puedes cambiar esto a 20, 50, 100, etc.

    # Genera una lista de biomas aleatorios si aún no existe en la sesión
    if "niveles" not in session:
        session["niveles"] = [random.choice(BIOMAS) for _ in range(total_niveles)]
        session["nivel_actual"] = 0

    return redirect(url_for("mostrar_nivel", numero=session["nivel_actual"]))

@app.route("/nivel/<int:numero>")
def mostrar_nivel(numero):
    niveles = session.get("niveles", [])
    if 0 <= numero < len(niveles):
        session["nivel_actual"] = numero
        bioma = niveles[numero]
        return render_template("mazmorra.html",
                               numero=numero + 1,
                               total=len(niveles),
                               bioma=bioma)
    else:
        return redirect(url_for("inicio"))

@app.route("/anterior")
def anterior_nivel():
    actual = session.get("nivel_actual", 0)
    return redirect(url_for("mostrar_nivel", numero=max(actual - 1, 0)))

@app.route("/siguiente")
def siguiente_nivel():
    actual = session.get("nivel_actual", 0)
    niveles = session.get("niveles", [])
    return redirect(url_for("mostrar_nivel", numero=min(actual + 1, len(niveles) - 1)))

@app.route("/reiniciar")
def reiniciar():
    session.clear()
    return redirect(url_for("inicio"))

if __name__ == "__main__":
    app.run(debug=True)