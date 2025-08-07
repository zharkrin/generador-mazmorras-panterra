// Tamaño del tile (512x512px base)
const TILE_WIDTH = 512;
const TILE_HEIGHT = 256; // vista isométrica: altura reducida

// Coordenadas para centrar el mapa
const mapa = document.getElementById("mapa");
const offsetX = window.innerWidth / 2;
const offsetY = 100;

// Función para convertir coordenadas cartesianas a isométricas
function aIsometrico(x, y) {
  const isoX = (x - y) * (TILE_WIDTH / 2);
  const isoY = (x + y) * (TILE_HEIGHT / 2);
  return [isoX, isoY];
}

// Cargar archivo JSON generado por Python
fetch("/static/mazmorras/ultima.json")
  .then(response => response.json())
  .then(data => {
    const niveles = data.niveles || [];

    niveles.forEach((nivel, index) => {
      const celdas = nivel.matriz;
      celdas.forEach((fila, y) => {
        fila.forEach((celda, x) => {
          const bioma = celda.bioma || "desconocido";
          const [isoX, isoY] = aIsometrico(x, y);

          const tile = document.createElement("img");
          tile.src = `/static/Tiles/${bioma}.png`;
          tile.classList.add("tile");
          tile.style.left = `${offsetX + isoX}px`;
          tile.style.top = `${offsetY + isoY + index * 1000}px`; // cada nivel más abajo

          mapa.appendChild(tile);
        });
      });
    });
  })
  .catch(error => {
    console.error("Error al cargar la mazmorra:", error);
  });