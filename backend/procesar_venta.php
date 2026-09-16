<?php
// backend/procesar_venta.php
ob_start();
session_start();
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/conexion.php';

    // Validar que un usuario esté conectado
    if (!isset($_SESSION['usuario_id']) || empty($_SESSION['usuario_id'])) {
        ob_end_clean();
        http_response_code(401);
        echo json_encode([
            'status' => 'error', 
            'message' => 'No hay una sesión activa. Debe iniciar sesión (Daniel, Alejandra, etc.) para registrar ventas.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $usuario_id = intval($_SESSION['usuario_id']);

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $items = $data['items'] ?? [];

    if (empty($items)) {
        ob_end_clean();
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El carrito está vacío.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $pdo->beginTransaction();

    // 1. Insertar la venta asociada directamente al usuario conectado (vendido_por)
    $stmtVenta = $pdo->prepare("INSERT INTO ventas (fecha_venta, vendido_por) VALUES (NOW(), :usuario_id)");
    $stmtVenta->execute(['usuario_id' => $usuario_id]);
    $venta_id = $pdo->lastInsertId();

    // 2. Consultas para recetas y descuento de insumos
    $stmtReceta = $pdo->prepare("SELECT inventario_id, cantidad_requerida FROM recetas WHERE producto_venta_id = :prod_id");
    $stmtDetalle = $pdo->prepare("INSERT INTO ventas_detalle_insumos (venta_id, inventario_id, cantidad_descontada) VALUES (:venta_id, :inv_id, :cant)");

    // 3. Procesar cada producto consumiendo insumos
    foreach ($items as $item) {
        $producto_venta_id = intval($item['id']);
        $cantidad_vendida = floatval($item['cantidad']);

        $stmtReceta->execute(['prod_id' => $producto_venta_id]);
        $ingredientes = $stmtReceta->fetchAll(PDO::FETCH_ASSOC);

        foreach ($ingredientes as $ing) {
            $descuento_total = floatval($ing['cantidad_requerida']) * $cantidad_vendida;

            $stmtDetalle->execute([
                'venta_id' => $venta_id,
                'inv_id'   => $ing['inventario_id'],
                'cant'     => $descuento_total
            ]);
        }
    }

    $pdo->commit();

    ob_end_clean();
    echo json_encode([
        'status'  => 'success',
        'message' => 'Venta registrada e inventario descontado con éxito.'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al procesar la venta: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}