// static/js/modules/biomes.js
export class BiomasManager {
  /**
   * jsonPath: ruta al biomas.json local (por defecto).
   * imgBasePath: carpeta de imágenes de biomas (por defecto).
   */
  constructor(jsonPath = '/static/biomas/biomes.json', imgBasePath = '/static/biomas/img/') {
    this.jsonPath = jsonPath;
    this.imgBasePath = imgBasePath;
    this.biomas = [];
  }

  // Carga el JSON local de biomas
  async cargarBiomas() {
    try {
      const resp = await fetch(this.jsonPath, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar ${this.jsonPath}`);
      this.biomas = await resp.json();
      // Normalizar: asegurar que cada bioma tenga nombre en 'name' y opcional id
      this.biomas = this.biomas.map((b, i) => ({
        id: b.id ?? (i + 1),
        name: b.name ?? b.nombre ?? b.name_es ?? `Bioma_${i+1}`,
        color: b.color ?? b.color_hex ?? b.colour ?? null,
        ...b
      }));
      return this.biomas;
    } catch (err) {
      console.error('BiomasManager.cargarBiomas:', err);
      this.biomas = [];
      return this.biomas;
    }
  }

  // obtener por id o nombre (case-insensitive)
  obtenerBioma(identificador) {
    if (!this.biomas || this.biomas.length === 0) return null;
    if (typeof identificador === 'number') {
      return this.biomas.find(b => b.id === identificador) || null;
    }
    const name = String(identificador).toLowerCase();
    return this.biomas.find(b => (b.name && b.name.toLowerCase() === name)) || null;
  }

  // Construye ruta a la imagen esperada del bioma.
  // Normaliza: "Bosque" -> "bosque.png"
  rutaImagenBioma(nombreBioma) {
    if (!nombreBioma) return '';
    const normal = String(nombreBioma).toLowerCase().replace(/\s+/g, '');
    return `${this.imgBasePath}${normal}.png`;
  }

  // Aplica imagen y atributos a un <img> o a un DIV de tile
  aplicarImagenBioma(elemento, nombreBioma) {
    const ruta = this.rutaImagenBioma(nombreBioma);
    if (elemento.tagName && elemento.tagName.toLowerCase() === 'img') {
      elemento.src = ruta;
      elemento.alt = nombreBioma;
    } else {
      // si es div, añadimos imagen de fondo
      elemento.style.backgroundImage = `url("${ruta}")`;
      elemento.style.backgroundSize = 'cover';
      elemento.setAttribute('data-bioma', nombreBioma);
    }
  }
}
