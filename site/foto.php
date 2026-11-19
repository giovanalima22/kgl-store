<?php
/* =====================================================================
   KGL STORE — IMAGEM DO CARD DE PRÉVIA (1200×630)
   Monta a arte do link com a 1ª FOTO REAL do anúncio + modelo,
   armazenamento, cor, bateria, estado, preço e um chamado para ver
   as fotos. É o formato que WhatsApp, Instagram e Facebook esperam.
   Só funciona para aparelhos/acessórios publicados e disponíveis.
   ===================================================================== */
require __DIR__ . '/compartilhar.php';

$tipo = ($_GET['tipo'] ?? '') === 'acessorio' ? 'acessorio' : 'aparelho';
$id = $_GET['id'] ?? '';
$item = kgl_item($tipo, $id);

function kgl_reserva() {
    header('Content-Type: image/jpeg');
    header('Cache-Control: public, max-age=3600');
    readfile(__DIR__ . '/img/compartilhar.jpg');
    exit;
}
if (!$item || empty($item['fotos'][0]) || !function_exists('imagecreatetruecolor')) kgl_reserva();

$cache = kgl_pasta_cache() . '/card-' . $tipo . '-' . sha1(json_encode($item)) . '.jpg';
if (!is_file($cache)) {
    $bin = kgl_baixar_foto($item['fotos'][0]);
    if (!$bin || !($foto = @imagecreatefromstring($bin))) kgl_reserva();
    $img = kgl_montar_card($tipo, $item, $foto);
    imagejpeg($img, $cache, 86);
    imagedestroy($img); imagedestroy($foto);
}
header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=86400');
readfile($cache);

/* ---------- funções ---------- */
function kgl_baixar_foto($caminho) {
    $cfg = kgl_config();
    $partes = implode('/', array_map('rawurlencode', explode('/', $caminho)));
    $r = kgl_http('POST', $cfg['url'] . '/storage/v1/object/sign/' . $cfg['bucket'] . '/' . $partes, ['expiresIn' => 300]);
    $assinado = $r ? (json_decode($r, true)['signedURL'] ?? null) : null;
    if (!$assinado) return null;
    $ch = curl_init($cfg['url'] . '/storage/v1' . (str_starts_with($assinado, '/') ? '' : '/') . $assinado);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_FOLLOWLOCATION => true]);
    $bin = curl_exec($ch); $st = curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    return ($bin !== false && $st === 200) ? $bin : null;
}

function kgl_cor($img, $hex, $alfa = 0) {
    return imagecolorallocatealpha($img, hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2)), $alfa);
}
function kgl_fonte($n) { return __DIR__ . '/fontes/ttf/' . $n . '.ttf'; }
function kgl_largura($tam, $fonte, $txt) { $b = imagettfbbox($tam, 0, $fonte, $txt); return $b[2] - $b[0]; }
function kgl_texto($img, $tam, $fonte, $x, $y, $cor, $txt) { imagettftext($img, $tam, 0, (int)$x, (int)$y, $cor, $fonte, $txt); }
/* reduz o tamanho até caber na largura */
function kgl_caber($txt, $fonte, $tam, $max) { while ($tam > 20 && kgl_largura($tam, $fonte, $txt) > $max) $tam -= 2; return $tam; }
/* quebra em até 2 linhas */
function kgl_quebrar($txt, $fonte, $tam, $max) {
    $pal = explode(' ', $txt); $l1 = ''; $i = 0;
    for (; $i < count($pal); $i++) { $t = trim($l1 . ' ' . $pal[$i]); if (kgl_largura($tam, $fonte, $t) > $max && $l1 !== '') break; $l1 = $t; }
    $l2 = trim(implode(' ', array_slice($pal, $i)));
    while ($l2 !== '' && kgl_largura($tam, $fonte, $l2 . '…') > $max) $l2 = mb_substr($l2, 0, -1);
    return $l2 !== '' && $i < count($pal) && kgl_largura($tam, $fonte, implode(' ', array_slice($pal, $i))) > $max ? [$l1, rtrim($l2) . '…'] : array_filter([$l1, $l2]);
}
function kgl_pilula($img, $x, $y, $txt, $fonte, $tam, $fundo, $cor, $padX = 18, $alt = 46) {
    $w = kgl_largura($tam, $fonte, $txt) + $padX * 2; $r = $alt / 2;
    imagefilledrectangle($img, (int)($x + $r), $y, (int)($x + $w - $r), $y + $alt, $fundo);
    imagefilledellipse($img, (int)($x + $r), (int)($y + $r), $alt, $alt, $fundo);
    imagefilledellipse($img, (int)($x + $w - $r), (int)($y + $r), $alt, $alt, $fundo);
    kgl_texto($img, $tam, $fonte, $x + $padX, $y + $alt / 2 + $tam * 0.36, $cor, $txt);
    return $w;
}

