from flask import Flask, render_template
from generator.mazmorra import generar_mazmorra

app = Flask(__name__)

@app.route("/")
def index():
    mazmorra = generar_mazmorra()
    return render_template("index.html", mazmorra=mazmorra)

if __name__ == "__main__":
    app.run(debug=True)
