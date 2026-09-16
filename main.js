import { fetchInventario, guardarInventarioAPI } from "./js/api.js";
import { renderizarTabla, obtenerDatosFormulario, limpiarFormulario } from "./js/ui.js";

let inventarioBase = [];

async function inicializarInventario() {
  try {
    inventarioBase = await fetchInventario();
    renderizarTabla(inventarioBase);
  } catch (error) {
    console.error("Error al cargar el inventario:", error);
  }
}

async function manejarGuardado() {
  const { responsable, registros } = obtenerDatosFormulario();

  if (!responsable) {
    alert("Por favor ingrese el nombre del responsable.");
    return;
  }

  if (registros.length === 0) {
    alert("No hay cantidades ingresadas para guardar.");
    return;
  }

  try {
    await guardarInventarioAPI({ responsable, registros });
    alert("¡Inventario actualizado con éxito!");
    await inicializarInventario();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Error de conexión o guardado: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarInventario();

  const inputBuscar = document.getElementById("buscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
      const busqueda = e.target.value.toLowerCase();
      const filtrados = inventarioBase.filter((item) =>
        item.producto.toLowerCase().includes(busqueda)
      );
      renderizarTabla(filtrados);
    });
  }

  const btnLimpiar = document.getElementById("btn-limpiar");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFormulario);

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) btnGuardar.addEventListener("click", manejarGuardado);
});