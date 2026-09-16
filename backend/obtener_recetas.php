<?php
// backend/obtener_recetas.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

try {
    $sql = "SELECT 
                pv.id AS producto_id,
                pv.nombre AS producto_nombre,
                pv.precio AS producto_precio,
                i.id AS inventario_id,
                i.nombre AS ingrediente_nombre,
                i.unidad AS ingrediente_unidad,
                r.cantidad_requerida
            FROM productos_venta pv
            LEFT JOIN recetas r ON pv.id = r.producto_venta_id
            LEFT JOIN inventario i ON r.inventario_id = i.id
            ORDER BY pv.id ASC, i.nombre ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $filas = $stmt->fetchAll();

    // Agrupar los ingredientes por producto
    $productos = [];
    foreach ($filas as $fila) {
        $pId = $fila['producto_id'];
        
        if (!isset($productos[$pId])) {
            $productos[$pId] = [
                'id' => $fila['producto_id'],
                'nombre' => $fila['producto_nombre'],
                'precio' => floatval($fila['producto_precio']),
                'ingredientes' => []
            ];
        }

        if ($fila['inventario_id']) {
            $productos[$pId]['ingredientes'][] = [
                'inventario_id' => $fila['inventario_id'],
                'nombre' => $fila['ingrediente_nombre'],
                'unidad' => $fila['ingrediente_unidad'],
                'cantidad' => floatval($fila['cantidad_requerida'])
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'data'   => array_values($productos)
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al obtener las recetas: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}