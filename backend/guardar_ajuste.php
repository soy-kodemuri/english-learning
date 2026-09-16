<?php
// Limpiar cualquier espacio o salida previa para no romper el JSON
ob_start();

header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/conexion.php';

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $inventario_id = intval($data['inventario_id'] ?? 0);
    $cantidad_real = floatval($data['cantidad_real'] ?? -1);
    $responsable = trim($data['responsable'] ?? '');

    if ($inventario_id <= 0 || $cantidad_real < 0 || empty($responsable)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios o la cantidad es inválida.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO inventario_fisico (inventario_id, cantidad_inicial, responsable) VALUES (:id, :cant, :resp)");
    $stmt->execute([
        'id'   => $inventario_id,
        'cant' => $cantidad_real,
        'resp' => $responsable
    ]);

    ob_end_clean();
    echo json_encode(['status' => 'success', 'message' => 'Ajuste guardado correctamente.']);
    exit;

} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Error de servidor: ' . $e->getMessage()
    ]);
    exit;
}