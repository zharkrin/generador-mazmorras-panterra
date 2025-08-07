// static/js/main.js
import { BiomasManager } from './modules/biomes.js';

const biomasManager = new BiomasManager(); // rutas por defecto
const visor = document.getElementById('visor');
const nivelDef = visor.getAttribute('data-nivel') || 'nivel-1';

/**
 * Renderiza un nivel (espera archivo JSON en /niveles/<nivel>.json)
 * Formato esperado del JSON de nivel:
 * {
 *   "tiles": [
 *     { "x": 0, "y": 0, "bioma": "Bosque", "tipo": "Suelo" },
 *     ...
 *   ]
 * }
 */
async function renderNivel(nombreNivel) {
  // limpiar
  visor.innerHTML = '';
  // intenta cargar JSON del nivel desde /niveles/<nombreNivel>.json
  try {
    const resp = await fetch(`/niveles/${nombreNivel}.json`, { cache: 'no-store' });
    if (!resp.ok) {
      // intenta ruta sin extension (por si guardaste nivel-1.json como nivel-1)
      const resp2 = await fetch(`/niveles/${nombreNivel}`, { cache: 'no-store' });
      if (!resp2.ok) throw new Error('Nivel no encontrado: ' + nombreNivel);
      var datos = await resp2.json();
    } else {
      var datos = await resp.json();
    }
  } catch (err) {
    console.error('Error cargando nivel', err);
    // Mensaje simple en visor
    visor.innerHTML = `<div style="color:#f88;padding:20px;">No se pudo cargar ${nombreNivel}.json</div>`;
    return;
  }

  // Asegurar estructura tiles[] (podrías adaptar si tu JSON usa otra forma)
  const tiles = datos.tiles || [];

  // dimensiones en píxeles para el tile base 512x512
  const TILE_W = 512;
  const TILE_H = 512;

  // centrar el mapa (opcional)
  // calculamos offset para centrar según extents
  const xs = tiles.map(t => t.x);
  const ys = tiles.map(t => t.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);

  const gridWidth = (maxX - minX + 1);
  const gridHeight = (maxY - minY + 1);

  const centerOffsetX = (visor.clientWidth / 2) - (( (gridWidth - 1) - (gridHeight - 1) ) * (TILE_W / 4));
  const centerOffsetY = 40; // ajuste vertical

  // Dibujar tiles en coordenadas isométricas
  for (const tile of tiles) {
    const x = tile.x;
    const y = tile.y;
    // posición isométrica:
    const isoX = (x - y) * (TILE_W / 4) + centerOffsetX;
    const isoY = (x + y) * (TILE_H / 8) + centerOffsetY;

    const el = document.createElement('div');
    el.className = 'tile';
    el.style.left = `${Math.round(isoX)}px`;
    el.style.top = `${Math.round(isoY)}px`;
    el.style.width = `${TILE_W}px`;
    el.style.height = `${TILE_H}px`;

    // Si el tile tiene un bioma nombrado, aplicar su imagen
    const nombreBioma = tile.bioma || tile.tipo || tile.name || 'Bosque';
    biomasManager.aplicarImagenBioma(el, nombreBioma);

    // añadir atributos para uso DM (hover con nombre)
    el.title = `${nombreBioma} (${x},${y})`;
    visor.appendChild(el);
  }
}

async function iniciar() {
  // cargar biomas locales primero
  await biomasManager.cargarBiomas();

  // Renderizar el nivel por defecto
  await renderNivel(nivelDef);
}

// Botones
document.addEventListener('DOMContentLoaded', () => {
  iniciar();

  document.getElementById('exportar-png').addEventListener('click', () => {
    // Exportar el contenido del visor como PNG usando canvas
    // A falta de html2canvas (sin externos) implementamos creación manual de canvas
    // NOTA: Para simplicidad y compatibilidad, usaremos drawImage sobre un canvas de tamaño suficiente,
    // cargando cada imagen de bioma y pintándola en la posición correcta.
    exportVisorPNG();
  });

  document.getElementById('recargar-biomas').addEventListener('click', async () => {
    await biomasManager.cargarBiomas();
    await renderNivel(nivelDef);
  });
});

/** Exporta el visor a PNG sin dependencias externas.
 *  Esta función carga individualmente las imágenes usadas en el visor y las dibuja en un canvas.
 */
async function exportVisorPNG() {
  // obtener todos los .tile y sus estilos
  const tiles = Array.from(document.querySelectorAll('#visor .tile'));
  if (tiles.length === 0) {
    alert('No hay tiles para exportar.');
    return;
  }

  // calcular bounding box del dibujo
  let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
  const tileInfos = [];
  for (const t of tiles) {
    const rectLeft = parseInt(t.style.left, 10);
    const rectTop = parseInt(t.style.top, 10);
    const w = parseInt(t.style.width, 10);
    const h = parseInt(t.style.height, 10);
    minL = Math.min(minL, rectLeft);
    minT = Math.min(minT, rectTop);
    maxR = Math.max(maxR, rectLeft + w);
    maxB = Math.max(maxB, rectTop + h);

    // extraer ruta de backgroundImage o img si tuviera <img>
    let bg = window.getComputedStyle(t).backgroundImage;
    if (bg && bg !== 'none') {
      // formato: url("...") -> extraer ...
      bg = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    } else {
      // si no hay bg, intentamos construir a partir de data-bioma
      const bname = t.getAttribute('data-bioma') || 'Bosque';
      bg = biomasManager.rutaImagenBioma(bname);
    }
    tileInfos.push({ left: rectLeft, top: rectTop, w, h, src: bg });
  }

  const canvasW = maxR - minL;
  const canvasH = maxB - minT;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // cargar y dibujar en secuencia (espera cada imagen)
  for (const info of tileInfos) {
    try {
      const img = await loadImage(info.src);
      ctx.drawImage(img, info.left - minL, info.top - minT, info.w, info.h);
    } catch (err) {
      console.warn('No se pudo cargar imagen para exportar:', info.src, err);
      // opcional: dibujar rectángulo placeholder
      ctx.fillStyle = '#222';
      ctx.fillRect(info.left - minL, info.top - minT, info.w, info.h);
    }
  }

  // descargar
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'nivel_export.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}