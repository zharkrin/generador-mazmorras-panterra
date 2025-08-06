// static/js/biomas.js
"use strict";

/**
 * Biomas module
 * - Carga estática de /static/biomas/biomes.json
 * - Expone funciones: init(), getPorId, getPorName, getTodos, buscarPorTexto, rutaImagen
 *
 * Requisitos:
 * - Colocar biomes.json en /static/biomas/biomes.json
 * - Si cargas desde Flask, usar <script src="{{ url_for('static', filename='js/biomas.js') }}"></script>
 *
 * Uso:
 *   await Biomas.init(); // carga JSON
 *   Biomas.getTodos();
 *   Biomas.getPorId(3);
 */

window.Biomas = (function () {
  const JSON_PATH = "/static/biomas/biomes.json"; // ruta al JSON
  let _data = null;
  let _byId = new Map();
  let _byNormalized = new Map();

  function normalizeKey(s) {
    if (!s) return "";
    return String(s).toLowerCase().normalize("NFKD").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  }

  async function init(path) {
    const p = path || JSON_PATH;
    try {
      const res = await fetch(p, {cache: "no-cache"});
      if (!res.ok) throw new Error("No se pudo cargar biomes.json: " + res.status);
      const json = await res.json();
      _data = Array.isArray(json) ? json : [];
      buildIndexes();
      return _data;
    } catch (err) {
      console.error("Biomas.init error:", err);
      _data = [];
      _byId = new Map();
      _byNormalized = new Map();
      throw err;
    }
  }

  function buildIndexes() {
    _byId = new Map();
    _byNormalized = new Map();
    _data.forEach(b => {
      if (typeof b.id !== "undefined") _byId.set(Number(b.id), b);
      const norm = normalizeKey(b.name || b.nombre || b.file || b.id);
      _byNormalized.set(norm, b);
      // also store alternative keys
      if (b.name) _byNormalized.set(normalizeKey(b.name), b);
      if (b.nombre) _byNormalized.set(normalizeKey(b.nombre), b);
      if (b.file) _byNormalized.set(normalizeKey(b.file.replace(/\.[^.]+$/, "")), b);
    });
  }

  function requireInit() {
    if (!_data) throw new Error("Biomas no inicializado. Llama a await Biomas.init()");
  }

  function getTodos() {
    requireInit();
    return _data.slice();
  }

  function getPorId(id) {
    requireInit();
    return _byId.get(Number(id)) || null;
  }

  function getPorNombre(name) {
    requireInit();
    if (!name) return null;
    const norm = normalizeKey(name);
    return _byNormalized.get(norm) || null;
  }

  function buscarPorTexto(q) {
    requireInit();
    if (!q) return [];
    const text = String(q).toLowerCase();
    return _data.filter(b => (b.name && b.name.toLowerCase().includes(text)) || (b.nombre && b.nombre.toLowerCase().includes(text)));
  }

  /**
   * Devuelve ruta de imagen para usar en el generador.
   * - defaultFolder: ruta base (por defecto static/Tiles/biomas/)
   * - si el bioma tiene campo `file`, lo usa.
   */
  function rutaImagen(bioma, options = {}) {
    requireInit();
    const base = options.base || "/static/Tiles/biomas/";
    let b = null;
    if (typeof bioma === "number") b = getPorId(bioma);
    else if (typeof bioma === "string") b = getPorNombre(bioma) || getPorId(Number(bioma));
    else if (typeof bioma === "object") b = bioma;
    if (!b) return null;
    if (b.file) return base + b.file;
    // fallback: construir nombre normalizado desde name
    const fallback = normalizeKey(b.name || b.nombre || ("bioma_" + b.id)) + ".png";
    return base + fallback;
  }

  // Export API
  const API = {
    init,           // async init([path])
    getTodos,
    getPorId,
    getPorNombre,
    buscarPorTexto,
    rutaImagen,
    _internal: { normalizeKey }
  };

  // CommonJS / Node export (si corresponde)
  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }

  return API;
})();