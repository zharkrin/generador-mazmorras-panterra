from flask import Flask, render_template, jsonify
from mazmorra import generar_mapa

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/datos")
def datos():
    mapa = generar_mapa()
    return jsonify(mapa)

if __name__ == "__main__":
    app.run(debug=True)