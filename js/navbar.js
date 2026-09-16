document.addEventListener("DOMContentLoaded", () => {
  const nav = document.createElement("nav");
  nav.className = "navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm";

  nav.innerHTML = `
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="index.html">🖥️ Escritorio</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <div class="navbar-nav ms-auto">
          <a class="nav-link" href="ventas.html">🛒 POS Ventas</a>
          <a class="nav-link" href="inventario_real.html">📊 Stock Real</a>
          <a class="nav-link" href="ajuste_inventario.html">⚖️ Ajustes</a>
          <a class="nav-link" href="recetas.html">📖 Recetas</a>
          <a class="nav-link" href="movimientos_sucursales.html">🚚 Traspasos</a>
          <a class="nav-link" href="inventario_base.html">📦 Inventario Base</a>
        </div>
      </div>
    </div>
  `;

  document.body.insertBefore(nav, document.body.firstChild);

  // Resaltar automáticamente la pestaña activa
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  const enlaces = nav.querySelectorAll(".nav-link");

  enlaces.forEach(enlace => {
    if (enlace.getAttribute("href") === paginaActual) {
      enlace.classList.add("active", "fw-bold");
    }
  });
});