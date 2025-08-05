from flask import Flask, render_template, send_from_directory, jsonify
import os
import json

app = Flask(__name__, static_folder="static", template_folder="templates")

# Rutas básicas
@app.route('/')
def index():
    # Puedes pasar un nivel por defecto o listar niveles reales
    return render_template("index.html", nivel="nivel-1")

@app.route('/niveles/<path:filename>')
def niveles_static(filename):
    # sirve archivos json de niveles si los quieres desde /niveles/...
    return send_from_directory('niveles', filename)

# Endpoint opcional para listar niveles (json)
@app.route('/api/niveles')
def api_niveles():
    if not os.path.exists('niveles'):
        return jsonify([])
    files = sorted([f for f in os.listdir('niveles') if f.endswith('.json')])
    return jsonify(files)

if __name__ == '__main__':
    app.run(debug=True)