<?php
/* =====================================================================
   KGL STORE — PRÉVIA DO LINK (WhatsApp, Instagram, Facebook...)

   Quando alguém compartilha o link de um anúncio, o WhatsApp lê a
   página sem rodar o JavaScript. Este arquivo monta, no servidor,
   título, descrição e a 1ª FOTO REAL do aparelho/acessório para o
   card do link. Você não precisa editar nada aqui: ele usa a mesma
   URL e chave pública de js/conexao.js.
   ===================================================================== */

const KGL_CACHE_MIN = 10;          // minutos guardando a resposta do banco
const KGL_SITE = 'https://kglstore.com.br/';

function kgl_config() {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $js = @file_get_contents(__DIR__ . '/js/conexao.js') ?: '';
    preg_match('/url:\s*"([^"]+)"/', $js, $u);
    preg_match('/chave:\s*"([^"]+)"/', $js, $k);
    preg_match('/bucket:\s*"([^"]+)"/', $js, $b);
    $cfg = ['url' => rtrim($u[1] ?? '', '/'), 'chave' => $k[1] ?? '', 'bucket' => $b[1] ?? 'kgl-device-photos'];
    return $cfg;
}

function kgl_id_valido($id) {
    return is_string($id) && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id);
}

function kgl_pasta_cache() {
    $d = sys_get_temp_dir() . '/kgl-cache';
    if (!is_dir($d)) @mkdir($d, 0700, true);
    return $d;
}

function kgl_http($metodo, $url, $corpo = null) {
    $cfg = kgl_config();
    $ch = curl_init($url);
    $cab = ['apikey: ' . $cfg['chave'], 'Authorization: Bearer ' . $cfg['chave'], 'Accept: application/json'];
    if ($corpo !== null) { $cab[] = 'Content-Type: application/json'; curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($corpo)); }
    curl_setopt_array($ch, [CURLOPT_CUSTOMREQUEST => $metodo, CURLOPT_HTTPHEADER => $cab,
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 4]);
    $r = curl_exec($ch); $st = curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    return ($r !== false && $st >= 200 && $st < 300) ? $r : null;
}

/* Busca 1 item publicado: $tipo = 'aparelho' ou 'acessorio' */
function kgl_item($tipo, $id) {
    if (!kgl_id_valido($id)) return null;
    $cfg = kgl_config();
    if (!$cfg['url'] || !$cfg['chave']) return null;
    $arq = kgl_pasta_cache() . '/item-' . $tipo . '-' . $id . '.json';
    if (is_file($arq) && filemtime($arq) > time() - KGL_CACHE_MIN * 60) {
        return json_decode(file_get_contents($arq), true) ?: null;
    }
    $view = $tipo === 'acessorio' ? 'vitrine_acessorios' : 'vitrine_publica';
    $r = kgl_http('GET', $cfg['url'] . '/rest/v1/' . $view . '?id=eq.' . $id . '&select=*&limit=1');
    $lista = $r ? json_decode($r, true) : null;
    $item = (is_array($lista) && isset($lista[0])) ? $lista[0] : null;
    @file_put_contents($arq, json_encode($item));
    return $item;
}

function kgl_moeda($v) {
    $v = (float)$v;
    return 'R$ ' . number_format($v, fmod($v, 1) ? 2 : 0, ',', '.');
}

/* Textos do card */
function kgl_card($tipo, $i) {
    if ($tipo === 'acessorio') {
        $titulo = $i['nome'] . ($i['cor'] ? ' ' . $i['cor'] : '') . ' · ' . $i['marca'];
        $partes = [$i['categoria'], $i['compatibilidade'] ? 'Compatível com ' . $i['compatibilidade'] : 'Universal'];
        if (!empty($i['preco'])) $partes[] = kgl_moeda($i['preco']);
        return [$titulo, implode(' · ', array_filter($partes)) . '. Peça pelo WhatsApp na KGL Store.'];
    }
    $titulo = trim(implode(' ', array_filter([$i['modelo'], $i['armazenamento'], $i['cor']])));
    $partes = [];
    if (!empty($i['preco'])) $partes[] = kgl_moeda($i['preco']);
    if ($i['bateria'] !== null && $i['bateria'] !== '') $partes[] = 'Bateria ' . $i['bateria'] . '%';
    if (!empty($i['conservacao'])) $partes[] = 'Estado ' . mb_strtolower($i['conservacao']);
    if (!empty($i['com_nota'])) $partes[] = 'Com nota fiscal';
    return [$titulo, implode(' · ', $partes) . '. Fotos reais desta unidade, conferida ponto a ponto.'];
}

/* Monta a página: lê o HTML estático e troca as tags de prévia */
function kgl_pagina($arquivoHtml, $tipo) {
    $html = file_get_contents(__DIR__ . '/' . $arquivoHtml);
    $id = $_GET['id'] ?? '';
    $item = kgl_item($tipo, $id);
    header('Content-Type: text/html; charset=utf-8');
    if (!$item) { header('Cache-Control: public, max-age=300'); echo $html; return; }

    [$titulo, $desc] = kgl_card($tipo, $item);
    $url = KGL_SITE . $arquivoHtml . '?id=' . rawurlencode($id);
    $foto = !empty($item['fotos'][0]) ? KGL_SITE . 'foto.php?tipo=' . $tipo . '&id=' . rawurlencode($id) : KGL_SITE . 'img/compartilhar.jpg';
    $e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

    $trocas = [
        '/<title>.*?<\/title>/s' => '<title>' . $e($titulo) . ' | KGL Store</title>',
        '/<meta name="description" content="[^"]*">/' => '<meta name="description" content="' . $e($desc) . '">',
        '/<meta property="og:title" content="[^"]*">/' => '<meta property="og:title" content="' . $e($titulo) . '">',
        '/<meta property="og:description" content="[^"]*">/' => '<meta property="og:description" content="' . $e($desc) . '">',
        '/<meta property="og:url" content="[^"]*">/' => '<meta property="og:url" content="' . $e($url) . '">',
        '/<meta property="og:image" content="[^"]*">/' => '<meta property="og:image" content="' . $e($foto) . '">'
            . "\n  " . '<meta property="og:image:width" content="800">'
            . "\n  " . '<meta property="og:image:height" content="800">'
            . "\n  " . '<meta property="og:image:alt" content="' . $e($titulo) . '">',
        '/<meta property="og:type" content="[^"]*">/' => '<meta property="og:type" content="product">'
            . (!empty($item['preco']) ? "\n  " . '<meta property="product:price:amount" content="' . number_format((float)$item['preco'], 2, '.', '') . '">'
            . "\n  " . '<meta property="product:price:currency" content="BRL">' : ''),
        '/<link rel="canonical" href="[^"]*">/' => '<link rel="canonical" href="' . $e($url) . '">',
    ];
    foreach ($trocas as $padrao => $novo) { $html = preg_replace($padrao, $novo, $html, 1); }
    header('Cache-Control: public, max-age=300');
    echo $html;
}
