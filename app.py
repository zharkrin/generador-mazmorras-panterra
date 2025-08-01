from flask import Flask, render_template
import random
import os

app = Flask(__name__)

@app.route("/")
def index():
    fondos_path = os.path.join(app.static_folder, "fondos")
    fondos = [f for f in os.listdir(fondos_path) if f.endswith(".png")]
    fondo = random.choice(fondos)
    return render_template("index.html", fondo=f"fondos/{fondo}")

if __name__ == "__main__":
    app.run(debug=True)