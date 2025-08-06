// static/js/biomas_cruces.js
"use strict";

/**
 * BiomasCruces - Lógica para combinar biomas de forma coherente.
 *
 * - Depende de window.Biomas (inicializado previamente).
 * - Expone: init(), isCompatible(a,b), generarCruce(a,b,opts), sugerirCruces(a,opts), registerRule(fn)
 *
 * Ejemplo: await Biomas.init(); BiomasCruces.init(); BiomasCruces.generarCruce("Pantano","Bosque");
 */

window.BiomasCruces = (function () {
  const DEFAULT_MIN_SCORE = 0.2;
  const rules = []; // reglas personalizadas: fn(aKey,bKey) => {allow:boolean,name?,type?,effects?,desc?} | null

  // Categories mapping; usa claves normalizadas (igual que Biomas._internal.normalizeKey)
  const CATEGORIES = {
    "marine": ["costero","acuatico"],
    "hotdesert": ["calido","seco"],
    "colddesert": ["frio","seco"],
    "savanna": ["calido","semi-seco"],
    "grassland": ["templado","semi-seco"],
    "tropicalseasonalforest": ["calido","humedo","estacional"],
    "temperatedeciduousforest": ["templado","humedo"],
    "tropicalrainforest": ["calido","muy-humedo"],
    "temperaterainforest": ["templado","muy-humedo"],
    "taiga": ["frio","coniferas"],
    "tundra": ["frio-extremo"],
    "glacier": ["frio-extremo","helado"],
    "wetland": ["humedo","estancado"]
  };

  // efectos por tipo de cruce
  const EFFECTS = {
    "transition": { movement: 0.9, visibility: 0.95, hazard: 0.0, resource: 1.0 },
    "mixture":    { movement: 0.75, visibility: 0.8,  hazard: 0.05, resource: 1.15 },
    "extreme":    { movement: 0.5,  visibility: 0.6,  hazard: 0.2,  resource: 1.5 }
  };

  function normalize(name) {
    if (!name) return "";
    return String(name).toLowerCase().normalize("NFKD").replace(/\s+/g, "").replace(/[^a-z0-9áéíóúñ]/g, "");
  }

  function getCategoryKeys() {
    return Object.keys(CATEGORIES);
  }

  function resolveKeyFromBioma(bioma) {
    if (!bioma) return null;
    // bioma puede ser id, nombre, objeto
    if (typeof bioma === "number") {
      const b = window.Biomas.getPorId(bioma);
      if (!b) return null;
      return normalize(b.name || b.nombre || b.file || b.id);
    }
    if (typeof bioma === "string") {
      const found = window.Biomas.getPorNombre(bioma);
      if (found) return normalize(found.name || found.nombre || found.file || found.id);
      return normalize(bioma);
    }
    if (typeof bioma === "object") {
      if (bioma.id) {
        const b = window.Biomas.getPorId(bioma.id);
        if (b) return normalize(b.name || b.nombre);
      }
      return normalize(bioma.name || bioma.nombre || bioma.file || bioma.id);
    }
    return null;
  }

  function intersect(a,b) {
    const set = new Set(b);
    return a.filter(x => set.has(x));
  }

  function baseCompatibilityScore(keyA, keyB) {
    const catA = CATEGORIES[keyA] || [];
    const catB = CATEGORIES[keyB] || [];
    if (intersect(catA, catB).length > 0) return 0.9; // comparten etiquetas
    // complementarios sencillos
    const complementary = (catA.includes("costero") && catB.includes("calido")) ||
                          (catB.includes("costero") && catA.includes("calido")) ||
                          (catA.includes("muy-humedo") && catB.includes("humedo")) ||
                          (catB.includes("muy-humedo") && catA.includes("humedo"));
    if (complementary) return 0.7;
    // conflicto extremo
    if ((catA.includes("frio-extremo") && catB.includes("calido")) ||
        (catB.includes("frio-extremo") && catA.includes("calido"))) return 0.05;
    return 0.4;
  }

  function isCompatible(a, b) {
    if (!window.Biomas) throw new Error("Biomas no inicializado");
    const aKey = resolveKeyFromBioma(a);
    const bKey = resolveKeyFromBioma(b);
    if (!aKey || !bKey) return { compatible: false, score: 0, reason: "bioma desconocido" };
    if (aKey === bKey) return { compatible: true, score: 1, reason: "mismo bioma" };

    // reglas personalizadas
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

  function generarCruce(a, b, opts = {}) {
    if (!window.Biomas) throw new Error("Biomas no inicializado");
    const aKey = resolveKeyFromBioma(a);
    const bKey = resolveKeyFromBioma(b);
    if (!aKey || !bKey) return null;
    if (aKey === bKey) {
      return {
        baseA: aKey, baseB: bKey,
        nombre: (window.Biomas.getPorNombre && window.Biomas.getPorNombre(a)) ? (window.Biomas.getPorNombre(a).nombre || window.Biomas.getPorNombre(a).name) : aKey,
        type: "transition", modifiers: EFFECTS.transition,
        description: "Zona de transición dentro del mismo bioma."
      };
    }

    // reglas personalizadas (permitir/prohibir)
    for (const r of rules) {
      try {
        const rr = r(aKey, bKey);
        if (rr && typeof rr.allow !== "undefined") {
          if (!rr.allow) return null;
          return {
            baseA: aKey, baseB: bKey, nombre: rr.name || `${aKey}-${bKey}`, type: rr.type || "mixture",
            modifiers: rr.effects || EFFECTS[rr.type] || EFFECTS.mixture,
            description: rr.desc || "Cruce personalizado"
          };
        }
      } catch (e) { console.warn("rule error", e); }
    }

    // heurísticas sencillas (puedes ampliar)
    const heuristics = [
      { match: (x,y) => x.includes("wetland") && y.includes("temperatedeciduousforest"), name: "Bosque pantanoso", type: "mixture" },
      { match: (x,y) => x.includes("wetland") && y.includes("tropicalrainforest"), name: "Pantano tropical", type: "mixture" },
      { match: (x,y) => x.includes("hotdesert") && y.includes("glacier"), name: null, type: "extreme" }, // raro, se rechazará por compatibilidad
      { match: (x,y) => x.includes("marine") && y.includes("hotdesert"), name: "Costa con dunas", type: "transition" },
      { match: (x,y) => x.includes("marine") && y.includes("glacier"), name: "Fiordo helado", type: "extreme" }
    ];
    for (const h of heuristics) {
      try {
        if (h.match(aKey, bKey) || h.match(bKey, aKey)) {
          // comprobar compatibilidad básica
          const comp = isCompatible(aKey, bKey);
          if (!comp.compatible) return null;
          const prettyA = (window.Biomas.getPorNombre && window.Biomas.getPorNombre(a)) ? (window.Biomas.getPorNombre(a).nombre || window.Biomas.getPorNombre(a).name) : aKey;
          const prettyB = (window.Biomas.getPorNombre && window.Biomas.getPorNombre(b)) ? (window.Biomas.getPorNombre(b).nombre || window.Biomas.getPorNombre(b).name) : bKey;
          const nombre = h.name || `${prettyA} / ${prettyB}`;
          const type = h.type || "mixture";
          return { baseA: aKey, baseB: bKey, nombre, type, modifiers: EFFECTS[type] || EFFECTS.mixture, description: "Cruce heurístico" };
        }
      } catch (e) {}
    }

    // por defecto usar score
    const comp = isCompatible(aKey, bKey);
    if (!comp.compatible) return null;
    const prettyA = (window.Biomas.getPorNombre && window.Biomas.getPorNombre(a)) ? (window.Biomas.getPorNombre(a).nombre || window.Biomas.getPorNombre(a).name) : aKey;
    const prettyB = (window.Biomas.getPorNombre && window.Biomas.getPorNombre(b)) ? (window.Biomas.getPorNombre(b).nombre || window.Biomas.getPorNombre(b).name) : bKey;
    const type = comp.score > 0.8 ? "mixture" : (comp.score > 0.5 ? "transition" : "mixture");
    const nombre = `${prettyA} / ${prettyB}`;
    return { baseA: aKey, baseB: bKey, nombre, type, modifiers: EFFECTS[type] || EFFECTS.mixture, description: `Cruce generado (score ${comp.score.toFixed(2)})` };
  }

  function sugerirCruces(bioma, opts = {}) {
    if (!window.Biomas) throw new Error("Biomas no inicializado");
    const topN = opts.topN || 6;
    const minScore = (typeof opts.minScore === "number") ? opts.minScore : 0.25;
    const key = resolveKeyFromBioma(bioma);
    if (!key) return [];
    const all = window.Biomas.getTodos();
    const candidates = [];
    for (const b of all) {
      const otherKey = normalize(b.name || b.nombre || b.file || b.id);
      if (otherKey === key) continue;
      const comp = isCompatible(key, otherKey);
      if (comp.score >= minScore) candidates.push({biome: b, score: comp.score});
    }
    candidates.sort((a,b) => b.score - a.score);
    return candidates.slice(0, topN);
  }

  function registerRule(fn) { if (typeof fn === "function") rules.push(fn); }

  // API
  const API = { isCompatible, generarCruce, sugerirCruces, registerRule, _internal: {CATEGORIES, EFFECTS} };

  // CommonJS export potencial
  if (typeof module !== "undefined" && module.exports) module.exports = API;

  return API;
})();
