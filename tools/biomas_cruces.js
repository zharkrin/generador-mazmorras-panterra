/**
 * biomas_cruces.js
 * Genera un archivo JSON con cruces lógicos de biomas para el generador de mazmorras.
 * Uso: node tools/biomas_cruces.js
 */

const fs = require("fs");
const path = require("path");

// Lista base de biomas (puedes ampliar o modificar)
const biomas = [
  "Bosque",
  "Desierto",
  "Pantano",
  "Tundra",
  "Cueva",
  "Volcán",
  "Montaña",
  "Pradera",
  "Playa",
  "Río subterráneo",
  "Lago subterráneo",
  "Mar subterráneo",
  "Cañón",
  "Glaciar",
  "Selva tropical",
  "Ruinas antiguas"
];

// Cruces lógicos permitidos
const crucesPermitidos = [
  ["Bosque", "Río subterráneo"],
  ["Bosque", "Montaña"],
  ["Bosque", "Cañón"],
  ["Bosque", "Pantano"],
  ["Desierto", "Cañón"],
  ["Desierto", "Oasis"],
  ["Pantano", "Río subterráneo"],
  ["Pantano", "Volcán"],
  ["Tundra", "Glaciar"],
  ["Tundra", "Montaña"],
  ["Cueva", "Lago subterráneo"],
  ["Cueva", "Mar subterráneo"],
  ["Volcán", "Cañón"],
  ["Montaña", "Glaciar"],
  ["Pradera", "Bosque"],
  ["Pradera", "Río subterráneo"],
  ["Playa", "Bosque"],
  ["Playa", "Volcán"],
  ["Río subterráneo", "Lago subterráneo"],
  ["Lago subterráneo", "Mar subterráneo"],
  ["Selva tropical", "Pantano"],
  ["Selva tropical", "Río subterráneo"],
  ["Ruinas antiguas", "Cueva"],
  ["Ruinas antiguas", "Bosque"],
  ["Ruinas antiguas", "Desierto"]
];

// Generar objeto con cruces
const crucesSugeridos = crucesPermitidos.map((cruce, id) => {
  return {
    id: id + 1,
    biome1: cruce[0],
    biome2: cruce[1]
  };
});

// Ruta de guardado
const salidaDir = path.join(__dirname, "../static/biomas");
const salidaArchivo = path.join(salidaDir, "cruces_sugeridos.json");

// Crear carpeta si no existe
if (!fs.existsSync(salidaDir)) {
  fs.mkdirSync(salidaDir, { recursive: true });
}

// Guardar archivo
fs.writeFileSync(salidaArchivo, JSON.stringify(crucesSugeridos, null, 2), "utf8");

console.log(`✅ Archivo de cruces generado en: ${salidaArchivo}`);