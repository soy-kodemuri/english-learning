<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/conexion.php';
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        $stmt = $pdo->query("
            SELECT m.*, i.nombre AS producto, i.unidad 
            FROM movimientos_sucursales m
            INNER JOIN inventario i ON m.inventario_id = i.id
            ORDER BY m.fecha DESC
        ");
        $movimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_end_clean();
        echo json_encode($movimientos);
        exit;
    }

    if ($metodo === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $id = isset($data['id']) && $data['id'] !== '' ? intval($data['id']) : null;
        $tipo = trim($data['tipo'] ?? '');
        $sucursal = trim($data['sucursal'] ?? '');
        $inventario_id = intval($data['inventario_id'] ?? 0);
        $cantidad = floatval($data['cantidad'] ?? 0);
        $observacion = trim($data['observacion'] ?? '');

        if (!in_array($tipo, ['ENTRADA', 'SALIDA']) || empty($sucursal) || $inventario_id <= 0 || $cantidad <= 0) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Campos obligatorios incompletos o cantidad inválida.']);
            exit;
        }

        if ($id) {
            $stmt = $pdo->prepare("
                UPDATE movimientos_sucursales 
                SET tipo = :tipo, sucursal = :sucursal, inventario_id = :inventario_id, cantidad = :cantidad, observacion = :observacion 
                WHERE id = :id
            ");
            $stmt->execute([
                'tipo' => $tipo,
                'sucursal' => $sucursal,
                'inventario_id' => $inventario_id,
                'cantidad' => $cantidad,
                'observacion' => $observacion,
                'id' => $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO movimientos_sucursales (tipo, sucursal, inventario_id, cantidad, observacion) 
                VALUES (:tipo, :sucursal, :inventario_id, :cantidad, :observacion)
            ");
            $stmt->execute([
                'tipo' => $tipo,
                'sucursal' => $sucursal,
                'inventario_id' => $inventario_id,
                'cantidad' => $cantidad,
                'observacion' => $observacion
            ]);
        }

        ob_end_clean();
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($metodo === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);

        if ($id <= 0) {
            ob_end_clean();
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID inválido.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM movimientos_sucursales WHERE id = :id");
        $stmt->execute(['id' => $id]);

        ob_end_clean();
        echo json_encode(['status' => 'success']);
        exit;
    }

} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}