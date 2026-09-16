import { fetchRecetas, fetchInventarioReal } from "./api.js";
import { renderizarRecetas } from "./ui_recetas.js";

let catalogoRecetas = [];
let listaInsumosDisponibles = [];
let modalInstancia = null;

async function inicializarPagina() {
  try {
    const [recetas, insumos] = await Promise.all([
      fetchRecetas(),
      fetchInventarioReal()
    ]);

    catalogoRecetas = recetas;
    listaInsumosDisponibles = insumos;

    renderizarRecetas(catalogoRecetas);
  } catch (error) {
    console.error("Error al inicializar las recetas:", error);
  }
}

function agregarFilaIngrediente(inventarioId = null, cantidad = '') {
  const contenedor = document.getElementById("contenedor-ingredientes");
  if (!contenedor) return;

  const row = document.createElement("div");
  row.className = "row g-2 align-items-center mb-2 fila-ingrediente";

  const opciones = listaInsumosDisponibles.map(item => {
    const selected = item.id === inventarioId ? 'selected' : '';
    return `<option value="${item.id}" ${selected}>${item.producto} (${item.unidad || 'Unid'})</option>`;
  }).join("");

  row.innerHTML = `
    <div class="col-md-6">
      <select class="form-select select-insumo" required>
        <option value="" disabled ${!inventarioId ? 'selected' : ''}>Seleccione un insumo...</option>
        ${opciones}
      </select>
    </div>
    <div class="col-md-4">
      <input type="number" step="any" min="0.01" class="form-control input-cantidad-req" placeholder="Cant. requerida" value="${cantidad}" required>
    </div>
    <div class="col-md-2 text-end">
      <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-fila">❌</button>
    </div>
  `;

  row.querySelector(".btn-eliminar-fila").addEventListener("click", () => {
    if (document.querySelectorAll(".fila-ingrediente").length > 1) {
      row.remove();
    } else {
      alert("La receta debe incluir al menos un ingrediente.");
    }
  });

  contenedor.appendChild(row);
}

function abrirModalNueva() {
  document.getElementById("form-nueva-receta").reset();
  document.getElementById("platillo-id").value = "";
  document.getElementById("modalNuevaRecetaLabel").textContent = "Registrar Nueva Receta";
  document.getElementById("contenedor-ingredientes").innerHTML = "";
  agregarFilaIngrediente();

  modalInstancia.show();
}

function abrirModalEditar(id) {
  const platillo = catalogoRecetas.find(p => p.id === id);
  if (!platillo) return;

  document.getElementById("platillo-id").value = platillo.id;
  document.getElementById("nombre-platillo").value = platillo.nombre;
  document.getElementById("precio-platillo").value = platillo.precio;
  document.getElementById("modalNuevaRecetaLabel").textContent = `Editar Receta: ${platillo.nombre}`;

  const contenedor = document.getElementById("contenedor-ingredientes");
  contenedor.innerHTML = "";

  if (platillo.ingredientes && platillo.ingredientes.length > 0) {
    platillo.ingredientes.forEach(ing => {
      agregarFilaIngrediente(ing.inventario_id, ing.cantidad);
    });
  } else {
    agregarFilaIngrediente();
  }

  modalInstancia.show();
}

async function eliminarReceta(id) {
  const platillo = catalogoRecetas.find(p => p.id === id);
  if (!platillo) return;

  if (!confirm(`¿Estás seguro de eliminar la receta "${platillo.nombre}"?`)) return;

  try {
    const respuesta = await fetch("backend/eliminar_receta.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const resultado = await respuesta.json();
    if (resultado.status === "success") {
      inicializarPagina();
    } else {
      alert("Error al eliminar: " + resultado.message);
    }
  } catch (error) {
    console.error("Error al eliminar la receta:", error);
  }
}

async function guardarReceta(evento) {
  evento.preventDefault();

  const id = document.getElementById("platillo-id").value;
  const nombre = document.getElementById("nombre-platillo").value.trim();
  const precio = parseFloat(document.getElementById("precio-platillo").value);

  const ingredientes = [];
  document.querySelectorAll(".fila-ingrediente").forEach((fila) => {
    const select = fila.querySelector(".select-insumo");
    const inputCant = fila.querySelector(".input-cantidad-req");

    if (select.value && inputCant.value) {
      ingredientes.push({
        inventario_id: parseInt(select.value),
        cantidad: parseFloat(inputCant.value)
      });
    }
  });

  try {
    const respuesta = await fetch("backend/guardar_receta.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nombre, precio, ingredientes })
    });

    const resultado = await respuesta.json();
    if (resultado.status === "success") {
      modalInstancia.hide();
      inicializarPagina();
    } else {
      alert("Error al guardar: " + resultado.message);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("modalNuevaReceta");
  modalInstancia = new bootstrap.Modal(modalEl);

  inicializarPagina();

  document.getElementById("btn-nueva-receta").addEventListener("click", abrirModalNueva);
  document.getElementById("btn-recargar").addEventListener("click", inicializarPagina);
  document.getElementById("btn-agregar-ingrediente").addEventListener("click", () => agregarFilaIngrediente());
  document.getElementById("form-nueva-receta").addEventListener("submit", guardarReceta);

  // Delegación de eventos para Editar y Eliminar en las tarjetas
  document.getElementById("contenedor-recetas").addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-editar");
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (btnEditar) {
      const id = parseInt(btnEditar.dataset.id);
      abrirModalEditar(id);
    } else if (btnEliminar) {
      const id = parseInt(btnEliminar.dataset.id);
      eliminarReceta(id);
    }
  });
});