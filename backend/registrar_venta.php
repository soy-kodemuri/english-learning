<?php
// backend/registrar_venta.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$producto_venta_id = $data['producto_venta_id'] ?? null;
$cantidad_ordenes  = intval($data['cantidad_ordenes'] ?? 1); // ej. 5
$usuario_id        = intval($data['usuario_id'] ?? 1);

if (!$producto_venta_id || $cantidad_ordenes <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Datos de la orden no válidos.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Obtener precio del platillo
    $stmtPrecio = $pdo->prepare("SELECT precio FROM productos_venta WHERE id = :p_id");
    $stmtPrecio->execute(['p_id' => $producto_venta_id]);
    $platillo = $stmtPrecio->fetch();

    if (!$platillo) throw new Exception("Platillo no encontrado.");

    $totalVenta = $platillo['precio'] * $cantidad_ordenes;

    // 2. Guardar el registro de la venta
    $sqlVenta = "INSERT INTO ventas (producto_venta_id, cantidad_ordenes, total_venta, vendido_por) 
                 VALUES (:p_id, :cant, :total, :usr)";
    $stmtVenta = $pdo->prepare($sqlVenta);
    $stmtVenta->execute([
        'p_id'  => $producto_venta_id,
        'cant'  => $cantidad_ordenes,
        'total' => $totalVenta,
        'usr'   => $usuario_id
    ]);

    // 3. Obtener la receta del platillo
    $sqlReceta = "SELECT inventario_id, cantidad_requerida FROM recetas WHERE producto_venta_id = :p_id";
    $stmtReceta = $pdo->prepare($sqlReceta);
    $stmtReceta->execute(['p_id' => $producto_venta_id]);
    $ingredientes = $stmtReceta->fetchAll();

    // 4. Descontar el stock según la cantidad de órdenes vendidas
    $sqlDescontar = "UPDATE inventario SET cantidad = cantidad - :descuento WHERE id = :inv_id";
    $stmtDescontar = $pdo->prepare($sqlDescontar);

    foreach ($ingredientes as $ingrediente) {
        $totalArestar = $ingrediente['cantidad_requerida'] * $cantidad_ordenes;
        $stmtDescontar->execute([
            'descuento' => $totalArestar,
            'inv_id'    => $ingrediente['inventario_id']
        ]);
    }

    $pdo->commit();
    echo json_encode([
        'status'  => 'success', 
        'message' => "Se registraron $cantidad_ordenes órdenes y se descontó el stock correctamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}