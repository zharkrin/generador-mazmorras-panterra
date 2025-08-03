from flask import Flask, render_template, jsonify, request
import os
import json

app = Flask(__name__)

NIVELES_DIR = 'niveles'

@app.route('/')
def index():
    niveles = sorted([f for f in os.listdir(NIVELES_DIR) if f.endswith('.json')])
    if niveles:
        nivel_actual = niveles[0]
    else:
        nivel_actual = None
    return render_template('index.html', nivel=nivel_actual)

@app.route('/nivel/<nombre>')
def cargar_nivel(nombre):
    ruta = os.path.join(NIVELES_DIR, nombre)
    if os.path.exists(ruta):
        with open(ruta, 'r') as archivo:
            datos = json.load(archivo)
        return jsonify(datos)
    return jsonify({"error": "Nivel no encontrado"}), 404

@app.route('/niveles')
def listar_niveles():
    niveles = sorted([f for f in os.listdir(NIVELES_DIR) if f.endswith('.json')])
    return jsonify(niveles)

@app.route('/guardar', methods=['POST'])
def guardar():
    datos = request.json
    nombre = datos.get('nombre')
    contenido = datos.get('contenido')
    if not nombre or not contenido:
        return jsonify({"error": "Faltan datos"}), 400
    with open(os.path.join(NIVELES_DIR, nombre), 'w') as archivo:
        json.dump(contenido, archivo, indent=2)
    return jsonify({"mensaje": "Guardado con éxito"})