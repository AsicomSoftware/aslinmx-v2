<?php
// Configuración de manejo de errores
error_reporting(E_ALL);
ini_set('display_errors', 0); // Cambiar a 1 solo para desarrollo
ini_set('log_errors', 1);
ini_set('error_log', './data/error.log');

// Función personalizada para manejo de errores
function manejarError($mensaje, $codigo = 500, $detalles = '')
{
    global $mainObj;

    // Log del error
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $referer = $_SERVER['HTTP_REFERER'] ?? 'unknown';

    $logMessage = "[$timestamp] ERROR - IP: $ip | Mensaje: $mensaje | Detalles: $detalles | User-Agent: $userAgent | Referer: $referer" . PHP_EOL;
    error_log($logMessage, 3, './data/error.log');

    // Respuesta al cliente
    $mainObj->mensaje = "Error interno del servidor. Por favor intenta más tarde.";
    $mainObj->codigo = $codigo;

    // En modo desarrollo, mostrar más detalles
    if (ini_get('display_errors')) {
        $mainObj->mensaje = $mensaje;
        if ($detalles) {
            $mainObj->detalles = $detalles;
        }
    }

    echo json_encode($mainObj, true);
    die();
}

// Función para logging de información
function logInfo($mensaje, $datos = [])
{
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $logMessage = "[$timestamp] INFO - IP: $ip | $mensaje";

    if (!empty($datos)) {
        $logMessage .= " | Datos: " . json_encode($datos);
    }

    $logMessage .= PHP_EOL;
    error_log($logMessage, 3, './data/error.log');
}

// Función para logging de advertencias
function logWarning($mensaje, $datos = [])
{
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $logMessage = "[$timestamp] WARNING - IP: $ip | $mensaje";

    if (!empty($datos)) {
        $logMessage .= " | Datos: " . json_encode($datos);
    }

    $logMessage .= PHP_EOL;
    error_log($logMessage, 3, './data/error.log');
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require "./vendor/autoload.php";

// Configuración del sistema de archivos
$data_dir = './data/';
$submissions_file = $data_dir . 'submissions.json';
$failed_attempts_file = $data_dir . 'failed_attempts.json';

// Crear directorio de datos si no existe
if (!file_exists($data_dir)) {
    mkdir($data_dir, 0755, true);
}

$mainObj = new stdClass();
$mainObj->mensaje = "";
$mainObj->codigo = 400;

// Función para leer datos del archivo JSON con manejo de errores
function leerDatosArchivo($archivo)
{
    try {
        if (!file_exists($archivo)) {
            logInfo("Archivo no existe, creando nuevo: $archivo");
            return [];
        }

        $contenido = file_get_contents($archivo);
        if ($contenido === false) {
            logWarning("No se pudo leer el archivo: $archivo");
            return [];
        }

        if (empty($contenido)) {
            logInfo("Archivo vacío: $archivo");
            return [];
        }

        $datos = json_decode($contenido, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logWarning("Error al decodificar JSON: " . json_last_error_msg() . " en archivo: $archivo");
            return [];
        }

        return $datos ?: [];
    } catch (Exception $e) {
        logWarning("Excepción al leer archivo $archivo: " . $e->getMessage());
        return [];
    }
}

// Función para escribir datos al archivo JSON con manejo de errores
function escribirDatosArchivo($archivo, $datos)
{
    try {
        $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            logWarning("Error al codificar JSON: " . json_last_error_msg());
            return false;
        }

        $resultado = file_put_contents($archivo, $json, LOCK_EX);
        if ($resultado === false) {
            logWarning("Error al escribir archivo: $archivo");
            return false;
        }

        logInfo("Archivo escrito exitosamente: $archivo");
        return true;
    } catch (Exception $e) {
        logWarning("Excepción al escribir archivo $archivo: " . $e->getMessage());
        return false;
    }
}

