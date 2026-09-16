export function renderizarRecetas(lista) {
  const contenedor = document.getElementById("contenedor-recetas");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center text-muted py-4">
        <h5>No hay recetas registradas</h5>
      </div>`;
    return;
  }

  lista.forEach((platillo) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    let filasIngredientes = "";
    if (platillo.ingredientes && platillo.ingredientes.length > 0) {
      filasIngredientes = platillo.ingredientes.map(ing => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${ing.nombre}</span>
          <span class="badge bg-primary rounded-pill">
            ${ing.cantidad} ${ing.unidad || ''}
          </span>
        </li>
      `).join("");
    } else {
      filasIngredientes = `<li class="list-group-item text-muted">Sin ingredientes asignados</li>`;
    }

    col.innerHTML = `
      <div class="card shadow-sm h-100 card-receta">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0 fw-bold">${platillo.nombre}</h5>
            <span class="badge bg-success fs-6">$${platillo.precio.toLocaleString('es-CO')}</span>
          </div>
          <h6 class="card-subtitle mb-2 text-muted">Ingredientes / Insumos:</h6>
          <ul class="list-group list-group-flush border-top mb-3 flex-grow-1">
            ${filasIngredientes}
          </ul>
          <div class="d-flex justify-content-end gap-2 border-top pt-2">
            <button class="btn btn-outline-warning btn-sm btn-editar" data-id="${platillo.id}">✏️ Editar</button>
            <button class="btn btn-outline-danger btn-sm btn-eliminar" data-id="${platillo.id}">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}