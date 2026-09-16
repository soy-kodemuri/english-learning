<?php
// Cargar las constantes de configuración
require_once __DIR__ . '/configuracion.php';

// Cadena de conexión DSN usando las constantes
$dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

// Opciones de configuración de PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Manejo de excepciones
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Arrays asociativos por defecto
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Consultas preparadas reales
];

try {
    // Instancia global de PDO
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
} catch (PDOException $e) {
    exit("Error de conexión a la base de datos: " . $e->getMessage());
}