// Función para limpiar datos antiguos
function limpiarDatosAntiguos($datos, $horasLimite = 24)
{
    $tiempoLimite = time() - ($horasLimite * 3600);
    return array_filter($datos, function ($item) use ($tiempoLimite) {
        return isset($item['timestamp']) && $item['timestamp'] > $tiempoLimite;
    });
}

// Función para verificar rate limiting por IP usando archivos con manejo de errores
function verificarRateLimit($ip, $submissions_file, $horasLimite = 12)
{
    try {
        $submissions = leerDatosArchivo($submissions_file);

        // Limpiar datos antiguos
        $submissions = limpiarDatosAntiguos($submissions, $horasLimite);

        // Verificar si la IP ya envió un formulario en el período límite
        foreach ($submissions as $submission) {
            if (isset($submission['ip']) && $submission['ip'] === $ip) {
                logInfo("Rate limit excedido para IP: $ip");
                return false; // Ya envió un formulario recientemente
            }
        }

        logInfo("Rate limit OK para IP: $ip");
        return true; // Puede enviar el formulario
    } catch (Exception $e) {
        logWarning("Error en verificarRateLimit: " . $e->getMessage());
        return true; // En caso de error, permitir el envío
    }
}

// Función para registrar el envío del formulario con manejo de errores
function registrarEnvio($ip, $submissions_file, $userAgent = '', $referer = '')
{
    try {
        $submissions = leerDatosArchivo($submissions_file);

        // Limpiar datos antiguos (mantener solo últimos 7 días)
        $submissions = limpiarDatosAntiguos($submissions, 24 * 7);

        // Agregar nuevo envío
        $nuevoEnvio = [
            'ip' => $ip,
            'timestamp' => time(),
            'user_agent' => $userAgent,
            'referer' => $referer,
            'date' => date('Y-m-d H:i:s')
        ];

        $submissions[] = $nuevoEnvio;

        if (escribirDatosArchivo($submissions_file, $submissions)) {
            logInfo("Envío registrado exitosamente para IP: $ip", $nuevoEnvio);
            return true;
        } else {
            logWarning("Error al registrar envío para IP: $ip");
            return false;
        }
    } catch (Exception $e) {
        logWarning("Excepción al registrar envío: " . $e->getMessage());
        return false;
    }
}

// Rate limit adicional por email (sin requerir cambios en frontend)
function verificarRateLimitEmail($email, $submissions_file, $horasLimite = 12)
{
    if (!$email) {
        return true;
    }
    try {
        $submissions = leerDatosArchivo($submissions_file);
        $submissions = limpiarDatosAntiguos($submissions, $horasLimite);
        foreach ($submissions as $submission) {
            if (!empty($submission['email']) && strtolower($submission['email']) === strtolower($email)) {
                logInfo("Rate limit por email excedido: $email");
                return false;
            }
        }
        return true;
    } catch (Exception $e) {
        logWarning("Error en verificarRateLimitEmail: " . $e->getMessage());
        return true;
    }
}

// Bloqueo básico de dominios desechables
function esDominioDesechable($email)
{
    $dominio = strtolower(substr(strrchr($email, '@') ?: '', 1));
    if ($dominio === '') return false;
    $lista = [
        'mailinator.com','trashmail.com','tempmail.com','10minutemail.com','guerrillamail.com',
        'sharklasers.com','yopmail.com','getnada.com','dispostable.com','tempmailo.com'
    ];
    return in_array($dominio, $lista, true);
}

// Heurística simple de spam en contenido
function contieneSpam($texto)
{
    $textoLower = strtolower($texto);
    $palabras = [
        'viagra','porn','casino','loan','credit','usd','$$$','make money','free trial',
        'click here','bit.ly','tinyurl','http://','https://'
    ];
    $conteoLinks = substr_count($textoLower, 'http://') + substr_count($textoLower, 'https://');
    if ($conteoLinks > 3) return true;
    foreach ($palabras as $w) {
        if (strpos($textoLower, $w) !== false) return true;
    }
    return false;
}

