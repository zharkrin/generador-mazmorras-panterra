const fs = require('fs');
const path = require('path');

const biomesPath = path.join(__dirname, '../static/biomas/biomes.json');
const crucesPath = path.join(__dirname, '../static/biomas/cruces_sugeridos.json');

const biomes = JSON.parse(fs.readFileSync(biomesPath, 'utf8'));

// Función para determinar si dos biomas son compatibles
function sonCompatibles(b1, b2) {
  // Evitamos cosas absurdas: tundra en desierto cálido
  if (b1.categories.includes("frio-extremo") && b2.categories.includes("calido")) return false;
  if (b2.categories.includes("frio-extremo") && b1.categories.includes("calido")) return false;
  return true;
}

// Generador
const cruces = [];
for (let i = 0; i < biomes.length; i++) {
  for (let j = i + 1; j < biomes.length; j++) {
    const b1 = biomes[i];
    const b2 = biomes[j];
    if (!sonCompatibles(b1, b2)) continue;

    const score = Math.random() * 0.3 + 0.7; // 0.70 - 1.00
    const tipo = b1.categories.some(c => b2.categories.includes(c)) ? "mixture" : "transition";

    cruces.push({
      aId: b1.id,
      aName: b1.nombre,
      bId: b2.id,
      bName: b2.nombre,
      suggestedName: `${b1.nombre} / ${b2.nombre}`,
      type: tipo,
      score: parseFloat(score.toFixed(2)),
      modifiers: {
        movement: 0.9,
        visibility: 0.95,
        hazard: 0.0,
        resource: 1.0
      }
    });
  }
}

// Guardar resultado
fs.writeFileSync(crucesPath, JSON.stringify(cruces, null, 2), 'utf8');
console.log(`✅ Generados ${cruces.length} cruces en ${crucesPath}`);
