import { fetchInventarioReal } from "./api.js";

let listaMovimientos = [];
let listaInsumos = [];
let modalInstancia = null;

async function inicializar() {
  try {
    const [movs, insumos] = await Promise.all([
      fetchMovimientos(),
      fetchInventarioReal()
    ]);

    listaMovimientos = movs;
    listaInsumos = insumos;

    poblarSelectInsumos();
    renderizarTabla();
  } catch (err) {
    console.error("Error inicializando página de movimientos:", err);
  }
}

async function fetchMovimientos() {
  const res = await fetch("backend/gestion_movimientos.php");
  return await res.json();
}

function poblarSelectInsumos() {
  const select = document.getElementById("movimiento-insumo");
  if (!select) return;

  const opciones = listaInsumos.map(item => 
    `<option value="${item.id}">${item.producto} (${item.unidad || 'Unid'})</option>`
  ).join("");

  select.innerHTML = `<option value="" disabled selected>Seleccione un insumo...</option>${opciones}`;
}

function renderizarTabla() {
  const tbody = document.getElementById("tabla-movimientos-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (listaMovimientos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">No hay movimientos registrados</td></tr>`;
    return;
  }

  listaMovimientos.forEach(m => {
    const tr = document.createElement("tr");
    const esEntrada = m.tipo === 'ENTRADA';
    const badgeTipo = esEntrada 
      ? `<span class="badge bg-success">📥 ENTRADA</span>` 
      : `<span class="badge bg-danger">📤 SALIDA</span>`;

    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${new Date(m.fecha).toLocaleString('es-CO')}</td>
      <td>${badgeTipo}</td>
      <td class="fw-bold">${m.sucursal}</td>
      <td>${m.producto}</td>
      <td class="fw-bold">${parseFloat(m.cantidad).toLocaleString('es-CO')} ${m.unidad || ''}</td>
      <td class="text-secondary">${m.observacion || '—'}</td>
      <td>
        <button class="btn btn-outline-warning btn-sm btn-editar" data-id="${m.id}">✏️</button>
        <button class="btn btn-outline-danger btn-sm btn-eliminar" data-id="${m.id}">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function abrirModalCrear() {
  document.getElementById("form-movimiento").reset();
  document.getElementById("movimiento-id").value = "";
  document.getElementById("modalMovimientoLabel").textContent = "Registrar Nuevo Movimiento";
  modalInstancia.show();
}

function abrirModalEditar(id) {
  const m = listaMovimientos.find(item => item.id === id);
  if (!m) return;

  document.getElementById("movimiento-id").value = m.id;
  document.getElementById("movimiento-tipo").value = m.tipo;
  document.getElementById("movimiento-sucursal").value = m.sucursal;
  document.getElementById("movimiento-insumo").value = m.inventario_id;
  document.getElementById("movimiento-cantidad").value = m.cantidad;
  document.getElementById("movimiento-observacion").value = m.observacion || "";

  document.getElementById("modalMovimientoLabel").textContent = "Editar Movimiento";
  modalInstancia.show();
}

async function guardarMovimiento(e) {
  e.preventDefault();

  const id = document.getElementById("movimiento-id").value;
  const tipo = document.getElementById("movimiento-tipo").value;
  const sucursal = document.getElementById("movimiento-sucursal").value.trim();
  const inventario_id = parseInt(document.getElementById("movimiento-insumo").value);
  const cantidad = parseFloat(document.getElementById("movimiento-cantidad").value);
  const observacion = document.getElementById("movimiento-observacion").value.trim();

  try {
    const res = await fetch("backend/gestion_movimientos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tipo, sucursal, inventario_id, cantidad, observacion })
    });

    const txt = await res.text();
    const data = JSON.parse(txt);

    if (data.status === "success") {
      modalInstancia.hide();
      inicializar();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error guardando movimiento:", err);
  }
}

async function eliminarMovimiento(id) {
  if (!confirm("¿Deseas eliminar este registro de movimiento?")) return;

  try {
    const res = await fetch("backend/gestion_movimientos.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const txt = await res.text();
    const data = JSON.parse(txt);

    if (data.status === "success") {
      inicializar();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Error eliminando movimiento:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  modalInstancia = new bootstrap.Modal(document.getElementById("modalMovimiento"));
  inicializar();

  document.getElementById("btn-nuevo-movimiento").addEventListener("click", abrirModalCrear);
  document.getElementById("btn-recargar").addEventListener("click", inicializar);
  document.getElementById("form-movimiento").addEventListener("submit", guardarMovimiento);

  document.getElementById("tabla-movimientos-body").addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".btn-editar");
    const btnEliminar = e.target.closest(".btn-eliminar");

    if (btnEditar) abrirModalEditar(parseInt(btnEditar.dataset.id));
    if (btnEliminar) eliminarMovimiento(parseInt(btnEliminar.dataset.id));
  });
});