function kgl_montar_card($tipo, $i, $foto) {
    $W = 1200; $H = 630;
    $img = imagecreatetruecolor($W, $H);
    imagealphablending($img, true);
    imagefill($img, 0, 0, kgl_cor($img, '0a0a0b'));
    // brilho dourado suave
    for ($k = 60; $k > 0; $k--) {
        imagefilledellipse($img, 260, 760, 1300 * $k / 60, 900 * $k / 60, kgl_cor($img, '785820', 127 - (int)(1.1 * (60 - $k) / 60 * 40) - 0));
    }

    // ---- foto real à direita, com cantos arredondados ----
    $px = 690; $py = 34; $pw = 476; $ph = 562; $raio = 30;
    $sw = imagesx($foto); $sh = imagesy($foto);
    $esc = max($pw / $sw, $ph / $sh); $cw = $pw / $esc; $ch = $ph / $esc;
    $cx = ($sw - $cw) / 2; $cy = ($sh - $ch) / 2.4;
    $painel = imagecreatetruecolor($pw, $ph);
    imagealphablending($painel, false); imagesavealpha($painel, true);
    imagecopyresampled($painel, $foto, 0, 0, (int)$cx, (int)$cy, $pw, $ph, (int)$cw, (int)$ch);
    $transp = imagecolorallocatealpha($painel, 0, 0, 0, 127);
    foreach ([[0, 0], [$pw - $raio, 0], [0, $ph - $raio], [$pw - $raio, $ph - $raio]] as [$ox, $oy]) {
        $ccx = $ox === 0 ? $raio : $pw - $raio; $ccy = $oy === 0 ? $raio : $ph - $raio;
        for ($x = $ox; $x < $ox + $raio; $x++) for ($y = $oy; $y < $oy + $raio; $y++) {
            if (($x - $ccx + 0.5) ** 2 + ($y - $ccy + 0.5) ** 2 > $raio * $raio) imagesetpixel($painel, $x, $y, $transp);
        }
    }
    imagealphablending($img, true);
    imagecopy($img, $painel, $px, $py, 0, 0, $pw, $ph);
    imagedestroy($painel);

    // ---- cores e fontes ----
    $branco = kgl_cor($img, 'ffffff'); $cinza = kgl_cor($img, 'a5a5ab'); $ouro = kgl_cor($img, 'c9a45c');
    $ouroClaro = kgl_cor($img, 'e7cf9a'); $chip = kgl_cor($img, '1f1f23'); $escuro = kgl_cor($img, '17181b');
    $f8 = kgl_fonte('interdisplay-800'); $f6 = kgl_fonte('inter-600'); $f4 = kgl_fonte('inter-400');
    $x = 70; $max = 580;

    // ---- logo ----
    imagefilledrectangle($img, $x + 5, 56, $x + 23, 100, $branco);
    imagefilledellipse($img, $x + 5, 61, 10, 10, $branco); imagefilledellipse($img, $x + 23, 61, 10, 10, $branco);
    imagefilledellipse($img, $x + 5, 95, 10, 10, $branco); imagefilledellipse($img, $x + 23, 95, 10, 10, $branco);
    imagefilledrectangle($img, $x, 61, $x + 28, 95, $branco);
    imagefilledrectangle($img, $x + 9, 60, $x + 19, 63, $escuro);
    imagesetthickness($img, 7);
    imageline($img, $x + 36, 78, $x + 49, 58, $ouro); imageline($img, $x + 36, 78, $x + 49, 98, $ouro);
    imagesetthickness($img, 1);
    kgl_texto($img, 30, $f8, $x + 60, 92, $branco, 'KGL');
    kgl_texto($img, 13, $f6, $x + 60 + kgl_largura(30, $f8, 'KGL') + 10, 90, $ouro, 'S T O R E');

    // ---- textos do produto ----
    if ($tipo === 'acessorio') {
        $rotulo = mb_strtoupper($i['marca'] ?? '');
        $linhas = array_map(fn($l) => [$l, 44], kgl_quebrar($i['nome'], $f8, 44, $max));
        $sub = implode(' · ', array_filter([$i['categoria'] ?? '', $i['cor'] ?? '']));
        $chips = [$i['compatibilidade'] ? 'Para ' . $i['compatibilidade'] : 'Universal'];
        if (!empty($i['poucas_unidades'])) $chips[] = 'Últimas unidades';
        if (count($linhas) > 1) { $sub = ''; array_unshift($chips, $i['categoria'] ?? ''); $chips = array_values(array_filter($chips)); }
        $cta = 'Peça pelo WhatsApp  →';
    } else {
        $rotulo = 'SEMINOVO CONFERIDO';
        $tam = kgl_caber($i['modelo'], $f8, 66, $max);
        $linhas = [[$i['modelo'], $tam]];
        $sub = implode(' · ', array_filter([$i['armazenamento'] ?? '', $i['cor'] ?? '']));
        $chips = [];
        if ($i['bateria'] !== null && $i['bateria'] !== '') $chips[] = 'Bateria ' . $i['bateria'] . '%';
        if (!empty($i['conservacao'])) $chips[] = $i['conservacao'];
        if (!empty($i['com_nota'])) $chips[] = 'Nota fiscal';
        $cta = 'Veja as fotos reais  →';
    }
    $y = 190;
    kgl_texto($img, 15, $f6, $x, $y, $ouro, $rotulo);
    $y += 24;
    foreach ($linhas as $l) {
        [$txt, $t] = is_array($l) ? $l : [$l, 50];
        $y += (int)($t * 1.25);
        kgl_texto($img, $t, $f8, $x, $y, $branco, $txt);
    }
    if ($sub) { $y += 50; kgl_texto($img, kgl_caber($sub, $f4, 28, $max), $f4, $x, $y, $cinza, $sub); }

    if ($chips) {
        $y += 30; $cxp = $x;
        foreach ($chips as $c) {
            $c = mb_strlen($c) > 34 ? mb_substr($c, 0, 33) . '…' : $c;
            if ($cxp + kgl_largura(19, $f6, $c) + 36 > $x + $max) break;
            $cxp += kgl_pilula($img, $cxp, $y, $c, $f6, 19, $chip, $branco) + 10;
        }
        $y += 46;
    }
    if (!empty($i['preco'])) {
        $y = min($y + 72, 498);
        kgl_texto($img, 54, $f8, $x, $y, $ouroClaro, kgl_moeda($i['preco']));
    }
    // chamada
    kgl_pilula($img, $x, 530, $cta, $f6, 21, $ouro, $escuro, 24, 54);
    kgl_texto($img, 17, $f4, $x + kgl_largura(21, $f6, $cta) + 72, 564, $cinza, 'kglstore.com.br');
    return $img;
}
