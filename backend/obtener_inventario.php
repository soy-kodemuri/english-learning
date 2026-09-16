<?php
// Configurar el encabezado para responder en formato JSON y permitir UTF-8
header('Content-Type: application/json; charset=utf-8');

// Incluir la conexión PDO
require_once __DIR__ . '/conexion.php';

try {
    // ID del negocio que deseas consultar (puedes cambiarlo o recibirlo por GET)
    $negocio_id = isset($_GET['negocio_id']) ? intval($_GET['negocio_id']) : 1;

    // Consulta SQL para obtener los productos del inventario
    $sql = "SELECT id, nombre, unidad, cantidad, negocio_id, fecha_modificacion 
            FROM inventario 
            WHERE negocio_id = :negocio_id 
            ORDER BY id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['negocio_id' => $negocio_id]);

    // Obtener los registros como array asociativo
    $inventario = $stmt->fetchAll();

    // Retornar respuesta exitosa en JSON
    echo json_encode([
        'status' => 'success',
        'code'   => 200,
        'data'   => $inventario
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    // Retornar error estructurado en JSON si falla la consulta
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'code'    => 500,
        'message' => 'Error al obtener el inventario: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}