// Utilidades para detectar texto "gibberish" o aleatorio
function normalizarTextoBasico($t)
{
    $t = trim($t);
    // Quitar acentos para conteos
    $t = iconv('UTF-8', 'ASCII//TRANSLIT', $t);
    return $t;
}

function proporcionVocales($t)
{
    $t = normalizarTextoBasico($t);
    $soloLetras = preg_replace('/[^a-z]/i', '', $t);
    if ($soloLetras === '') return 0;
    preg_match_all('/[aeiou]/i', $soloLetras, $m);
    $vocales = count($m[0]);
    return $vocales / max(strlen($soloLetras), 1);
}

function tieneConsonantesSeguidas($t, $n = 5)
{
    return preg_match('/[bcdfghjklmnpqrstvwxyz]{' . (int)$n . ',}/i', normalizarTextoBasico($t)) === 1;
}

function pareceBase64oHash($t)
{
    $t = trim($t);
    if (preg_match('/^[A-Za-z0-9+\/=]{20,}$/', $t)) return true;
    if (preg_match('/^[A-Fa-f0-9]{24,}$/', $t)) return true; // hex largo
    return false;
}

function esGibberish($t)
{
    $tNorm = normalizarTextoBasico($t);
    $len = strlen($tNorm);
    if ($len >= 12 && strpos($tNorm, ' ') === false) {
        // Palabra única muy larga sin espacios
        if (proporcionVocales($tNorm) < 0.25 || tieneConsonantesSeguidas($tNorm, 5)) return true;
    }
    if (tieneConsonantesSeguidas($tNorm, 6)) return true;
    if (pareceBase64oHash($tNorm)) return true;
    // Alternancia extraña de may/min y muchos caracteres únicos
    $unique = count(array_unique(str_split(strtolower(preg_replace('/\s+/', '', $tNorm)))));
    if ($len > 14 && $unique > ($len * 0.7)) return true;
    return false;
}

function validarNombreHumano($nombre)
{
    $n = trim($nombre);
    if ($n === '') return false;
    // Solo letras, espacios, guiones y apóstrofes
    if (!preg_match("/^[\p{L}][\p{L}'\-\s]{1,99}$/u", $n)) return false;
    // Debe tener al menos 2 palabras o 5 caracteres
    if (mb_strlen($n, 'UTF-8') < 5 && count(preg_split('/\s+/', $n)) < 2) return false;
    if (esGibberish($n)) return false;
    return true;
}

function emailLocalGibberish($email)
{
    $parts = explode('@', $email, 2);
    if (count($parts) < 2) return true;
    $local = $parts[0];
    // local con muchas consonantes seguidas o sin vocales
    if (strlen($local) > 12 && proporcionVocales($local) < 0.2) return true;
    if (tieneConsonantesSeguidas($local, 6)) return true;
    return false;
}

// Función para registrar intentos fallidos con manejo de errores
function registrarIntentoFallido($ip, $reason, $failed_attempts_file, $userAgent = '')
{
    try {
        $attempts = leerDatosArchivo($failed_attempts_file);

        // Limpiar datos antiguos (mantener solo últimos 7 días)
        $attempts = limpiarDatosAntiguos($attempts, 24 * 7);

        // Agregar nuevo intento fallido
        $nuevoIntento = [
            'ip' => $ip,
            'reason' => $reason,
            'timestamp' => time(),
            'user_agent' => $userAgent,
            'date' => date('Y-m-d H:i:s')
        ];

        $attempts[] = $nuevoIntento;

        if (escribirDatosArchivo($failed_attempts_file, $attempts)) {
            logInfo("Intento fallido registrado para IP: $ip", $nuevoIntento);
            return true;
        } else {
            logWarning("Error al registrar intento fallido para IP: $ip");
            return false;
        }
    } catch (Exception $e) {
        logWarning("Excepción al registrar intento fallido: " . $e->getMessage());
        return false;
    }
}

