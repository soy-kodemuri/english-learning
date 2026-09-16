<?php
// backend/login.php
session_start();
ob_start();

$mensaje = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombreUsuario = trim($_POST['usuario'] ?? '');

    if (!empty($nombreUsuario)) {
        try {
            // 1. Cargar la conexión PDO desde el mismo directorio
            require_once __DIR__ . '/conexion.php';

            if (!isset($pdo) || !$pdo) {
                throw new Exception("La conexión a la base de datos (\$pdo) no está disponible.");
            }

            // 2. Buscar el usuario en la tabla 'usuarios'
            $stmt = $pdo->prepare("SELECT id, nombre FROM usuarios WHERE LOWER(nombre) = LOWER(:nombre) LIMIT 1");
            $stmt->execute(['nombre' => $nombreUsuario]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                // Guardar en la sesión de PHP
                $_SESSION['usuario_id'] = $usuario['id'];
                $_SESSION['usuario_nombre'] = $usuario['nombre'];

                // Redirigir al Escritorio Principal
                ob_end_clean();
                header('Location: ../index.html');
                exit;
            } else {
                $mensaje = "El usuario '{$nombreUsuario}' no existe en la base de datos.";
            }

        } catch (Throwable $e) {
            $mensaje = "Error de autenticación: " . $e->getMessage();
        }
    } else {
        $mensaje = "Por favor ingrese un nombre de usuario.";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Iniciar Sesión — Los Propios Tacos</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-dark d-flex align-items-center justify-content-center vh-100">
<div class="card shadow p-4" style="width: 360px;">
  <h3 class="text-center mb-3 fw-bold">🌮 LOS PROPIOS TACOS</h3>
  <h6 class="text-center text-muted mb-4">Ingreso de Personal</h6>

  <?php if (!empty($mensaje)): ?>
    <div class="alert alert-danger text-center p-2 small"><?= htmlspecialchars($mensaje) ?></div>
  <?php endif; ?>

  <form method="POST" action="login.php">
    <div class="mb-3">
      <label class="form-label fw-bold text-dark">Usuario / Nombre:</label>
      <input type="text" name="usuario" class="form-control" placeholder="Ej. Daniel o Alejandra" required autofocus>
    </div>
    <button type="submit" class="btn btn-primary w-100 fw-bold">Ingresar al POS</button>
  </form>
</div>
</body>
</html>