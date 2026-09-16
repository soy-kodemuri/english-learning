export function renderizarTablaReal(lista) {
  const tbody = document.getElementById("tabla-body-real");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No hay datos disponibles</td></tr>`;
    return;
  }

  lista.forEach((item) => {
    const tr = document.createElement("tr");

    let estadoBadge = '<span class="badge bg-success">Suficiente</span>';
    if (item.stock_real <= 0) {
      estadoBadge = '<span class="badge bg-danger">Agotado</span>';
    } else if (item.stock_real < 50) {
      estadoBadge = '<span class="badge bg-warning text-dark">Bajo Stock</span>';
    }

    tr.innerHTML = `
      <td class="fw-semibold">${item.producto}</td>
      <td><span class="badge bg-light text-dark border">${item.unidad || '---'}</span></td>
      <td class="text-secondary">${item.cantidad_inicial.toLocaleString('es-CO')}</td>
      <td class="text-danger">-${item.total_vendido.toLocaleString('es-CO')}</td>
      <td class="fw-bold fs-6 ${item.stock_real <= 0 ? 'text-danger' : 'text-primary'}">
        ${item.stock_real.toLocaleString('es-CO')}
      </td>
      <td>${estadoBadge}</td>
    `;
    tbody.appendChild(tr);
  });
}