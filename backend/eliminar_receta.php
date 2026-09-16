<?php
// backend/eliminar_receta.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$id = intval($data['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'ID inválido.']);
    exit;
}

try {
    // Al eliminar de productos_venta, CASCADE eliminará las entradas en recetas
    $stmt = $pdo->prepare("DELETE FROM productos_venta WHERE id = :id");
    $stmt->execute(['id' => $id]);

    echo json_encode(['status' => 'success', 'message' => 'Receta eliminada correctamente.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}