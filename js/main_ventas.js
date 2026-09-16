let carrito = [];
let productosMenu = [];

async function cargarMenu() {
  const grid = document.getElementById("grid-platillos");
  if (!grid) return;

  try {
    const res = await fetch("backend/obtener_productos_venta.php");
    
    if (!res.ok) {
      grid.innerHTML = `<div class="col-12 text-center text-danger py-4">Error HTTP: ${res.status}</div>`;
      return;
    }

    const json = await res.json();

    if (json.status === "success" && Array.isArray(json.data)) {
      productosMenu = json.data;

      if (productosMenu.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No hay productos registrados en el menú</div>`;
        return;
      }

      renderizarCatalogo();
    } else {
      grid.innerHTML = `<div class="col-12 text-center text-danger py-4">Respuesta no válida del servidor</div>`;
    }
  } catch (err) {
    console.error("Error al cargar menú:", err);
    grid.innerHTML = `<div class="col-12 text-center text-danger py-4">Error de conexión al cargar el menú</div>`;
  }
}

function renderizarCatalogo() {
  const grid = document.getElementById("grid-platillos");
  if (!grid) return;
  grid.innerHTML = "";

  productosMenu.forEach(p => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="card h-100 shadow-sm card-platillo" data-id="${p.id}">
        <img src="${p.imagen_url}" class="card-img-top img-platillo" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Los+Propios+Tacos'">
        <div class="card-body d-flex flex-column justify-content-between text-center p-2">
          <h6 class="fw-bold mb-1">${p.nombre}</h6>
          <span class="fs-5 fw-bold text-success">$ ${p.precio.toLocaleString('es-CO')}</span>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function agregarAlCarrito(id) {
  const prod = productosMenu.find(p => p.id === id);
  if (!prod) return;

  const enCarrito = carrito.find(item => item.id === id);
  if (enCarrito) {
    enCarrito.cantidad++;
  } else {
    carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
  }

  renderizarCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.id !== id);
  }
  renderizarCarrito();
}

function renderizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalElem = document.getElementById("total-orden");
  const btnVenta = document.getElementById("btn-procesar-venta");

  if (!lista || !totalElem || !btnVenta) return;

  if (carrito.length === 0) {
    lista.innerHTML = `<li class="list-group-item text-center text-muted py-4">No hay ítems seleccionados</li>`;
    totalElem.textContent = "$ 0";
    btnVenta.disabled = true;
    return;
  }

  let total = 0;
  lista.innerHTML = "";

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center py-2";
    li.innerHTML = `
      <div>
        <div class="fw-bold">${item.nombre}</div>
        <small class="text-muted">$ ${item.precio.toLocaleString('es-CO')}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-danger btn-sm btn-restar" data-id="${item.id}">-</button>
        <span class="fw-bold">${item.cantidad}</span>
        <button class="btn btn-outline-success btn-sm btn-sumar" data-id="${item.id}">+</button>
      </div>
    `;
    lista.appendChild(li);
  });

  totalElem.textContent = `$ ${total.toLocaleString('es-CO')}`;
  btnVenta.disabled = false;
}

async function procesarVenta() {
  if (carrito.length === 0) return;

  try {
    const res = await fetch("backend/procesar_venta.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: carrito })
    });

    const data = await res.json();
    if (data.status === "success") {
      alert("¡Venta registrada e inventario descontado con éxito!");
      carrito = [];
      renderizarCarrito();
    } else {
      alert("Error al procesar la venta: " + data.message);
    }
  } catch (err) {
    console.error("Error al procesar la venta:", err);
    alert("Ocurrió un error de conexión al procesar la venta.");
  }
}

// Cargar usuario conectado al entrar a la página
async function obtenerUsuarioConectado() {
  try {
    const res = await fetch("backend/obtener_usuario_actual.php");
    const data = await res.json();
    const elem = document.getElementById("indicador-usuario");

    if (elem) {
      if (data.logueado) {
        elem.textContent = `👤 Atiende: ${data.nombre}`;
        elem.className = "badge bg-success text-white fs-6 me-2";
      } else {
        elem.textContent = "👤 Sin sesión activa";
        elem.className = "badge bg-danger text-white fs-6 me-2";
      }
    }
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
  }
}

// Asegurarse de ejecutarlo al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerUsuarioConectado();
  // ... resto de inicializaciones ...
});



// Inicialización cuando el DOM esté totalmente cargado
document.addEventListener("DOMContentLoaded", () => {
  cargarMenu();

  const grid = document.getElementById("grid-platillos");
  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card-platillo");
      if (card) agregarAlCarrito(parseInt(card.dataset.id));
    });
  }

  const listaCarrito = document.getElementById("lista-carrito");
  if (listaCarrito) {
    listaCarrito.addEventListener("click", (e) => {
      const btnSumar = e.target.closest(".btn-sumar");
      const btnRestar = e.target.closest(".btn-restar");

      if (btnSumar) cambiarCantidad(parseInt(btnSumar.dataset.id), 1);
      if (btnRestar) cambiarCantidad(parseInt(btnRestar.dataset.id), -1);
    });
  }

  const btnVenta = document.getElementById("btn-procesar-venta");
  if (btnVenta) {
    btnVenta.addEventListener("click", procesarVenta);
  }
});