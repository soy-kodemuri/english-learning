<?php
// backend/obtener_usuario_actual.php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (isset($_SESSION['usuario_id']) && isset($_SESSION['usuario_nombre'])) {
    echo json_encode([
        'status' => 'success',
        'logueado' => true,
        'usuario_id' => $_SESSION['usuario_id'],
        'nombre' => $_SESSION['usuario_nombre']
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'status' => 'success',
        'logueado' => false,
        'nombre' => 'Invitado / Sin sesión'
    ], JSON_UNESCAPED_UNICODE);
}