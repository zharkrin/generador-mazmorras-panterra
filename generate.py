from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/generar")
def generar():
    from generador import generar_mazmorra, generar_svg
    nivel = int(request.args.get("nivel", 1))
    datos = generar_mazmorra(nivel)
    return jsonify({
        "json": datos,
        "svg": generar_svg(datos)
    })

@app.route("/cargar", methods=["POST"])
def cargar():
    archivo = request.files.get("archivo")
    if not archivo:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    try:
        contenido = json.load(archivo)
        from generador import generar_svg
        svg = generar_svg(contenido)
        return jsonify({
            "json": contenido,
            "svg": svg
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
