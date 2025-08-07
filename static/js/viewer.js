const TILE_SIZE = 512;

fetch("/datos")
  .then(res => res.json())
  .then(mapa => {
    const contenedor = document.getElementById("mapa");
    const { ancho, alto, tiles } = mapa;

    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const tile = document.createElement("img");
        tile.src = `/static/tiles/${tiles[y][x]}.png`;
        tile.classList.add("tile");

        const isoX = (x - y) * TILE_SIZE / 2;
        const isoY = (x + y) * TILE_SIZE / 4;

        tile.style.left = `${isoX}px`;
        tile.style.top = `${isoY}px`;

        contenedor.appendChild(tile);
      }
    }
  });
