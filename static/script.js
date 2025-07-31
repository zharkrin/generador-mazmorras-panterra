document.getElementById('btn-generar').addEventListener('click', () => {
  const niveles = parseInt(document.getElementById('niveles').value);
  const contenedor = document.getElementById('contenedor-mazmorra');
  contenedor.innerHTML = '';

  for(let i = 1; i <= niveles; i++) {
    const nivelDiv = document.createElement('div');
    nivelDiv.classList.add('nivel');

    const bioma = obtenerBiomaAleatorio();

    nivelDiv.innerHTML = `
      <h2>Nivel ${i} - ${bioma.nombre}</h2>
      <div class="entorno" style="background-image: url('${bioma.imagen}')"></div>
    `;

    contenedor.appendChild(nivelDiv);
  }
});

const biomasDisponibles = [
  { nombre: "Caverna", imagen: "static/fondos/caverna.jpg" },
  { nombre: "Bosque subterráneo", imagen: "static/fondos/bosque.jpg" },
  { nombre: "Desierto olvidado", imagen: "static/fondos/desierto.jpg" },
  { nombre: "Pantano pútrido", imagen: "static/fondos/pantano.jpg" },
  { nombre: "Ruinas antiguas", imagen: "static/fondos/ruinas.jpg" }
];

function obtenerBiomaAleatorio() {
  const idx = Math.floor(Math.random() * biomasDisponibles.length);
  return biomasDisponibles[idx];
}