<?php
// backend/guardar_inventario.php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion.php';

// Leer el cuerpo de la petición HTTP (JSON enviado por fetch)
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar que la información requerida exista
if (!$data || !isset($data['registros']) || empty($data['registros'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se enviaron datos válidos para actualizar.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Iniciar transacción SQL para asegurar consistencia
    $pdo->beginTransaction();

    // Preparar la sentencia de actualización por ID del producto
    $sql = "UPDATE inventario SET cantidad = :cantidad WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    // Recorrer los productos e iterar la actualización
    foreach ($data['registros'] as $item) {
        if (isset($item['id']) && isset($item['cantidad'])) {
            $stmt->execute([
                'cantidad' => floatval($item['cantidad']),
                'id'       => intval($item['id'])
            ]);
        }
    }

    // Confirmar los cambios en la base de datos
    $pdo->commit();

    echo json_encode([
        'status'  => 'success',
        'message' => 'Inventario actualizado correctamente.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Si hay algún error, revertir todos los cambios
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Error al guardar en la base de datos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}