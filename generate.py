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
    session["jefes_derrotados"] = []
    return redirect(url_for("mostrar_nivel", numero=0))

@app.route("/nivel/<int:numero>")
def mostrar_nivel(numero):
    niveles = session.get("niveles", [])
    jefes_derrotados = session.get("jefes_derrotados", [])

    if numero < 0 or numero >= len(niveles):
        return redirect(url_for("inicio"))

    bioma = niveles[numero]
    elementos = BIOMA_ELEMENTOS.get(bioma, [])

    es_jefe = ((numero + 1) % 10 == 0)
    jefe_derrotado = (numero in jefes_derrotados)

    mostrar_circulo = (numero + 1) % 10 == 1 and (numero - 1) in jefes_derrotados

    return render_template("mazmorra.html",
                           numero=numero + 1,
                           total=len(niveles),
                           bioma=bioma,
                           elementos=elementos,
                           es_jefe=es_jefe,
                           jefe_derrotado=jefe_derrotado,
                           mostrar_circulo=mostrar_circulo)

@app.route("/derrotar-jefe/<int:nivel>")
def derrotar_jefe(nivel):
    jefes_derrotados = session.get("jefes_derrotados", [])
    if nivel not in jefes_derrotados:
        jefes_derrotados.append(nivel)
        session["jefes_derrotados"] = jefes_derrotados
    return redirect(url_for("mostrar_nivel", numero=nivel))

if __name__ == "__main__":
    app.run(debug=True)