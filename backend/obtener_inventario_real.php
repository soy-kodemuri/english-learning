<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/conexion.php';

    $sql = "
        SELECT 
            i.id,
            i.nombre AS producto,
            i.unidad,
            
            -- Conteo Inicial (Físico o Inventario Base)
            COALESCE(ultimo_conteo.cantidad_inicial, i.cantidad) AS cantidad_inicial,
            ultimo_conteo.fecha_captura AS fecha_conteo,
            
            -- Entradas recibidas de otras sucursales (SUMAN)
            COALESCE((
                SELECT SUM(ms.cantidad)
                FROM movimientos_sucursales ms
                WHERE ms.inventario_id = i.id 
                  AND ms.tipo = 'ENTRADA'
                  AND (ultimo_conteo.fecha_captura IS NULL OR ms.fecha >= ultimo_conteo.fecha_captura)
            ), 0) AS total_entradas_sucursal,

            -- Salidas prestadas a otras sucursales (RESTAN)
            COALESCE((
                SELECT SUM(ms.cantidad)
                FROM movimientos_sucursales ms
                WHERE ms.inventario_id = i.id 
                  AND ms.tipo = 'SALIDA'
                  AND (ultimo_conteo.fecha_captura IS NULL OR ms.fecha >= ultimo_conteo.fecha_captura)
            ), 0) AS total_salidas_sucursal,

            -- Suma del consumo REAL CONGELADO en las ventas registradas
            COALESCE((
                SELECT SUM(vdi.cantidad_descontada)
                FROM ventas_detalle_insumos vdi
                INNER JOIN ventas v ON vdi.venta_id = v.id
                WHERE vdi.inventario_id = i.id
                  AND (ultimo_conteo.fecha_captura IS NULL OR v.fecha_venta >= ultimo_conteo.fecha_captura)
            ), 0) AS total_vendido,

            -- Stock Real Final: Base + Entradas - Salidas - Ventas
            (
                COALESCE(ultimo_conteo.cantidad_inicial, i.cantidad)
                + COALESCE((
                    SELECT SUM(ms.cantidad)
                    FROM movimientos_sucursales ms
                    WHERE ms.inventario_id = i.id AND ms.tipo = 'ENTRADA'
                      AND (ultimo_conteo.fecha_captura IS NULL OR ms.fecha >= ultimo_conteo.fecha_captura)
                ), 0)
                - COALESCE((
                    SELECT SUM(ms.cantidad)
                    FROM movimientos_sucursales ms
                    WHERE ms.inventario_id = i.id AND ms.tipo = 'SALIDA'
                      AND (ultimo_conteo.fecha_captura IS NULL OR ms.fecha >= ultimo_conteo.fecha_captura)
                ), 0)
                - COALESCE((
                    SELECT SUM(vdi.cantidad_descontada)
                    FROM ventas_detalle_insumos vdi
                    INNER JOIN ventas v ON vdi.venta_id = v.id
                    WHERE vdi.inventario_id = i.id
                      AND (ultimo_conteo.fecha_captura IS NULL OR v.fecha_venta >= ultimo_conteo.fecha_captura)
                ), 0)
            ) AS stock_real

        FROM inventario i

        -- Subconsulta del último conteo físico
        LEFT JOIN (
            SELECT f1.inventario_id, f1.cantidad_inicial, f1.fecha_captura
            FROM inventario_fisico f1
            INNER JOIN (
                SELECT inventario_id, MAX(fecha_captura) AS max_fecha
                FROM inventario_fisico
                GROUP BY inventario_id
            ) f2 ON f1.inventario_id = f2.inventario_id AND f1.fecha_captura = f2.max_fecha
        ) ultimo_conteo ON i.id = ultimo_conteo.inventario_id

        ORDER BY i.id ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $inventario = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear numéricos
    foreach ($inventario as &$item) {
        $item['id'] = intval($item['id']);
        $item['cantidad_inicial'] = floatval($item['cantidad_inicial']);
        $item['total_entradas_sucursal'] = floatval($item['total_entradas_sucursal']);
        $item['total_salidas_sucursal'] = floatval($item['total_salidas_sucursal']);
        $item['total_vendido'] = floatval($item['total_vendido']);
        $item['stock_real'] = floatval($item['stock_real']);
    }

    ob_end_clean();
    echo json_encode([
        'status' => 'success',
        'data'   => $inventario
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al calcular inventario real: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}