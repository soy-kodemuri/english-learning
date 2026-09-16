<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/conexion.php';

    // Intentamos seleccionar con imagen_url
    try {
        $stmt = $pdo->query("SELECT id, nombre, precio, imagen_url FROM productos_venta ORDER BY nombre ASC");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $ex) {
        // Si la columna imagen_url no existe todavía en la BD, se consulta sin ella
        $stmt = $pdo->query("SELECT id, nombre, precio FROM productos_venta ORDER BY nombre ASC");
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $imagenDefault = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80';

    foreach ($productos as &$p) {
        $p['id'] = intval($p['id']);
        $p['precio'] = floatval($p['precio']);
        $p['imagen_url'] = !empty($p['imagen_url']) ? $p['imagen_url'] : $imagenDefault;
    }

    ob_end_clean();
    echo json_encode([
        'status' => 'success',
        'data'   => $productos
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}