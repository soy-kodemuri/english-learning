const RUTA_OBTENER = "backend/obtener_inventario.php?negocio_id=1";
const RUTA_GUARDAR = "backend/guardar_inventario.php";

export async function fetchInventario() {
  const respuesta = await fetch(RUTA_OBTENER);
  if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
  const resultado = await respuesta.json();
  
  if (resultado.status !== "success" || !Array.isArray(resultado.data)) {
    throw new Error(resultado.message || "Error al obtener datos");
  }
  
  return resultado.data.map(item => ({
    id: item.id,
    producto: item.nombre,
    unidad: item.unidad,
    cantidad: item.cantidad
  }));
}

export async function guardarInventarioAPI(datos) {
  const respuesta = await fetch(RUTA_GUARDAR, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  
  const resultado = await respuesta.json();
  if (resultado.status !== "success") {
    throw new Error(resultado.message || "Error al guardar el inventario");
  }
  
  return resultado;
}

export async function registrarVentaAPI(productoVentaId, cantidadVendida = 1) {
  const respuesta = await fetch("backend/registrar_venta.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      producto_venta_id: productoVentaId,
      cantidad_vendida: cantidadVendida
    })
  });

  const resultado = await respuesta.json();
  if (resultado.status !== "success") {
    throw new Error(resultado.message);
  }
  return resultado;
}

// Agrega esta función en tu js/api.js si no la tienes exportada
export async function fetchInventarioReal() {
  const respuesta = await fetch("backend/obtener_inventario_real.php");
  if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
  
  const resultado = await respuesta.json();
  if (resultado.status !== "success") throw new Error(resultado.message);

  return resultado.data.map(item => ({
    id: item.id,
    producto: item.producto,
    unidad: item.unidad,
    cantidad_inicial: parseFloat(item.cantidad_inicial),
    total_vendido: parseFloat(item.total_vendido),
    stock_real: parseFloat(item.stock_real)
  }));
}

export async function fetchRecetas() {
  const respuesta = await fetch("backend/obtener_recetas.php");
  if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
  const resultado = await respuesta.json();

  if (resultado.status !== "success") {
    throw new Error(resultado.message || "Error al obtener recetas");
  }

  return resultado.data;
}