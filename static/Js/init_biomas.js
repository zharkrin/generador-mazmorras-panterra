<script>
class Biomas {
  static lista = [];
  static async init() {
    try {
      const resp = await fetch('/static/biomas/biomes.json');
      if (!resp.ok) throw new Error(`Error cargando biomes.json: ${resp.status}`);
      Biomas.lista = await resp.json();
      console.log(`✅ Biomas cargados: ${Biomas.lista.length}`);
    } catch (err) {
      console.error("Error en Biomas.init():", err);
    }
  }
  static getById(id) {
    return Biomas.lista.find(b => b.id === id) || null;
  }
}

class BiomasCruces {
  static lista = [];
  static async init() {
    try {
      const resp = await fetch('/static/biomas/cruces_sugeridos.json');
      if (!resp.ok) throw new Error(`Error cargando cruces_sugeridos.json: ${resp.status}`);
      BiomasCruces.lista = await resp.json();
      console.log(`✅ Cruces cargados: ${BiomasCruces.lista.length}`);
    } catch (err) {
      console.error("Error en BiomasCruces.init():", err);
    }
  }
  static listarPorBioma(id) {
    return BiomasCruces.lista.filter(c => c.aId === id || c.bId === id);
  }
}

// Inicialización automática al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await Biomas.init();
  await BiomasCruces.init();

  // Ejemplo: mostrar todos los biomas en consola
  console.table(Biomas.lista);

  // Ejemplo: mostrar cruces del bioma Pantano
  const pantano = Biomas.lista.find(b => b.nombre === "Pantano");
  if (pantano) {
    console.log("🌿 Cruces posibles con Pantano:");
    console.table(BiomasCruces.listarPorBioma(pantano.id));
  }

  // Ejemplo visualización rápida
  const cont = document.createElement("div");
  cont.style.display = "flex";
  cont.style.flexWrap = "wrap";
  Biomas.lista.forEach(b => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.margin = "5px";
    card.style.padding = "5px";
    card.style.width = "150px";
    card.style.background = b.color;
    card.innerHTML = `<strong>${b.nombre}</strong><br><small>${b.name}</small>`;
    cont.appendChild(card);
  });
  document.body.appendChild(cont);
});
</script>