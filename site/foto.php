<?php
/* =====================================================================
   KGL STORE — FOTO DO CARD DE PRÉVIA
   Entrega a 1ª foto do anúncio em 800×800 (leve, como o WhatsApp gosta),
   buscando no armazenamento privado do Supabase. Só funciona para
   aparelhos/acessórios publicados e disponíveis.
   ===================================================================== */
require __DIR__ . '/compartilhar.php';

$tipo = ($_GET['tipo'] ?? '') === 'acessorio' ? 'acessorio' : 'aparelho';
$id = $_GET['id'] ?? '';
$item = kgl_item($tipo, $id);
$caminho = $item['fotos'][0] ?? null;

function kgl_reserva() {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=3600');
    readfile(__DIR__ . '/img/compartilhar.jpg');
    exit;
}
if (!$caminho) kgl_reserva();

$cache = kgl_pasta_cache() . '/foto-' . sha1($caminho) . '.jpg';
if (!is_file($cache)) {
    $cfg = kgl_config();
    $partes = implode('/', array_map('rawurlencode', explode('/', $caminho)));
    $r = kgl_http('POST', $cfg['url'] . '/storage/v1/object/sign/' . $cfg['bucket'] . '/' . $partes, ['expiresIn' => 300]);
    $assinado = $r ? (json_decode($r, true)['signedURL'] ?? null) : null;
    if (!$assinado) kgl_reserva();
    $ch = curl_init($cfg['url'] . '/storage/v1' . (str_starts_with($assinado, '/') ? '' : '/') . $assinado);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_FOLLOWLOCATION => true]);
    $bin = curl_exec($ch); $st = curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    if ($bin === false || $st !== 200) kgl_reserva();

    $ok = false;
    if (function_exists('imagecreatefromstring') && ($src = @imagecreatefromstring($bin))) {
        $w = imagesx($src); $h = imagesy($src); $lado = min($w, $h);
        $x = (int)(($w - $lado) / 2); $y = (int)(($h - $lado) / 2.2);   // quadrado, um pouco acima do centro
        $dst = imagecreatetruecolor(800, 800);
        imagecopyresampled($dst, $src, 0, 0, $x, $y, 800, 800, $lado, $lado);
        $ok = imagejpeg($dst, $cache, 82);
        imagedestroy($src); imagedestroy($dst);
    }
    if (!$ok) { file_put_contents($cache, $bin); }
}
header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=86400');
readfile($cache);