// Obtener IP real del cliente con validación
function obtenerIPReal()
{
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];

    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    logInfo("IP detectada: $ip desde $key");
                    return $ip;
                }
            }
        }
    }

    $fallbackIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    logWarning("Usando IP de fallback: $fallbackIP");
    return $fallbackIP;
}

// Obtener datos del cliente ANTES de cualquier uso
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
// Normalización ligera para evitar comillas extrañas en logs y sanitizar URL
$userAgent = trim($userAgent, "\"'");
$referer = filter_var($referer, FILTER_SANITIZE_URL) ?: '';

// Verificar rate limiting antes de procesar el formulario
$ip_cliente = obtenerIPReal();
if (!verificarRateLimit($ip_cliente, $submissions_file, 12)) {
    registrarIntentoFallido($ip_cliente, 'Rate limit exceeded', $failed_attempts_file, $userAgent);
    $mainObj->mensaje = "Has enviado un formulario recientemente. Por favor espera 12 horas antes de enviar otro.";
    $mainObj->codigo = 429; // Too Many Requests
    echo json_encode($mainObj, true);
    die();
}

// Validación de método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    registrarIntentoFallido($ip_cliente, 'Invalid HTTP method', $failed_attempts_file, $userAgent);
    $mainObj->mensaje = "Método no permitido";
    $mainObj->codigo = 405;
    echo json_encode($mainObj, true);
    die();
}

// Validación de headers CSRF básica (corrección de strpos)
if (empty($_SERVER['HTTP_REFERER']) || strpos($_SERVER['HTTP_REFERER'], $_SERVER['HTTP_HOST']) === false) {
    registrarIntentoFallido($ip_cliente, 'Invalid referer domain', $failed_attempts_file, $userAgent);
    $mainObj->mensaje = "Origen no válido";
    $mainObj->codigo = 403;
    echo json_encode($mainObj, true);
    die();
}

