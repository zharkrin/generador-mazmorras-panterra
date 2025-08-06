// static/js/biomas_cruces.js
"use strict";

/**
 * BiomasCruces (adaptado a biomes.json)
 *
 * Requisitos previos:
 *  - window.Biomas debe estar disponible e inicializado con await Biomas.init()
 *
 * Rutas esperadas:
 *  - /static/biomas/biomes.json
 *
 * Funcionalidad adicional:
 *  - Reconoce aliases definidos en biomes.json (campo "aliases": ["Pantano","wetland",...])
 *  - Construye índices normalizados desde Biomas.getTodos()
 *  - Proporciona listarCrucesPosibles() que devuelve la lista completa de cruces plausibles
 *
 * Uso mínimo:
 *   await Biomas.init();
 *   await BiomasCruces.init();
 *   const lista = BiomasCruces.listarCrucesPosibles();
 */

window.BiomasCruces = (function () {
  // --- Configurables ---
  const DEFAULT_MIN_SCORE = 0.2;   // score mínimo para considerar compatible
  const LISTA_TOP_DEFAULT = 6;     // para sugerirCruces

  // Reglas personalizadas (puedes registrar más con registerRule)
  const rules = [];

  // Mapeos internos
  let _byKey = new Map();        // key normalized -> bioma object
  let _byId = new Map();         // id -> bioma object
  let _allBiomas = [];           // array de biomas (del JSON)
  let _categoryMap = {};         // key -> [categorias...]

  // Efectos por tipo de cruce
  const EFFECTS = {
    "transition": { movement: 0.9, visibility: 0.95, hazard: 0.0, resource: 1.0 },
    "mixture":    { movement: 0.75, visibility: 0.8,  hazard: 0.05, resource: 1.15 },
    "extreme":    { movement: 0.5,  visibility: 0.6,  hazard: 0.2,  resource: 1.5 }
  };

  // Heurísticas de nombre por coincidencia de claves normalizadas
  const NAME_HEURISTICS = [
    { a: "wetland", b: "temperatedeciduousforest", name: "Bosque pantanoso", type: "mixture" },
    { a: "wetland", b: "tropicalrainforest", name: "Pantano tropical", type: "mixture" },
    { a: "marine", b: "hotdesert", name: "Costa con dunas", type: "transition" },
    { a: "marine", b: "glacier", name: "Fiordo helado", type: "extreme" },
    { a: "hotdesert", b: "glacier", name: null, type: "extreme" } // raro, se filtrará por compatibilidad
  ];

  // ----------------- utilidades -----------------
  function normalize(s) {
    if (!s && s !== 0) return "";
    return String(s).toLowerCase().normalize("NFKD").replace(/\s+/g, "").replace(/[^a-z0-9áéíóúñ]/g, "");
  }

  function safeGetName(b) {
    if (!b) return "";
    return b.nombre || b.name || ("bioma_" + (b.id || ""));
  }

  // ----------------- inicialización -----------------
  function buildIndexes(biomasArray) {
    _byKey = new Map();
    _byId = new Map();
    _allBiomas = Array.isArray(biomasArray) ? biomasArray : [];

    for (const b of _allBiomas) {
      const id = (typeof b.id !== "undefined") ? Number(b.id) : null;
      const nameMain = normalize(b.name || b.nombre || b.file || id || "");
      if (nameMain) _byKey.set(nameMain, b);
      if (id !== null) _byId.set(id, b);

      // aliases: cada entrada puede tener campo "aliases": ["Pantano","wetland"]
      if (Array.isArray(b.aliases)) {
        for (const a of b.aliases) {
          const k = normalize(a);
          if (k) _byKey.set(k, b);
        }
      }

      // registrar variantes obvias
      if (b.name) _byKey.set(normalize(b.name), b);
      if (b.nombre) _byKey.set(normalize(b.nombre), b);
      if (b.file) _byKey.set(normalize(b.file.replace(/\.[^.]+$/, "")), b);
    }

    // construir mapa de categorías si el JSON las incluye; si no, intentar inferir mínimamente
    _categoryMap = {};
    for (const b of _allBiomas) {
      const key = normalize(b.name || b.nombre || b.file || b.id);
      const cats = Array.isArray(b.categories) ? b.categories.slice() : inferCategoriesFromName(b);
      _categoryMap[key] = cats;
    }
  }

  // Inferir categorías simples a partir del nombre (fallback)
  function inferCategoriesFromName(b) {
    const n = normalize(b.name || b.nombre || b.file || "");
    const cats = [];
    if (!n) return cats;
    if (n.includes("marine") || n.includes("sea") || n.includes("ocean")) cats.push("costero","acuatico");
    if (n.includes("desert")) cats.push("calido","seco");
    if (n.includes("tropical") || n.includes("rainforest") || n.includes("selva")) cats.push("calido","muy-humedo");
    if (n.includes("forest") || n.includes("bosque")) cats.push("templado","humedo");
    if (n.includes("taiga") || n.includes("conifer")) cats.push("frio","coniferas");
    if (n.includes("tundra") || n.includes("glacier")) cats.push("frio-extremo","helado");
    if (n.includes("wet") || n.includes("pantano") || n.includes("swamp")) cats.push("humedo","estancado");
    if (n.includes("savanna") || n.includes("grass")) cats.push("calido","semi-seco");
    return cats;
  }

  // ----------------- compatibilidad -----------------
  function intersect(a,b) {
    const s = new Set(b || []);
    return (a || []).filter(x => s.has(x));
  }

  function baseCompatibilityScore(keyA, keyB) {
    const catA = _categoryMap[keyA] || [];
    const catB = _categoryMap[keyB] || [];
    if (intersect(catA, catB).length > 0) return 0.9;
    // reglas complementarias básicas
    const complementary = (catA.includes("costero") && catB.includes("calido")) ||
                          (catB.includes("costero") && catA.includes("calido")) ||
                          (catA.includes("muy-humedo") && catB.includes("humedo")) ||
                          (catB.includes("muy-humedo") && catA.includes("humedo"));
    if (complementary) return 0.7;
    // extremo vs caliente -> conflictivo
    if ((catA.includes("frio-extremo") && catB.includes("calido")) ||
        (catB.includes("frio-extremo") && catA.includes("calido"))) return 0.05;
    return 0.4;
  }

  // Exponer compatibilidad con scoring
  function isCompatible(a, b) {
    const aKey = resolveKeyFromInput(a);
    const bKey = resolveKeyFromInput(b);
    if (!aKey || !bKey) return { compatible: false, score: 0, reason: "bioma desconocido" };
    if (aKey === bKey) return { compatible: true, score: 1, reason: "mismo bioma" };

    // reglas personalizadas:
    for (const r of rules) {
      try {
        const rr = r(aKey, bKey);
        if (rr && typeof rr.allow !== "undefined") {
          return { compatible: !!rr.allow, score: rr.allow ? 0.95 : 0.01, reason: "regla personalizada" };
        }
      } catch (e) { console.warn("rule error", e); }
    }

    const score = baseCompatibilityScore(aKey, bKey);
    return { compatible: score >= DEFAULT_MIN_SCORE, score, reason: "evaluado" };
  }

  // Resolver cualquier entrada (id, nombre, objeto) a la key normalizada usada internamente
  function resolveKeyFromInput(x) {
    if (x === null || typeof x === "undefined") return null;
    // si es número: buscar por ID
    if (typeof x === "number") {
      const b = _byId.get(Number(x));
      if (!b) return null;
      return normalize(b.name || b.nombre || b.file || b.id);
    }
    if (typeof x === "string") {
      const k = normalize(x);
      if (_byKey.has(k)) return k; // alias o normalizado directo
      // intentar buscar por nombre completo en Biomas
      const found = window.Biomas ? window.Biomas.getPorNombre(x) : null;
      if (found) return normalize(found.name || found.nombre || found.file || found.id);
      // fallback: devolver normalized input
      return k;
    }
    if (typeof x === "object") {
      if (typeof x.id !== "undefined") {
        const b = _byId.get(Number(x.id));
        if (b) return normalize(b.name || b.nombre || b.file || b.id);
      }
      return normalize(x.name || x.nombre || x.file || x.id || "");
    }
    return null;
  }

  // ----------------- generar cruce -----------------
  function generarCruce(a, b, opts = {}) {
    const aKey = resolveKeyFromInput(a);
    const bKey = resolveKeyFromInput(b);
    if (!aKey || !bKey) return null;
    if (aKey === bKey) {
      // misma base -> transición ligera
      const pretty = safeGetName(_byKey.get(aKey) || _byId.get(aKey));
      return { baseA: aKey, baseB: bKey, nombre: pretty, type: "transition", modifiers: EFFECTS.transition, description: "Transición interna" };
    }

    // aplicar reglas personalizadas primero
    for (const r of rules) {
      try {
        const rr = r(aKey, bKey);
        if (rr && typeof rr.allow !== "undefined") {
          if (!rr.allow) return null;
          return { baseA: aKey, baseB: bKey, nombre: rr.name || `${aKey}-${bKey}`, type: rr.type || "mixture",
                   modifiers: rr.effects || EFFECTS[rr.type] || EFFECTS.mixture, description: rr.desc || "Cruce personalizado" };
        }
      } catch (e) { console.warn("rule error", e); }
    }

    // heurísticas (nombres más humanos)
    for (const h of NAME_HEURISTICS) {
      try {
        if ((aKey.includes(h.a) && bKey.includes(h.b)) || (aKey.includes(h.b) && bKey.includes(h.a))) {
          const comp = isCompatible(aKey, bKey);
          if (!comp.compatible) return null;
          const name = h.name || `${safeGetName(_byKey.get(aKey))} / ${safeGetName(_byKey.get(bKey))}`;
          return { baseA: aKey, baseB: bKey, nombre: name, type: h.type || "mixture", modifiers: EFFECTS[h.type] || EFFECTS.mixture, description: "Cruce heurístico" };
        }
      } catch (e) {}
    }

    // compatibilidad básica
    const comp = isCompatible(aKey, bKey);
    if (!comp.compatible) return null;

    const prettyA = safeGetName(_byKey.get(aKey)) || aKey;
    const prettyB = safeGetName(_byKey.get(bKey)) || bKey;
    const type = comp.score > 0.8 ? "mixture" : (comp.score > 0.5 ? "transition" : "mixture");
    const nombre = `${prettyA} / ${prettyB}`;
    return { baseA: aKey, baseB: bKey, nombre, type, modifiers: EFFECTS[type] || EFFECTS.mixture, description: `Cruce generado (score ${comp.score.toFixed(2)})` };
  }

  // ----------------- sugerencias y listado completo -----------------
  function sugerirCruces(bioma, opts = {}) {
    const topN = opts.topN || LISTA_TOP_DEFAULT;
    const minScore = (typeof opts.minScore === "number") ? opts.minScore : 0.25;
    const key = resolveKeyFromInput(bioma);
    if (!key) return [];
    const results = [];
    for (const other of _allBiomas) {
      const otherKey = normalize(other.name || other.nombre || other.file || other.id);
      if (!otherKey || otherKey === key) continue;
      const comp = isCompatible(key, otherKey);
      if (comp.score >= minScore) {
        results.push({ other: other, score: comp.score });
      }
    }
    results.sort((a,b) => b.score - a.score);
    return results.slice(0, topN);
  }

  /**
   * Devuelve LISTA COMPLETA de cruces plausibles entre todos los biomas.
   * Opciones:
   *  - minScore: filtrar por score mínimo (0..1)
   *  - onlyNames: true => devuelve [{ aName, bName, score, suggestedName, type }] (más compacto)
   */
  function listarCrucesPosibles(opts = {}) {
    const minScore = (typeof opts.minScore === "number") ? opts.minScore : 0.25;
    const onlyNames = !!opts.onlyNames;
    const out = [];
    const n = _allBiomas.length;
    // recorrer pares (i<j) para no duplicar
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const A = _allBiomas[i], B = _allBiomas[j];
        const keyA = normalize(A.name || A.nombre || A.file || A.id);
        const keyB = normalize(B.name || B.nombre || B.file || B.id);
        const comp = isCompatible(keyA, keyB);
        if (!comp.compatible || comp.score < minScore) continue;
        const generated = generarCruce(keyA, keyB);
        const entry = {
          aId: A.id, aName: A.nombre || A.name, aKey: keyA,
          bId: B.id, bName: B.nombre || B.name, bKey: keyB,
          score: comp.score,
          suggestedName: generated ? generated.nombre : `${A.nombre || A.name} / ${B.nombre || B.name}`,
          type: generated ? generated.type : "mixture",
          modifiers: generated ? generated.modifiers : EFFECTS.mixture,
          description: generated ? generated.description : "Cruce genérico"
        };
        if (onlyNames) {
          out.push({ aName: entry.aName, bName: entry.bName, score: entry.score, suggestedName: entry.suggestedName, type: entry.type });
        } else {
          out.push(entry);
        }
      }
    }
    // ordenar por score descendente
    out.sort((x,y) => y.score - x.score);
    return out;
  }

  // ----------------- registrar regla personalizada -----------------
  function registerRule(fn) {
    if (typeof fn === "function") rules.push(fn);
  }

  // ----------------- init público -----------------
  async function init() {
    if (!window.Biomas) throw new Error("Biomas no está disponible. Llama a await Biomas.init() antes.");
    // cargar lista desde Biomas
    _allBiomas = window.Biomas.getTodos();
    buildIndexes(_allBiomas);
    return true;
  }

  // ----------------- export API -----------------
  const API = {
    init,
    isCompatible,
    generarCruce,
    sugerirCruces,
    listarCrucesPosibles,
    registerRule,
    _internal: { EFFECTS, NAME_HEURISTICS, _categoryMap: () => _categoryMap }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  return API;
})();