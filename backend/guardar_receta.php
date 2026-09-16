<?php
// backend/guardar_receta.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$id = isset($data['id']) && $data['id'] !== '' ? intval($data['id']) : null;
$nombre = trim($data['nombre'] ?? '');
$precio = floatval($data['precio'] ?? 0);
$ingredientes = $data['ingredientes'] ?? [];

if (empty($nombre) || $precio <= 0 || empty($ingredientes)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos e ingredientes son obligatorios.']);
    exit;
}

try {
    $pdo->beginTransaction();

    if ($id) {
        // ACTUALIZAR PRODUCTO EXISTENTE
        $stmt = $pdo->prepare("UPDATE productos_venta SET nombre = :nombre, precio = :precio WHERE id = :id");
        $stmt->execute(['nombre' => $nombre, 'precio' => $precio, 'id' => $id]);
        $productoId = $id;

        // Borrar ingredientes antiguos para reinsertar la receta actualizada
        $stmtDel = $pdo->prepare("DELETE FROM recetas WHERE producto_venta_id = :id");
        $stmtDel->execute(['id' => $productoId]);
    } else {
        // CREAR NUEVO PRODUCTO
        $stmt = $pdo->prepare("INSERT INTO productos_venta (nombre, precio) VALUES (:nombre, :precio)");
        $stmt->execute(['nombre' => $nombre, 'precio' => $precio]);
        $productoId = $pdo->lastInsertId();
    }

    // INSERTAR INGREDIENTES DE LA RECETA
    $stmtReceta = $pdo->prepare("INSERT INTO recetas (producto_venta_id, inventario_id, cantidad_requerida) VALUES (:producto_id, :inventario_id, :cantidad)");

    foreach ($ingredientes as $ing) {
        $stmtReceta->execute([
            'producto_id'   => $productoId,
            'inventario_id' => intval($ing['inventario_id']),
            'cantidad'      => floatval($ing['cantidad'])
        ]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Receta guardada correctamente.']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}