// Validación de reCAPTCHA con manejo de errores
if (!isset($_POST['g-recaptcha-response']) || $_POST['g-recaptcha-response'] == '') {
    registrarIntentoFallido($ip_cliente, 'Missing reCAPTCHA', $failed_attempts_file, $userAgent);
    $mainObj->mensaje = "Recaptcha no recibido";
    echo json_encode($mainObj, true);
    die();
} else {
    try {
        $obj = new stdClass();
        $obj->secret = "6LdGogEqAAAAANxY-olw-DPPENb8-cpGdExQBRTZ";
        $obj->response = $_POST['g-recaptcha-response'];
        $obj->remoteip = $ip_cliente;
        $url = 'https://www.google.com/recaptcha/api/siteverify';

        $options = array(
            'http' => array(
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($obj),
                'timeout' => 10 // Timeout de 10 segundos
            )
        );

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        if ($result === false) {
            logWarning("Error al conectar con reCAPTCHA para IP: $ip_cliente");
            manejarError("Error de conexión con reCAPTCHA", 500, "No se pudo conectar con el servicio de verificación");
        }

        $validar = json_decode($result);
        if (json_last_error() !== JSON_ERROR_NONE) {
            logWarning("Error al decodificar respuesta de reCAPTCHA: " . json_last_error_msg());
            manejarError("Error de validación de reCAPTCHA", 500, "Respuesta inválida del servicio de verificación");
        }

        logInfo("reCAPTCHA validado para IP: $ip_cliente", ['success' => $validar->success ?? false]);
    } catch (Exception $e) {
        logWarning("Excepción en validación reCAPTCHA: " . $e->getMessage());
        manejarError("Error interno en validación", 500, $e->getMessage());
    }

    /* FIN DE CAPTCHA */

    if ($validar->success) {

        // Validación mejorada de campos con sanitización
        $nombre = isset($_POST["nombre"]) ? trim($_POST["nombre"]) : "";
        $email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
        $asunto = isset($_POST["asunto"]) ? trim($_POST["asunto"]) : "";
        $mensaje = isset($_POST["mensaje"]) ? trim($_POST["mensaje"]) : "";

        // Validaciones de campos vacíos
        if ($nombre == "") {
            $mainObj->mensaje = "Falta el campo Nombre.";
            echo json_encode($mainObj, true);
            die();
        } elseif ($email == "") {
            $mainObj->mensaje = "Falta el campo Email.";
            echo json_encode($mainObj, true);
            die();
        } elseif ($asunto == "") {
            $mainObj->mensaje = "Falta el campo Asunto.";
            echo json_encode($mainObj, true);
            die();
        } elseif ($mensaje == "") {
            $mainObj->mensaje = "Falta el campo Mensaje.";
            echo json_encode($mainObj, true);
            die();
        }

        // Validación de formato de email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $mainObj->mensaje = "El formato del email no es válido.";
            echo json_encode($mainObj, true);
            die();
        }

        // Validaciones semánticas anti-gibberish
        if (!validarNombreHumano($nombre)) {
            registrarIntentoFallido($ip_cliente, 'Invalid human name', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El nombre no parece válido.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        if (emailLocalGibberish($email)) {
            registrarIntentoFallido($ip_cliente, 'Gibberish email local-part', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El email no parece válido.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        if (esGibberish($asunto) || mb_strlen($asunto, 'UTF-8') < 5) {
            registrarIntentoFallido($ip_cliente, 'Gibberish subject', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El asunto no parece válido.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        $palabrasMensaje = preg_split('/\s+/', trim($mensaje));
        if (esGibberish($mensaje) || mb_strlen($mensaje, 'UTF-8') < 20 || count($palabrasMensaje) < 5) {
            registrarIntentoFallido($ip_cliente, 'Gibberish message', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El mensaje es demasiado corto o no es válido.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        // Validación de longitud de campos
        if (strlen($nombre) > 100) {
            $mainObj->mensaje = "El nombre es demasiado largo (máximo 100 caracteres).";
            echo json_encode($mainObj, true);
            die();
        }
        if (strlen($email) > 255) {
            $mainObj->mensaje = "El email es demasiado largo (máximo 255 caracteres).";
            echo json_encode($mainObj, true);
            die();
        }
        if (strlen($asunto) > 200) {
            $mainObj->mensaje = "El asunto es demasiado largo (máximo 200 caracteres).";
            echo json_encode($mainObj, true);
            die();
        }
        if (strlen($mensaje) > 2000) {
            $mainObj->mensaje = "El mensaje es demasiado largo (máximo 2000 caracteres).";
            echo json_encode($mainObj, true);
            die();
        }

        // Sanitización adicional
        $nombre = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
        $email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
        $asunto = htmlspecialchars($asunto, ENT_QUOTES, 'UTF-8');
        $mensaje = htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8');

        // Controles anti-bot adicionales
        if (!verificarRateLimitEmail($email, $submissions_file, 12)) {
            registrarIntentoFallido($ip_cliente, 'Rate limit by email exceeded', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "Has enviado un formulario recientemente con este email.";
            $mainObj->codigo = 429;
            echo json_encode($mainObj, true);
            die();
        }

        if (esDominioDesechable($email)) {
            registrarIntentoFallido($ip_cliente, 'Disposable email domain', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El dominio del email no es aceptado.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        if (contieneSpam($mensaje) || contieneSpam($asunto)) {
            registrarIntentoFallido($ip_cliente, 'Spam heuristics triggered', $failed_attempts_file, $userAgent);
            $mainObj->mensaje = "El contenido parece spam. Ajusta el mensaje e inténtalo de nuevo.";
            $mainObj->codigo = 400;
            echo json_encode($mainObj, true);
            die();
        }

        $mail = new PHPMailer(true);

        $consulta = "
                    <h3>Sección Contáctanos en Asicom</h3>
                    <strong>Nombre:</strong> $nombre
                    <br>
                    <strong>E-mail:</strong> $email
                    <br>
                    <strong>Asunto:</strong> $asunto
                    <br>
                    <strong>Mensaje:</strong> $mensaje
                    <br><br>
                    <small>Enviado desde IP: $ip_cliente</small>
                    ";

        try {
            logInfo("Iniciando envío de correo para IP: $ip_cliente", ['email' => $email, 'asunto' => $asunto]);

            // Configuración del servidor SMTP
            $mail->isSMTP();                                            // Usar SMTP
            $mail->Host       = 'smtp.gmail.com';                     // Especificar el servidor SMTP principal
            $mail->SMTPAuth   = true;                                   // Habilitar autenticación SMTP
            $mail->Username   = 'rhs120600@gmail.com';                 // Tu correo electrónico SMTP
            $mail->Password   = 'fvla amly pqql ewkd';                 // Tu contraseña SMTP
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Habilitar TLS
            $mail->Port       = 587;                                    // Puerto TCP para TLS
            $mail->Timeout    = 30;                                     // Timeout de 30 segundos

            // Destinatarios
            $mail->setFrom('rhs120600@gmail.com', 'Contactos');        // Remitente
            $mail->addAddress('contacto@asicomsystems.com.mx', 'Contacto');  // Añadir un destinatario
            $mail->addReplyTo($email, $nombre); // Dirección de respuesta opcional

            // Contenido del correo
            $mail->isHTML(true);                                        // Establecer el formato de correo electrónico a HTML
            $mail->Subject = $asunto;
            $mail->Body    = $consulta;
            $mail->AltBody = strip_tags($consulta);

            $resultadoEnvio = $mail->send();

            if ($resultadoEnvio) {
                logInfo("Correo enviado exitosamente para IP: $ip_cliente");

                // Registrar el envío exitoso en el archivo
                // Ampliamos el registro para incluir email y asunto (siempre que existan)
                $registroOk = (function() use ($ip_cliente, $submissions_file, $userAgent, $referer, $email, $asunto) {
                    // Cargamos, añadimos email/asunto y escribimos reutilizando helpers existentes
                    $submissions = leerDatosArchivo($submissions_file);
                    $submissions = limpiarDatosAntiguos($submissions, 24 * 7);
                    $submissions[] = [
                        'ip' => $ip_cliente,
                        'timestamp' => time(),
                        'user_agent' => $userAgent,
                        'referer' => $referer,
                        'email' => $email,
                        'subject' => $asunto,
                        'date' => date('Y-m-d H:i:s')
                    ];
                    return escribirDatosArchivo($submissions_file, $submissions);
                })();

                if ($registroOk) {
                    $mainObj->codigo = 200;
                    $mainObj->mensaje = "Se envió correctamente el mensaje.";
                    echo json_encode($mainObj, true);
                    die();
                } else {
                    logWarning("Correo enviado pero error al registrar en archivo para IP: $ip_cliente");
                    $mainObj->codigo = 200;
                    $mainObj->mensaje = "Se envió correctamente el mensaje.";
                    echo json_encode($mainObj, true);
                    die();
                }
            } else {
                logWarning("Error al enviar correo para IP: $ip_cliente - Error: {$mail->ErrorInfo}");
                manejarError("Error al enviar correo", 500, $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            logWarning("Excepción al enviar correo para IP: $ip_cliente - " . $e->getMessage());
            manejarError("Error interno al enviar correo", 500, $e->getMessage());
        }
    } else {
        registrarIntentoFallido($ip_cliente, 'reCAPTCHA validation failed', $failed_attempts_file, $userAgent);
        $mainObj->mensaje = "El reCaptcha caducó, recarga la página e intenta de nuevo.";
        echo json_encode($mainObj, true);
        die();
    }
}

echo json_encode($mainObj, true);
