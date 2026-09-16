export function renderizarTabla(lista) {
  const tbody = document.getElementById("tabla-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">No hay datos disponibles</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="fw-semibold">${item.producto}</td>
      <td><span class="badge bg-light text-dark border">${item.unidad || '---'}</span></td>
      <td>
        <input type="number" 
               min="0" 
               step="any" 
               class="form-control form-control-sm table-input input-cantidad" 
               data-id="${item.id}"
               data-producto="${item.producto}"
               value="${item.cantidad !== undefined ? item.cantidad : ''}"
               placeholder="0">
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function obtenerDatosFormulario() {
  const responsableInput = document.getElementById("responsable");
  const responsable = responsableInput ? responsableInput.value.trim() : "";

  const registros = [];
  document.querySelectorAll(".input-cantidad").forEach((input) => {
    if (input.value !== "") {
      registros.push({
        id: input.dataset.id,
        cantidad: parseFloat(input.value)
      });
    }
  });

  return { responsable, registros };
}

export function limpiarFormulario() {
  document.querySelectorAll(".input-cantidad").forEach((input) => (input.value = ""));
}