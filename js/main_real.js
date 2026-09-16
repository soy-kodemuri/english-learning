import { fetchInventarioReal } from "./api.js";
import { renderizarTablaReal } from "./ui_real.js";

let stockActual = [];

async function cargarStockReal() {
  try {
    stockActual = await fetchInventarioReal();
    renderizarTablaReal(stockActual);
  } catch (error) {
    console.error("Error al obtener el stock real:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarStockReal();

  // Búsqueda dinámica
  const inputBuscar = document.getElementById("buscar-real");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
      const busqueda = e.target.value.toLowerCase();
      const filtrados = stockActual.filter((item) =>
        item.producto.toLowerCase().includes(busqueda)
      );
      renderizarTablaReal(filtrados);
    });
  }

  // Botón recargar manual
  const btnRecargar = document.getElementById("btn-recargar");
  if (btnRecargar) {
    btnRecargar.addEventListener("click", cargarStockReal);
  }
});