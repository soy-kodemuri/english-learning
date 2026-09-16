import { fetchInventarioReal } from "./api.js";

let inventarioGlobal = [];
let modalAjusteInstancia = null;
let modalInsumoInstancia = null;

async function cargarTabla() {
  try {
    inventarioGlobal = await fetchInventarioReal();
    const tbody = document.getElementById("tabla-ajustes-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    inventarioGlobal.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td class="fw-bold">${item.producto}</td>
        <td><span class="badge bg-light text-dark border">${item.unidad || '---'}</span></td>
        <td class="fw-bold text-primary fs-6">${item.stock_real.toLocaleString('es-CO')}</td>
        <td class="text-secondary">${item.cantidad_inicial.toLocaleString('es-CO')}</td>
        <td>
          <button class="btn btn-warning btn-sm btn-ajustar me-1" data-id="${item.id}">⚖️ Ajustar Stock</button>
          <button class="btn btn-outline-secondary btn-sm btn-editar me-1" data-id="${item.id}">✏️ Editar</button>
          <button class="btn btn-outline-danger btn-sm btn-eliminar" data-id="${item.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error al cargar la tabla de ajustes:", error);
  }
}

function abrirModalAjuste(id) {
  const item = inventarioGlobal.find(i => i.id === id);
  if (!item) return;

  document.getElementById("ajuste-insumo-id").value = item.id;
  document.getElementById("ajuste-insumo-nombre").textContent = item.producto;
  document.getElementById("ajuste-cantidad-real").value = item.stock_real;
  document.getElementById("ajuste-responsable").value = "";

  modalAjusteInstancia.show();
}

function abrirModalInsumo(id = null) {
  const form = document.getElementById("form-insumo");
  form.reset();
  
  if (id) {
    const item = inventarioGlobal.find(i => i.id === id);
    if (!item) return;
    document.getElementById("insumo-id").value = item.id;
    document.getElementById("insumo-nombre").value = item.producto;
    document.getElementById("insumo-unidad").value = item.unidad;
    document.getElementById("modalInsumoLabel").textContent = "Editar Insumo";
  } else {
    document.getElementById("insumo-id").value = "";
    document.getElementById("modalInsumoLabel").textContent = "Nuevo Insumo";
  }

  modalInsumoInstancia.show();
}

async function guardarAjuste(e) {
  e.preventDefault();
  const inventario_id = parseInt(document.getElementById("ajuste-insumo-id").value);
  const cantidad_real = parseFloat(document.getElementById("ajuste-cantidad-real").value);
  const responsable = document.getElementById("ajuste-responsable").value.trim();

  try {
    const res = await fetch("backend/guardar_ajuste.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventario_id, cantidad_real, responsable })
    });
    const data = await res.json();
    if (data.status === "success") {
      modalAjusteInstancia.hide();
      cargarTabla();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error guardando el ajuste:", err);
  }
}

async function guardarInsumo(e) {
  e.preventDefault();
  const id = document.getElementById("insumo-id").value;
  const nombre = document.getElementById("insumo-nombre").value.trim();
  const unidad = document.getElementById("insumo-unidad").value;

  try {
    const res = await fetch("backend/gestion_insumos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nombre, unidad })
    });
    const data = await res.json();
    if (data.status === "success") {
      modalInsumoInstancia.hide();
      cargarTabla();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error guardando insumo:", err);
  }
}

async function eliminarInsumo(id) {
  if (!confirm("¿Deseas eliminar este insumo del catálogo?")) return;
  try {
    const res = await fetch("backend/gestion_insumos.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.status === "success") {
      cargarTabla();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error al eliminar el insumo:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  modalAjusteInstancia = new bootstrap.Modal(document.getElementById("modalAjuste"));
  modalInsumoInstancia = new bootstrap.Modal(document.getElementById("modalInsumo"));

  cargarTabla();

  document.getElementById("btn-recargar").addEventListener("click", cargarTabla);
  document.getElementById("btn-nuevo-insumo").addEventListener("click", () => abrirModalInsumo());
  document.getElementById("form-ajuste").addEventListener("submit", guardarAjuste);
  document.getElementById("form-insumo").addEventListener("submit", guardarInsumo);

  document.getElementById("tabla-ajustes-body").addEventListener("click", (e) => {
    const btnAjustar = e.target.closest(".btn-ajustar");
    const btnEditar = e.target.closest(".btn-editar");
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (btnAjustar) abrirModalAjuste(parseInt(btnAjustar.dataset.id));
    if (btnEditar) abrirModalInsumo(parseInt(btnEditar.dataset.id));
    if (btnEliminar) eliminarInsumo(parseInt(btnEliminar.dataset.id));
  });
});