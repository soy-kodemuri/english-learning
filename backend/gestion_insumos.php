<?php
// backend/gestion_insumos.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) && $data['id'] !== '' ? intval($data['id']) : null;
    $nombre = trim($data['nombre'] ?? '');
    $unidad = trim($data['unidad'] ?? '');

    if (empty($nombre) || empty($unidad)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El nombre y la unidad son obligatorios.']);
        exit;
    }

    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE inventario SET nombre = :nombre, unidad = :unidad WHERE id = :id");
            $stmt->execute(['nombre' => $nombre, 'unidad' => $unidad, 'id' => $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO inventario (nombre, unidad, cantidad) VALUES (:nombre, :unidad, 0)");
            $stmt->execute(['nombre' => $nombre, 'unidad' => $unidad]);
        }
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($metodo === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID inválido.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM inventario WHERE id = :id");
        $stmt->execute(['id' => $id]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}