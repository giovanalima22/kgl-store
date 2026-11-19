/* =====================================================================
   KGL STORE — FUNCIONAMENTO DO SITE
   Normalmente você NÃO precisa editar este arquivo.
   Os ajustes do dia a dia ficam em:
     js/aparelhos.js  (WhatsApp, Instagram, cidade, modelos)
     js/ajustes.js    (Pix, parcelamento, combos, Google/Meta)
     js/conexao.js    (ligação com o KGL Gestão)
   Os pontos que podem interessar aqui estão marcados com  >>> PARA ALTERAR
   ===================================================================== */
(function () {
  "use strict";

  var loja = (typeof LOJA !== "undefined") ? LOJA : {};
  var modelos = (typeof MODELOS !== "undefined") ? MODELOS.slice() : [];
  var lista = (typeof APARELHOS !== "undefined") ? APARELHOS : [];
  var acessorios = [];
  var depoimentos = [];
  var CONEXAO = (typeof SUPABASE_VITRINE !== "undefined") ? SUPABASE_VITRINE : null;
  var AJ = (typeof AJUSTES !== "undefined") ? AJUSTES : {};
  var PAG = AJ.pagamento || {};
  var COMBO = AJ.combo || {};

  /* >>> PARA ALTERAR: mensagens que chegam prontas no seu WhatsApp.
     {aparelho}, {modelo} e {itens} são trocados automaticamente. */
  var MSG_GERAL = "Olá! Vim pelo site da KGL Store e gostaria de mais informações.";
  var MSG_APARELHO = "Olá! Vi o {aparelho} no site da KGL Store e gostaria de mais informações.";
  var MSG_MODELO = "Olá! Estou procurando um {modelo}. Vocês têm disponível?";
  var MSG_ACESSORIO = "Olá! Vi o acessório {aparelho} no site da KGL Store. Ainda tem disponível?";
  var MSG_COMBO = "Olá! Tenho interesse no {aparelho} com: {itens}. Pode me passar o valor do combo?";

  /* ---------- Utilidades ---------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function moeda(n) {
    return "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  function moedaCentavos(n) {
    return "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function temPreco(p) { return typeof p === "number" && p > 0; }
  function preco(a) { return temPreco(a.preco) ? moeda(a.preco) : "Consulte"; }
  function nomeCompleto(a) { return [a.modelo, a.armazenamento, a.cor].filter(Boolean).join(" "); }
  function whats(msg) {
    return "https://wa.me/" + String(loja.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
  }
  function param(n) { return new URLSearchParams(window.location.search).get(n); }
  function modeloPorId(id) { return modelos.filter(function (m) { return m.id === id; })[0]; }
  function daLinha(id) { return lista.filter(function (a) { return a.linha === id; }); }
  function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim(); }
  function unicos(arr) {
    var v = {}; return arr.filter(function (x) { if (!x || v[x]) { return false; } v[x] = 1; return true; });
  }
  function avisar(texto) {
    var t = document.getElementById("aviso-site");
    if (!t) { t = document.createElement("div"); t.id = "aviso-site"; t.className = "aviso-site"; document.body.appendChild(t); }
    t.textContent = texto; t.classList.add("mostrar");
    clearTimeout(avisar.t); avisar.t = setTimeout(function () { t.classList.remove("mostrar"); }, 3200);
  }

  var ICONE_WHATS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.200 8.200 0 0 1-4.200-1.150l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200zm4.500-6.100c-.250-.120-1.460-.720-1.690-.8-.220-.080-.390-.120-.550.120-.160.250-.630.8-.780.970-.140.160-.290.180-.530.060a6.700 6.700 0 0 1-3.330-2.910c-.250-.430.250-.4.720-1.330.080-.160.040-.3-.020-.430-.060-.120-.550-1.330-.760-1.820-.2-.480-.4-.410-.550-.420h-.470a.9.900 0 0 0-.650.300 2.750 2.750 0 0 0-.860 2.040c0 1.200.880 2.370 1 2.530.120.160 1.730 2.640 4.190 3.700 1.560.670 2.170.730 2.950.610.470-.070 1.460-.6 1.670-1.170.2-.580.2-1.070.140-1.170-.060-.110-.220-.170-.470-.290z"/></svg>';
  var ICONE_COMPARTILHAR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  var ICONE_ACESSORIO = '<svg class="ilustra-acc" viewBox="0 0 120 120" aria-hidden="true"><rect x="34" y="14" width="52" height="92" rx="14" fill="none" stroke="#c9a45c" stroke-width="5"/><rect x="44" y="24" width="18" height="18" rx="6" fill="#c9a45c" opacity=".35"/><path d="M60 106v8" stroke="#c9a45c" stroke-width="5" stroke-linecap="round"/></svg>';

  /* Ilustração usada enquanto não existe a foto do modelo em img/modelos/ */
  var ILUSTRA = '<svg class="ilustra" viewBox="0 0 300 610" aria-hidden="true">' +
    '<defs><linearGradient id="i-fr" x1="0" x2="1"><stop offset="0" stop-color="#2a2a2d"/><stop offset=".12" stop-color="#8f8f94"/><stop offset=".5" stop-color="#3a3a3e"/><stop offset=".9" stop-color="#9a9a9f"/><stop offset="1" stop-color="#2a2a2d"/></linearGradient>' +
    '<linearGradient id="i-sc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset=".55" stop-color="#101a3d"/><stop offset="1" stop-color="#05060d"/></linearGradient>' +
    '<radialGradient id="i-b1" cx=".25" cy=".8" r=".7"><stop offset="0" stop-color="#e2b866" stop-opacity=".95"/><stop offset="1" stop-color="#e2b866" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="i-b2" cx=".9" cy=".35" r=".7"><stop offset="0" stop-color="#3d6bff" stop-opacity=".9"/><stop offset="1" stop-color="#3d6bff" stop-opacity="0"/></radialGradient>' +
    '<clipPath id="i-cp"><rect x="11" y="11" width="278" height="588" rx="40"/></clipPath></defs>' +
    '<rect width="300" height="610" rx="50" fill="url(#i-fr)"/><rect x="5" y="5" width="290" height="600" rx="45" fill="#050506"/>' +
    '<g clip-path="url(#i-cp)"><rect x="11" y="11" width="278" height="588" fill="url(#i-sc)"/><rect x="11" y="11" width="278" height="588" fill="url(#i-b2)"/><rect x="11" y="11" width="278" height="588" fill="url(#i-b1)"/>' +
    '<path d="M-20 430 C80 330 200 520 330 380 L330 620 L-20 620Z" fill="#05060d" opacity=".55"/></g>' +
    '<rect x="112" y="26" width="76" height="22" rx="11" fill="#000"/><rect x="100" y="578" width="100" height="5" rx="2.5" fill="#fff" opacity=".7"/></svg>';

  /* Foto do modelo; se o arquivo não existir, troca pela ilustração. */
  function fotoModelo(m, alt) {
    if (m && m.foto) { return '<img class="foto-modelo" src="' + esc(m.foto) + '" alt="' + esc(alt) + '" loading="lazy">'; }
    return ILUSTRA;
  }
  function ativarFallback(raiz) {
    raiz.querySelectorAll("img.foto-modelo").forEach(function (img) {
      function trocar() {
        var d = document.createElement("div"); d.innerHTML = ILUSTRA;
        if (img.parentNode) { img.parentNode.replaceChild(d.firstChild, img); }
      }
      img.addEventListener("error", trocar);
      if (img.complete && img.naturalWidth === 0) { trocar(); }
    });
  }

  /* =================================================================
     PAGAMENTO: Pix e parcelado (valores em js/ajustes.js)
     ================================================================= */
  function precoPix(p) { return p * (1 - (Number(PAG.descontoPix) || 0) / 100); }
  function opcoesCartao(p) {
    var t = PAG.taxaPorParcela || {};
    return Object.keys(t).map(Number).filter(function (n) { return n >= 1 && Number(t[n]) < 100; })
      .sort(function (a, b) { return a - b; })
      .map(function (n) { var total = p / (1 - Number(t[n]) / 100); return { n: n, total: total, parcela: total / n }; });
  }
  function maiorParcelamento(p) { var o = opcoesCartao(p); return o.length ? o[o.length - 1] : null; }
  function linhaCartaoCurta(p) {
    var m = maiorParcelamento(p);
    return m && m.n > 1 ? "ou " + m.n + "x de " + moedaCentavos(m.parcela) : "";
  }
  function blocoPagamento(p) {
    if (!PAG.mostrar || !temPreco(p)) { return ""; }
    var pix = precoPix(p), ops = opcoesCartao(p), m = ops[ops.length - 1];
    var h = '<div class="pagamento">';
    h += '<div class="pag-linha"><span class="pag-tag pix">Pix</span><b>' + moedaCentavos(pix) + "</b>" +
      (pix < p ? '<span class="pag-eco">economize ' + moedaCentavos(p - pix) + "</span>" : "") + "</div>";
    if (m) {
      h += '<div class="pag-linha"><span class="pag-tag">Cartão</span><b>' + (m.n > 1 ? m.n + "x de " + moedaCentavos(m.parcela) : moedaCentavos(m.total)) + "</b>" +
        '<button type="button" class="pag-ver" aria-expanded="false">ver parcelas</button></div>' +
        '<div class="pag-tabela" hidden>' + ops.map(function (o) {
          return "<span>" + o.n + "x de <b>" + moedaCentavos(o.parcela) + "</b></span><span>" + moedaCentavos(o.total) + "</span>";
        }).join("") + "</div>";
    }
    return h + "</div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".pag-ver");
    if (!b) { return; }
    var t = b.closest(".pagamento").querySelector(".pag-tabela");
    t.hidden = !t.hidden; b.setAttribute("aria-expanded", t.hidden ? "false" : "true");
    b.textContent = t.hidden ? "ver parcelas" : "fechar";
  });

  /* =================================================================
     MEDIÇÃO: visitas e cliques (vão para o KGL Gestão > Loja online)
     e Google Analytics / Meta Pixel (códigos em js/ajustes.js)
     ================================================================= */
  var sbPublico = null;
  function clientePublico() {
    if (sbPublico) { return sbPublico; }
    if (!CONEXAO || !CONEXAO.ligado || !CONEXAO.url || !CONEXAO.chave || !window.supabase || !window.supabase.createClient) { return null; }
    sbPublico = window.supabase.createClient(CONEXAO.url, CONEXAO.chave, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: "kgl-vitrine" }
    });
    return sbPublico;
  }
  function souDaLoja() {
    try {
      for (var i = 0; i < localStorage.length; i++) { if (/^sb-.*-auth-token$/.test(localStorage.key(i))) { return true; } }
    } catch (e) { /* navegador sem armazenamento */ }
    return false;
  }
  function registrar(tipo, itemTipo, itemId) {
    var sb = clientePublico();
    if (sb && !souDaLoja()) {
      sb.rpc("kgl_registrar_evento", { p_tipo: tipo, p_item_tipo: itemTipo, p_item_id: String(itemId) }).then(function () {}, function () {});
    }
    if (tipo === "whatsapp") {
      if (window.gtag) { window.gtag("event", "generate_lead", { item_id: itemId, item_category: itemTipo }); }
      if (window.fbq) { window.fbq("track", "Contact", { content_ids: [itemId], content_type: itemTipo }); }
    }
    if (tipo === "visita" && itemTipo !== "pagina") {
      if (window.gtag) { window.gtag("event", "view_item", { items: [{ item_id: itemId, item_category: itemTipo }] }); }
      if (window.fbq) { window.fbq("track", "ViewContent", { content_ids: [itemId], content_type: itemTipo }); }
    }
  }
  function paginaAtual() { return (window.location.pathname.split("/").pop() || "index.html").replace(".html", "") || "index"; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (!a) { return; }
    registrar("whatsapp", a.getAttribute("data-ev-tipo") || "pagina", a.getAttribute("data-ev-id") || paginaAtual());
  });
  (function carregarMedidores() {
    var r = AJ.rastreamento || {};
    if (r.googleAnalytics) {
      var g = document.createElement("script"); g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(r.googleAnalytics);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", r.googleAnalytics);
    }
    if (r.metaPixel) {
      /* código padrão do Meta Pixel */
      !function (f, b, e, v, n, t, s) { if (f.fbq) { return; } n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) { f._fbq = n; } n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", r.metaPixel); window.fbq("track", "PageView");
    }
  })();

  /* ---------- Compartilhar ---------- */
  function botaoCompartilhar(titulo, tipo, id) {
    return '<button type="button" class="botao botao-compartilhar" data-compartilhar data-titulo="' + esc(titulo) +
      '" data-ev-tipo="' + tipo + '" data-ev-id="' + esc(id) + '">' + ICONE_COMPARTILHAR + " Compartilhar</button>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-compartilhar]");
    if (!b) { return; }
    var url = window.location.href, titulo = b.getAttribute("data-titulo") + " | KGL Store";
    registrar("compartilhar", b.getAttribute("data-ev-tipo"), b.getAttribute("data-ev-id"));
    if (navigator.share) { navigator.share({ title: titulo, text: titulo, url: url }).catch(function () {}); return; }
    var copiar = navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject();
    copiar.then(function () { avisar("Link copiado! Agora é só colar onde quiser."); },
      function () { window.open("https://wa.me/?text=" + encodeURIComponent(titulo + " " + url), "_blank", "noopener"); });
  });

  /* ---------- SEO: título, descrição e dados estruturados por anúncio ---------- */
  function seo(titulo, descricao, produto) {
    document.title = titulo + " | KGL Store";
    var m = document.querySelector('meta[name="description"]');
    if (m && descricao) { m.setAttribute("content", descricao); }
    var c = document.querySelector('link[rel="canonical"]');
    if (c) { c.setAttribute("href", window.location.href.split("#")[0]); }
    if (produto) {
      var s = document.createElement("script"); s.type = "application/ld+json";
      s.textContent = JSON.stringify(produto); document.head.appendChild(s);
    }
  }
  function dadosProduto(nome, desc, foto, valor, marca, usado) {
    var p = { "@context": "https://schema.org", "@type": "Product", name: nome, description: desc || nome,
      brand: { "@type": "Brand", name: marca || "Apple" } };
    if (foto) { p.image = [foto.indexOf("http") === 0 ? foto : (AJ.site || "") + foto]; }
    if (temPreco(valor)) {
      p.offers = { "@type": "Offer", priceCurrency: "BRL", price: valor.toFixed(2), availability: "https://schema.org/InStock",
        itemCondition: usado ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "KGL Store" } };
    }
    return p;
  }

  /* ---------- Menu no celular ---------- */
  var botaoMenu = document.querySelector(".menu-botao");
  var menu = document.querySelector(".menu");
  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
  }
  document.querySelectorAll("[data-whats]").forEach(function (el) { el.href = whats(MSG_GERAL); });

  /* =================================================================
     ESTOQUE AO VIVO (KGL Gestão / Supabase)
     iPhones "Disponível" + "Mostrar no site", acessórios com estoque e
     depoimentos publicados. Se a conexão falhar, o site usa js/aparelhos.js.
     ================================================================= */
  function linhaDoModelo(modelo) {
    var t = String(modelo || "").toLowerCase();
    var n = t.match(/iphone\s*(\d+)/);
    if (n) { return "iphone-" + n[1]; }
    if (t.indexOf("se") > -1) { return "iphone-se"; }
    return "outros";
  }
  function nomeDaLinha(id) {
    return id === "iphone-se" ? "iPhone SE" : id === "outros" ? "Outros" : "iPhone " + id.replace("iphone-", "");
  }
  function converter(l, links) {
    return {
      id: String(l.id),
      linha: linhaDoModelo(l.modelo),
      modelo: l.modelo,
      armazenamento: l.armazenamento || "",
      cor: l.cor || "",
      preco: Number(l.preco) > 0 ? Number(l.preco) : null,
      bateria: l.bateria != null ? l.bateria + "%" : "",
      conservacao: l.conservacao || (l.condicao && l.condicao !== "Usado" ? l.condicao : ""),
      pecas: "",
      acessorios: l.acessorios || (l.com_nota ? "Nota fiscal" : ""),
      procedencia: l.com_nota ? "Com nota fiscal" : "",
      descricao: l.descricao || "",
      destaque: l.destaque || "",
      checklist: Array.isArray(l.checklist) ? l.checklist : [],
      usado: l.condicao !== "Novo",
      fotos: (l.fotos || []).map(function (c) { return links[c]; }).filter(Boolean)
    };
  }
  function converterAcessorio(l, links) {
    return {
      id: String(l.id), nome: l.nome, categoria: l.categoria || "Outros", marca: l.marca || "Outras marcas",
      compatibilidade: l.compatibilidade || "", cor: l.cor || "", descricao: l.descricao || "",
      preco: Number(l.preco) > 0 ? Number(l.preco) : null, poucas: !!l.poucas_unidades, destaque: l.destaque || "",
      fotos: (l.fotos || []).map(function (c) { return links[c]; }).filter(Boolean)
    };
  }
  function carregarEstoque() {
    var sb = clientePublico();
    if (!sb) { return Promise.resolve(); }
    var ler = function (tabela, ordem) {
      return sb.from(tabela).select("*").order(ordem, { ascending: ordem === "ordem" })
        .then(function (r) { if (r.error) { throw r.error; } return r.data || []; });
    };
    var ignorarFalha = function (p) { return p.catch(function (e) { if (window.console) { console.warn("KGL:", e); } return null; }); };
    return Promise.all([
      ler("vitrine_publica", "cadastrado_em"),
      ignorarFalha(ler("vitrine_acessorios", "cadastrado_em")),
      ignorarFalha(ler("depoimentos_publicos", "ordem"))
    ]).then(function (r) {
      var aps = r[0], accs = r[1] || [], deps = r[2] || [];
      var caminhos = [];
      aps.concat(accs).forEach(function (l) { (l.fotos || []).forEach(function (c) { caminhos.push(c); }); });
      deps.forEach(function (d) { if (d.foto_path) { caminhos.push(d.foto_path); } });
      var assinar = caminhos.length
        ? sb.storage.from(CONEXAO.bucket || "kgl-device-photos").createSignedUrls(caminhos, 60 * 60 * 6)
        : Promise.resolve({ data: [] });
      return assinar.then(function (s) {
        var links = {};
        (s.data || []).forEach(function (x) { if (x && x.signedUrl) { links[x.path] = x.signedUrl; } });
        lista = aps.map(function (l) { return converter(l, links); });
        acessorios = accs.map(function (l) { return converterAcessorio(l, links); });
        depoimentos = deps.map(function (d) { d.foto = d.foto_path ? links[d.foto_path] : ""; return d; });
        lista.forEach(function (a) {
          if (!modeloPorId(a.linha)) {
            modelos.push({ id: a.linha, nome: nomeDaLinha(a.linha), foto: "img/modelos/" + a.linha + ".png" });
          }
        });
      });
    }).catch(function (e) {
      if (window.console) { console.warn("KGL: estoque ao vivo indisponível, usando js/aparelhos.js", e); }
    });
  }

  /* =================================================================
     CARTÕES
     ================================================================= */
  function seloDestaque(d) {
    return d ? '<span class="selo-destaque' + (norm(d) === "oferta" ? " oferta" : "") + '">' + esc(d) + "</span>" : "";
  }
  /* Foto do cartão: a 1ª foto REAL do anúncio; sem foto (ou se falhar), a foto do modelo */
  function fotoCartao(a) {
    var m = modeloPorId(a.linha);
    if (a.fotos && a.fotos[0]) {
      return '<div class="cartao-foto cartao-foto-real"><img class="foto-real" src="' + esc(a.fotos[0]) + '" alt="' + esc(nomeCompleto(a)) +
        '" loading="lazy" data-reserva="' + esc(m && m.foto ? m.foto : "") + '"></div>';
    }
    return '<div class="cartao-foto">' + fotoModelo(m, a.modelo) + "</div>";
  }
  function ativarFotosReais(raiz) {
    raiz.querySelectorAll("img.foto-real").forEach(function (img) {
      function voltar() {
        var caixa = img.parentNode, reserva = img.getAttribute("data-reserva");
        if (!caixa) { return; }
        caixa.classList.remove("cartao-foto-real");
        caixa.innerHTML = reserva ? '<img class="foto-modelo" src="' + esc(reserva) + '" alt="">' : ILUSTRA;
        ativarFallback(caixa);
      }
      img.addEventListener("error", voltar);
      if (img.complete && img.naturalWidth === 0) { voltar(); }
    });
  }
  function cartaoAparelho(a) {
    var sub = [a.armazenamento, a.cor].filter(Boolean).join(" · ");
    var valor = loja.mostrarPrecoNaVitrine
      ? '<p class="cartao-preco">' + esc(preco(a)) + "</p>" +
        (PAG.mostrar && temPreco(a.preco) && linhaCartaoCurta(a.preco) ? '<p class="cartao-parcela">' + esc(linhaCartaoCurta(a.preco)) + "</p>" : "")
      : "";
    var bat = parseInt(a.bateria, 10);
    return '<a class="cartao surgir" href="aparelho.html?id=' + encodeURIComponent(a.id) + '">' + seloDestaque(a.destaque) +
      fotoCartao(a) +
      '<div class="cartao-base"><div><h3>' + esc(a.modelo) + "</h3><p>" + esc(sub) +
      (bat > 0 ? ' · <span class="cartao-bat">' + bat + "% bateria</span>" : "") + "</p>" + valor + "</div>" +
      '<span class="seta" aria-hidden="true">→</span></div></a>';
  }
  function fotoAcessorio(x) {
    return x.fotos && x.fotos[0]
      ? '<img class="foto-acc" src="' + esc(x.fotos[0]) + '" alt="' + esc(x.nome) + '" loading="lazy">'
      : ICONE_ACESSORIO;
  }
  function cartaoAcessorio(x) {
    return '<a class="cartao cartao-acc surgir" href="acessorio.html?id=' + encodeURIComponent(x.id) + '">' + seloDestaque(x.destaque) +
      '<div class="cartao-foto">' + fotoAcessorio(x) + "</div>" +
      '<div class="cartao-base"><div><p class="cartao-marca">' + esc(x.marca) + "</p><h3>" + esc(x.nome) + "</h3>" +
      "<p>" + esc([x.categoria, x.cor].filter(Boolean).join(" · ")) + "</p>" +
      '<p class="cartao-preco">' + esc(preco(x)) + "</p>" + (x.poucas ? '<p class="cartao-ultimas">Últimas unidades</p>' : "") +
      '</div><span class="seta" aria-hidden="true">→</span></div></a>';
  }

  /* ---------- Avise-me quando chegar ---------- */
  function formAvise(procura) {
    return '<form class="avise-form" data-avise>' +
      '<input name="nome" placeholder="Seu nome" required autocomplete="name" aria-label="Seu nome">' +
      '<input name="whatsapp" placeholder="WhatsApp com DDD" required inputmode="tel" autocomplete="tel" aria-label="WhatsApp com DDD">' +
      '<input name="procura" placeholder="Qual iPhone? Ex.: 15 Pro 256 GB" required value="' + esc(procura || "") + '" aria-label="Modelo procurado">' +
      '<button class="botao botao-branco" type="submit">Avise-me</button>' +
      '<p class="avise-status" role="status"></p></form>';
  }
  function ativarAvise(raiz) {
    (raiz || document).querySelectorAll("[data-avise-aqui]").forEach(function (el) {
      el.innerHTML = formAvise(el.getAttribute("data-avise-aqui"));
    });
    (raiz || document).querySelectorAll("form[data-avise]:not([data-pronto])").forEach(function (f) {
      f.setAttribute("data-pronto", "");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var st = f.querySelector(".avise-status"), b = f.querySelector("button");
        var d = { nome: f.nome.value.trim(), whatsapp: f.whatsapp.value.trim(), procura: f.procura.value.trim() };
        if (d.whatsapp.replace(/\D/g, "").length < 10) { st.textContent = "Informe o WhatsApp com DDD."; return; }
        var sb = clientePublico();
        if (!sb) { window.open(whats(MSG_MODELO.replace("{modelo}", d.procura)), "_blank", "noopener"); return; }
        b.disabled = true; st.textContent = "Enviando...";
        sb.rpc("kgl_avise_me", { p_nome: d.nome, p_whatsapp: d.whatsapp, p_procura: d.procura, p_obs: null }).then(function (r) {
          if (r.error) { throw r.error; }
          f.reset(); st.textContent = "Pronto! Avisamos você no WhatsApp assim que chegar.";
          if (window.fbq) { window.fbq("track", "Lead"); }
          if (window.gtag) { window.gtag("event", "generate_lead", { item_category: "avise-me" }); }
        }).catch(function () {
          st.innerHTML = 'Não deu para registrar agora. <a href="' + esc(whats(MSG_MODELO.replace("{modelo}", d.procura))) + '" target="_blank" rel="noopener">Chame no WhatsApp</a>.';
        }).then(function () { b.disabled = false; });
      });
    });
  }

  /* =================================================================
     PÁGINAS
     ================================================================= */
  function montarPaginas() {

    /* ---------- Página inicial: modelos ---------- */
    var gradeModelos = document.getElementById("modelos");
    if (gradeModelos) {
      gradeModelos.innerHTML = modelos.map(function (m) {
        var qtd = daLinha(m.id).length;
        var destino = qtd
          ? 'href="aparelhos.html?modelo=' + encodeURIComponent(m.id) + '"'
          : 'href="' + esc(whats(MSG_MODELO.replace("{modelo}", m.nome))) + '" target="_blank" rel="noopener"';
        var legenda = qtd ? (qtd === 1 ? "1 disponível" : qtd + " disponíveis") : "Sob consulta";
        return '<a class="cartao surgir" ' + destino + ">" +
          '<div class="cartao-foto">' + fotoModelo(m, m.nome) + "</div>" +
          '<div class="cartao-base"><div><h3>' + esc(m.nome) + "</h3><p>" + legenda + "</p></div>" +
          '<span class="seta" aria-hidden="true">→</span></div></a>';
      }).join("");
      ativarFallback(gradeModelos);
    }

    /* ---------- Página inicial: destaques ---------- */
    var destaques = document.getElementById("destaques");
    if (destaques) {
      var dA = lista.filter(function (a) { return a.destaque; });
      var dX = acessorios.filter(function (x) { return x.destaque; });
      if (dA.length + dX.length) {
        destaques.innerHTML = dA.map(cartaoAparelho).join("") + dX.map(cartaoAcessorio).join("");
        document.getElementById("secao-destaques").hidden = false;
        ativarFallback(destaques); ativarFotosReais(destaques);
      }
    }

    /* ---------- Página inicial: acessórios ---------- */
    var accHome = document.getElementById("acessorios-home");
    if (accHome && acessorios.length) {
      var cats = unicos(acessorios.map(function (x) { return x.categoria; }));
      accHome.innerHTML = cats.map(function (c) {
        var itens = acessorios.filter(function (x) { return x.categoria === c; });
        var comFoto = itens.filter(function (x) { return x.fotos.length; })[0] || itens[0];
        return '<a class="cartao cartao-cat surgir" href="acessorios.html?categoria=' + encodeURIComponent(c) + '">' +
          '<div class="cartao-foto">' + fotoAcessorio(comFoto) + "</div>" +
          '<div class="cartao-base"><div><h3>' + esc(c) + "</h3><p>" + itens.length + (itens.length === 1 ? " opção" : " opções") +
          '</p></div><span class="seta" aria-hidden="true">→</span></div></a>';
      }).join("");
      var marcasHome = document.getElementById("acessorios-marcas");
      if (marcasHome) { marcasHome.textContent = unicos(acessorios.map(function (x) { return x.marca; })).join(" · "); }
      document.getElementById("secao-acessorios").hidden = false;
    }

    /* ---------- Página inicial: depoimentos ---------- */
    var deps = document.getElementById("depoimentos");
    if (deps && depoimentos.length) {
      deps.innerHTML = depoimentos.map(function (d) {
        var n = Math.max(1, Math.min(5, Number(d.nota) || 5));
        return '<figure class="depoimento surgir">' +
          (d.foto ? '<img src="' + esc(d.foto) + '" alt="' + esc(d.nome) + '" loading="lazy">' : "") +
          '<div class="estrelas" aria-label="' + n + ' de 5 estrelas">' + "★★★★★".slice(0, n) + '<span>' + "★★★★★".slice(n) + "</span></div>" +
          "<blockquote>" + esc(d.texto) + "</blockquote>" +
          "<figcaption><b>" + esc(d.nome) + "</b>" + esc([d.cidade, d.aparelho].filter(Boolean).join(" · ")) + "</figcaption></figure>";
      }).join("");
      document.getElementById("secao-depoimentos").hidden = false;
    }

    /* ---------- Página iPhones: chips de modelo + filtros + vitrine ---------- */
    var vitrine = document.getElementById("vitrine");
    if (vitrine) {
      var modeloAtual = modeloPorId(param("modelo"));
      var base = modeloAtual ? daLinha(modeloAtual.id) : lista;
      var titulo = document.getElementById("vitrine-titulo");
      if (titulo && modeloAtual) {
        titulo.textContent = modeloAtual.nome + ".";
        seo(modeloAtual.nome + " seminovo", modeloAtual.nome + " seminovo com fotos reais, bateria conferida e atendimento pelo WhatsApp.");
      }
      var chips = document.getElementById("filtros");
      if (chips) {
        chips.innerHTML = '<a class="chip' + (modeloAtual ? "" : " ativo") + '" href="aparelhos.html">Todos</a>' +
          modelos.map(function (m) {
            return '<a class="chip' + (modeloAtual && modeloAtual.id === m.id ? " ativo" : "") +
              '" href="aparelhos.html?modelo=' + encodeURIComponent(m.id) + '">' + esc(m.nome) + "</a>";
          }).join("");
      }

      /* filtros extras */
      var caixa = document.getElementById("filtros-extra");
      var f = { gb: "", cor: "", ate: "", bat: "", ordem: "recentes" };
      var ordenaGb = function (a, b) { return parseInt(a, 10) * (/tb/i.test(a) ? 1024 : 1) - parseInt(b, 10) * (/tb/i.test(b) ? 1024 : 1); };
      var gbs = unicos(base.map(function (a) { return a.armazenamento; })).sort(ordenaGb);
      var cores = unicos(base.map(function (a) { return a.cor; })).sort();
      var precos = base.map(function (a) { return a.preco; }).filter(temPreco);
      var faixas = [1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000].filter(function (v) {
        return precos.some(function (p) { return p <= v; }) && precos.some(function (p) { return p > v; });
      });
      var sel = function (nome, rotulo, ops) {
        return '<label class="filtro"><span>' + rotulo + '</span><select data-f="' + nome + '">' + ops + "</select></label>";
      };
      var op = function (v, t) { return '<option value="' + esc(v) + '">' + esc(t) + "</option>"; };
      if (caixa && base.length > 1) {
        caixa.innerHTML =
          (gbs.length > 1 ? sel("gb", "Armazenamento", op("", "Todos") + gbs.map(function (g) { return op(g, g); }).join("")) : "") +
          (cores.length > 1 ? sel("cor", "Cor", op("", "Todas") + cores.map(function (c) { return op(c, c); }).join("")) : "") +
          (faixas.length ? sel("ate", "Preço", op("", "Qualquer") + faixas.map(function (v) { return op(v, "Até " + moeda(v)); }).join("")) : "") +
          sel("bat", "Bateria", op("", "Qualquer") + [80, 85, 90, 95].map(function (v) { return op(v, v + "% ou mais"); }).join("")) +
          sel("ordem", "Ordenar", op("recentes", "Mais recentes") + op("menor", "Menor preço") + op("maior", "Maior preço") + op("bateria", "Maior bateria"));
        caixa.addEventListener("change", function (e) { f[e.target.getAttribute("data-f")] = e.target.value; desenharVitrine(); });
      }
      var desenharVitrine = function () {
        var v = base.filter(function (a) {
          var p = a.preco, b = parseInt(a.bateria, 10) || 0;
          return (!f.gb || a.armazenamento === f.gb) && (!f.cor || a.cor === f.cor) &&
            (!f.ate || (temPreco(p) && p <= Number(f.ate))) && (!f.bat || b >= Number(f.bat));
        });
        var pv = function (a) { return temPreco(a.preco) ? a.preco : Infinity; };
        if (f.ordem === "menor") { v.sort(function (a, b) { return pv(a) - pv(b); }); }
        if (f.ordem === "maior") { v.sort(function (a, b) { return (temPreco(b.preco) ? b.preco : -1) - (temPreco(a.preco) ? a.preco : -1); }); }
        if (f.ordem === "bateria") { v.sort(function (a, b) { return (parseInt(b.bateria, 10) || 0) - (parseInt(a.bateria, 10) || 0); }); }
        if (v.length) {
          vitrine.innerHTML = v.map(cartaoAparelho).join("");
          ativarFallback(vitrine); ativarFotosReais(vitrine);
        } else {
          var nome = modeloAtual ? modeloAtual.nome : "iPhone";
          var filtrando = base.length > 0;
          vitrine.innerHTML = '<div class="vazio"><h3>' + (filtrando ? "Nenhum aparelho com esses filtros." : "Nenhum " + esc(nome) + " disponível agora.") + "</h3>" +
            "<p>" + (filtrando ? "Tente mudar os filtros ou peça para ser avisado:" : "Deixe seu WhatsApp e avisamos assim que chegar.") + "</p>" +
            '<div data-avise-aqui="' + esc(modeloAtual ? modeloAtual.nome : "") + '"></div></div>';
          ativarAvise(vitrine);
        }
        revelar();
      };
      desenharVitrine();
      registrar("visita", "pagina", modeloAtual ? "iphones-" + modeloAtual.id : "iphones");
    }

    /* ---------- Página do anúncio (iPhone) ---------- */
    var detalhe = document.getElementById("detalhe");
    if (detalhe) {
      var id = param("id");
      var a = lista.filter(function (x) { return x.id === id; })[0];
      if (!a) {
        detalhe.innerHTML = '<div class="vazio"><h3>Aparelho não encontrado.</h3>' +
          "<p>Este anúncio pode ter sido vendido ou removido.</p>" +
          '<a class="botao botao-escuro" href="aparelhos.html">Ver aparelhos disponíveis</a></div>';
      } else {
        montarAnuncio(detalhe, a);
      }
    }

    /* ---------- Página Acessórios ---------- */
    var vitAcc = document.getElementById("vitrine-acessorios");
    if (vitAcc) { montarAcessorios(vitAcc); }

    /* ---------- Anúncio de acessório ---------- */
    var detAcc = document.getElementById("detalhe-acessorio");
    if (detAcc) {
      var x = acessorios.filter(function (i) { return i.id === param("id"); })[0];
      if (!x) {
        detAcc.innerHTML = '<div class="vazio"><h3>Produto não encontrado.</h3><p>Ele pode ter esgotado.</p>' +
          '<a class="botao botao-escuro" href="acessorios.html">Ver acessórios</a></div>';
      } else {
        montarAnuncioAcessorio(detAcc, x);
      }
    }

    /* ---------- Contato: dados opcionais ---------- */
    var extras = document.getElementById("contato-extras");
    if (extras) {
      var h = "";
      if (loja.instagram) {
        var ig = String(loja.instagram).replace(/^@/, "");
        h += '<div><dt>Instagram</dt><dd><a href="https://instagram.com/' + encodeURIComponent(ig) +
          '" target="_blank" rel="noopener">@' + esc(ig) + "</a></dd></div>";
      }
      if (loja.cidade) { h += "<div><dt>Localização</dt><dd>" + esc(loja.cidade) + "</dd></div>"; }
      extras.innerHTML = h;
    }

    if (document.getElementById("modelos")) { registrar("visita", "pagina", "inicio"); }
    ativarAvise(document);
    revelar();
  }

  /* ---------- Galeria (usada nos dois tipos de anúncio) ---------- */
  function galeria(fotos, alt, reserva) {
    var g = '<div class="galeria"><div class="galeria-principal" id="foto-principal">' +
      (fotos.length ? '<img src="' + esc(fotos[0]) + '" alt="' + esc(alt) + '">' : reserva) + "</div>";
    if (fotos.length > 1) {
      g += '<div class="miniaturas">' + fotos.map(function (f, i) {
        return '<button type="button" class="miniatura' + (i === 0 ? " ativa" : "") + '" data-foto="' + esc(f) +
          '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(f) + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>";
    }
    return g + "</div>";
  }
  function ativarGaleria(raiz) {
    raiz.querySelectorAll(".miniatura").forEach(function (b) {
      b.addEventListener("click", function () {
        raiz.querySelector("#foto-principal img").src = b.getAttribute("data-foto");
        raiz.querySelectorAll(".miniatura").forEach(function (x) { x.classList.remove("ativa"); });
        b.classList.add("ativa");
      });
    });
  }
  function barraFixa(titulo, valor, link, tipo, id) {
    var fixa = document.getElementById("barra-fixa");
    if (!fixa) { return; }
    fixa.innerHTML = "<div><b>" + esc(titulo) + "</b><span>" + esc(valor) + "</span></div>" +
      '<a class="botao botao-whats" target="_blank" rel="noopener" data-ev-tipo="' + tipo + '" data-ev-id="' + esc(id) + '" href="' + esc(link) + '">' + ICONE_WHATS + " WhatsApp</a>";
    fixa.hidden = false;
  }

  /* ---------- Combos: acessórios compatíveis com o iPhone ---------- */
  function compativel(x, modelo) {
    if (!x.compatibilidade) { return true; }
    var alvo = norm(modelo);
    return x.compatibilidade.split(/[,;\/]/).some(function (c) { return norm(c) === alvo; });
  }
  function blocoCombo(a) {
    if (!COMBO.mostrar || !acessorios.length) { return ""; }
    var prioridade = ["capinhas", "peliculas", "carregadores", "cabos"];
    var peso = function (x) { var i = prioridade.indexOf(norm(x.categoria)); return i < 0 ? 9 : i; };
    var ops = acessorios.filter(function (x) { return compativel(x, a.modelo) && temPreco(x.preco); })
      .sort(function (p, q) { return peso(p) - peso(q) || (q.compatibilidade ? 1 : 0) - (p.compatibilidade ? 1 : 0); })
      .slice(0, Number(COMBO.maximo) || 4);
    if (!ops.length) { return ""; }
    var desc = Number(COMBO.descontoAcessorios) || 0;
    return '<section class="combo" data-combo><div class="combo-topo"><div><p class="rotulo">Monte seu combo</p><h2>Leve junto' +
      (desc ? " com " + desc + "% de desconto" : "") + ".</h2></div></div>" +
      '<div class="combo-itens">' + ops.map(function (x) {
        var final = x.preco * (1 - desc / 100);
        return '<label class="combo-item"><input type="checkbox" value="' + esc(x.id) + '" data-preco="' + final + '" data-nome="' + esc(x.nome) + '">' +
          '<span class="combo-foto">' + fotoAcessorio(x) + "</span>" +
          '<span class="combo-txt"><b>' + esc(x.nome) + "</b><small>" + esc(x.marca) + "</small>" +
          "<span>" + (desc ? "<s>" + moeda(x.preco) + "</s> " : "") + "<b>" + moedaCentavos(final) + "</b></span></span></label>";
      }).join("") + "</div>" +
      '<div class="combo-total"><p data-combo-resumo></p><a class="botao botao-whats" data-combo-link target="_blank" rel="noopener" data-ev-tipo="aparelho" data-ev-id="' + esc(a.id) + '" hidden>' + ICONE_WHATS + " Quero o combo</a></div></section>";
  }
  function ativarCombo(raiz, a) {
    var c = raiz.querySelector("[data-combo]");
    if (!c) { return; }
    var atualizar = function () {
      var marc = [].slice.call(c.querySelectorAll("input:checked"));
      var resumo = c.querySelector("[data-combo-resumo]"), link = c.querySelector("[data-combo-link]");
      if (!marc.length) { resumo.textContent = "Selecione os acessórios que quer levar junto."; link.hidden = true; return; }
      var soma = marc.reduce(function (t, i) { return t + Number(i.getAttribute("data-preco")); }, 0);
      var total = (temPreco(a.preco) ? a.preco : 0) + soma;
      resumo.innerHTML = (temPreco(a.preco) ? "iPhone + " + marc.length + (marc.length === 1 ? " acessório" : " acessórios") + ": <b>" + moedaCentavos(total) + "</b>"
        : marc.length + (marc.length === 1 ? " acessório" : " acessórios") + ": <b>" + moedaCentavos(soma) + "</b> + iPhone");
      var itens = marc.map(function (i) { return i.getAttribute("data-nome"); }).join(", ");
      link.href = whats(MSG_COMBO.replace("{aparelho}", nomeCompleto(a)).replace("{itens}", itens));
      link.hidden = false;
    };
    c.addEventListener("change", atualizar); atualizar();
  }

  function montarAnuncio(detalhe, a) {
    var m = modeloPorId(a.linha);
    var linkWhats = whats(MSG_APARELHO.replace("{aparelho}", nomeCompleto(a)));
    var pct = parseInt(a.bateria, 10);
    var blocos = "";
    if (a.bateria) {
      blocos += '<div class="bloco"><span>Saúde da bateria</span><b>' + esc(a.bateria) + "</b>" +
        (pct > 0 && pct <= 100 ? '<div class="barra"><i style="width:' + pct + '%"></i></div>' : "") + "</div>";
    }
    [["Conservação", a.conservacao], ["Peças", a.pecas], ["Procedência", a.procedencia]].forEach(function (c) {
      if (c[1]) { blocos += '<div class="bloco"><span>' + c[0] + "</span><b>" + esc(c[1]) + "</b></div>"; }
    });
    var itens = String(a.acessorios || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var acompanha = itens.length
      ? '<div class="acompanha"><h4>Acompanha</h4><div class="etiquetas">' + itens.map(function (i) { return "<span>" + esc(i) + "</span>"; }).join("") + "</div></div>"
      : "";
    var laudo = (a.checklist && a.checklist.length)
      ? '<section class="laudo"><div><p class="rotulo">Laudo KGL</p><h2>Conferido ponto a ponto.</h2><p class="texto">Itens testados e aprovados nesta unidade antes de ir para o site.</p></div>' +
        '<ul class="laudo-lista">' + a.checklist.map(function (i) { return '<li><span aria-hidden="true">✓</span>' + esc(i) + "</li>"; }).join("") + "</ul></section>"
      : "";
    var sub = [a.armazenamento, a.cor].filter(Boolean).join(" · ");

    detalhe.innerHTML =
      '<p class="trilha"><a href="aparelhos.html">iPhones</a> &nbsp;/&nbsp; ' +
      (m ? '<a href="aparelhos.html?modelo=' + encodeURIComponent(m.id) + '">' + esc(m.nome) + "</a> &nbsp;/&nbsp; " : "") +
      esc(a.armazenamento || a.modelo) + "</p>" +
      '<div class="produto">' + galeria(a.fotos || [], nomeCompleto(a), fotoModelo(m, a.modelo)) +
      '<div class="produto-dados">' +
      '<span class="selo">Disponível</span>' + (a.destaque ? " " + seloDestaque(a.destaque) : "") +
      "<h1>" + esc(a.modelo) + "</h1>" +
      (sub ? '<p class="produto-sub">' + esc(sub) + "</p>" : "") +
      '<p class="produto-preco">' + esc(preco(a)) + "</p>" + blocoPagamento(a.preco) +
      (blocos ? '<div class="blocos">' + blocos + "</div>" : "") +
      '<div class="produto-botoes"><a class="botao botao-whats botao-grande" target="_blank" rel="noopener" data-ev-tipo="aparelho" data-ev-id="' + esc(a.id) + '" href="' + esc(linkWhats) + '">' +
      ICONE_WHATS + " Consultar pelo WhatsApp</a>" + botaoCompartilhar(nomeCompleto(a), "aparelho", a.id) + "</div>" +
      '<p class="nota">Atendimento direto com a KGL Store. A mensagem já vai com o modelo.</p>' +
      acompanha + "</div></div>" + laudo + blocoCombo(a) +
      (a.descricao
        ? '<section class="sobre-unidade"><p class="rotulo">Sobre esta unidade</p><h2>Detalhes do aparelho</h2><p>' +
          esc(a.descricao).replace(/\n/g, "<br>") + "</p></section>"
        : "");

    ativarFallback(detalhe); ativarGaleria(detalhe); ativarCombo(detalhe, a);
    barraFixa(a.modelo, preco(a), linkWhats, "aparelho", a.id);
    seo(nomeCompleto(a) + " seminovo",
      [nomeCompleto(a), a.bateria ? "bateria " + a.bateria : "", temPreco(a.preco) ? moeda(a.preco) : "", "fotos reais da unidade na KGL Store."].filter(Boolean).join(", "),
      dadosProduto(nomeCompleto(a), a.descricao, a.fotos && a.fotos[0], a.preco, "Apple", a.usado !== false));
    registrar("visita", "aparelho", a.id);
  }

  /* ---------- Acessórios: lista agrupada por marca ---------- */
  function ordemMarcas(marcas) {
    return marcas.sort(function (p, q) {
      var ap = /apple/i.test(p) ? 0 : 1, aq = /apple/i.test(q) ? 0 : 1;
      return ap - aq || p.localeCompare(q, "pt-BR");
    });
  }
  function montarAcessorios(vit) {
    var cat = param("categoria") || "", marca = param("marca") || "";
    var link = function (c, m) {
      var q = []; if (c) { q.push("categoria=" + encodeURIComponent(c)); } if (m) { q.push("marca=" + encodeURIComponent(m)); }
      return "acessorios.html" + (q.length ? "?" + q.join("&") : "");
    };
    var cats = unicos(acessorios.map(function (x) { return x.categoria; })).sort();
    var marcas = ordemMarcas(unicos(acessorios.filter(function (x) { return !cat || x.categoria === cat; }).map(function (x) { return x.marca; })));
    var chipsCat = document.getElementById("filtros-categoria"), chipsMarca = document.getElementById("filtros-marca");
    if (chipsCat) {
      chipsCat.innerHTML = '<a class="chip' + (cat ? "" : " ativo") + '" href="' + link("", marca) + '">Todos</a>' +
        cats.map(function (c) { return '<a class="chip' + (c === cat ? " ativo" : "") + '" href="' + esc(link(c, marca)) + '">' + esc(c) + "</a>"; }).join("");
    }
    if (chipsMarca) {
      chipsMarca.innerHTML = marcas.length > 1 || marca
        ? '<a class="chip chip-marca' + (marca ? "" : " ativo") + '" href="' + esc(link(cat, "")) + '">Todas as marcas</a>' +
          marcas.map(function (m) { return '<a class="chip chip-marca' + (m === marca ? " ativo" : "") + '" href="' + esc(link(cat, m)) + '">' + esc(m) + "</a>"; }).join("")
        : "";
    }
    var titulo = document.getElementById("acc-titulo");
    if (titulo && (cat || marca)) {
      titulo.textContent = [cat, marca].filter(Boolean).join(" · ") + ".";
      seo([cat || "Acessórios", marca].filter(Boolean).join(" ") + " para iPhone", (cat || "Acessórios") + " para iPhone" + (marca ? " " + marca : "") + " na KGL Store.");
    }
    var vis = acessorios.filter(function (x) { return (!cat || x.categoria === cat) && (!marca || x.marca === marca); });
    if (!vis.length) {
      vit.innerHTML = '<div class="vazio"><h3>' + (acessorios.length ? "Nada por aqui com esse filtro." : "Acessórios chegando em breve.") + "</h3>" +
        '<p>Procura algo específico? Fale com a gente.</p><a class="botao botao-whats" target="_blank" rel="noopener" href="' +
        esc(whats("Olá! Estou procurando um acessório para iPhone. Vocês têm?")) + '">' + ICONE_WHATS + " Perguntar no WhatsApp</a></div>";
    } else if (marca) {
      vit.innerHTML = '<div class="grade grade-acc">' + vis.map(cartaoAcessorio).join("") + "</div>";
    } else {
      vit.innerHTML = ordemMarcas(unicos(vis.map(function (x) { return x.marca; }))).map(function (m) {
        var daMarca = vis.filter(function (x) { return x.marca === m; });
        return '<section class="grupo-marca"><div class="grupo-topo"><h2>' + esc(m) + '</h2><a class="link-todos" href="' + esc(link(cat, m)) + '">Ver ' + daMarca.length + (daMarca.length === 1 ? " item" : " itens") + " →</a></div>" +
          '<div class="grade grade-acc">' + daMarca.map(cartaoAcessorio).join("") + "</div></section>";
      }).join("");
    }
    registrar("visita", "pagina", "acessorios" + (cat ? "-" + norm(cat) : ""));
  }

  function montarAnuncioAcessorio(det, x) {
    var link = whats(MSG_ACESSORIO.replace("{aparelho}", x.nome + (x.cor ? " (" + x.cor + ")" : "")));
    var blocos = '<div class="bloco"><span>Marca</span><b>' + esc(x.marca) + "</b></div>" +
      '<div class="bloco"><span>Compatível com</span><b>' + esc(x.compatibilidade || "Todos os modelos") + "</b></div>" +
      (x.cor ? '<div class="bloco"><span>Cor</span><b>' + esc(x.cor) + "</b></div>" : "");
    det.innerHTML =
      '<p class="trilha"><a href="acessorios.html">Acessórios</a> &nbsp;/&nbsp; <a href="acessorios.html?categoria=' + encodeURIComponent(x.categoria) + '">' + esc(x.categoria) + "</a></p>" +
      '<div class="produto">' + galeria(x.fotos, x.nome, '<div class="acc-reserva">' + ICONE_ACESSORIO + "</div>") +
      '<div class="produto-dados">' +
      '<span class="selo">' + (x.poucas ? "Últimas unidades" : "Disponível") + "</span>" + (x.destaque ? " " + seloDestaque(x.destaque) : "") +
      '<p class="produto-marca">' + esc(x.marca) + "</p><h1>" + esc(x.nome) + "</h1>" +
      '<p class="produto-sub">' + esc(x.categoria) + "</p>" +
      '<p class="produto-preco">' + esc(preco(x)) + "</p>" + blocoPagamento(x.preco) +
      '<div class="blocos">' + blocos + "</div>" +
      '<div class="produto-botoes"><a class="botao botao-whats botao-grande" target="_blank" rel="noopener" data-ev-tipo="acessorio" data-ev-id="' + esc(x.id) + '" href="' + esc(link) + '">' +
      ICONE_WHATS + " Pedir pelo WhatsApp</a>" + botaoCompartilhar(x.nome, "acessorio", x.id) + "</div>" +
      '<p class="nota">Atendimento direto com a KGL Store.</p></div></div>' +
      (x.descricao ? '<section class="sobre-unidade"><p class="rotulo">Sobre o produto</p><h2>Detalhes</h2><p>' + esc(x.descricao).replace(/\n/g, "<br>") + "</p></section>" : "");
    ativarGaleria(det);
    barraFixa(x.nome, preco(x), link, "acessorio", x.id);
    seo(x.nome + " · " + x.marca, x.nome + " " + x.marca + (x.compatibilidade ? " para " + x.compatibilidade : " para iPhone") + " na KGL Store.",
      dadosProduto(x.nome, x.descricao, x.fotos[0], x.preco, /apple/i.test(x.marca) ? "Apple" : x.marca, false));
    registrar("visita", "acessorio", x.id);
  }

  /* =================================================================
     ÁREA DA LOJA: login da equipe + botão "KGL Gestão" no topo
     Usa o mesmo login do painel. Como o painel fica em
     kglstore.com.br/gestao/, quem entra aqui já abre o painel logado.
     ================================================================= */
  function iniciarAreaDaLoja() {
    if (!CONEXAO || !CONEXAO.url || !CONEXAO.chave || !window.supabase || !window.supabase.createClient) { return; }
    var destino = CONEXAO.gestao || "gestao/";
    var auth = window.supabase.createClient(CONEXAO.url, CONEXAO.chave);
    var botoes = document.querySelectorAll(".pilula-gestao");
    var caixa = document.getElementById("entrar-conteudo");

    function ehDaLoja(usuario) {
      return auth.from("store_members").select("store_id").eq("user_id", usuario.id).limit(1)
        .then(function (r) { return !r.error && r.data && r.data.length > 0; });
    }
    function mostrarBotao(sim) {
      botoes.forEach(function (b) { b.href = destino; b.hidden = !sim; });
    }
    function telaLogada(usuario) {
      if (!caixa) { return; }
      caixa.innerHTML = '<div class="entrar-logada"><p>Você está conectada como <b>' + esc(usuario.email) + "</b>.</p>" +
        '<a class="botao botao-escuro botao-grande" href="' + esc(destino) + '">Abrir KGL Gestão</a>' +
        '<button class="botao botao-sair" type="button" id="entrar-sair">Sair</button></div>';
      document.getElementById("entrar-sair").addEventListener("click", function () {
        auth.auth.signOut().then(function () { window.location.reload(); });
      });
    }

    auth.auth.getSession().then(function (r) {
      var sessao = r.data && r.data.session;
      if (!sessao) { mostrarBotao(false); return; }
      ehDaLoja(sessao.user).then(function (sim) {
        mostrarBotao(sim);
        if (sim) { telaLogada(sessao.user); }
      });
    });

    var form = document.getElementById("entrar-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var erro = document.getElementById("entrar-erro");
        var botao = form.querySelector("button");
        erro.textContent = ""; botao.disabled = true; botao.textContent = "Entrando...";
        auth.auth.signInWithPassword({ email: form.email.value.trim(), password: form.senha.value })
          .then(function (r) {
            if (r.error) { throw new Error("E-mail ou senha incorretos."); }
            return ehDaLoja(r.data.user).then(function (sim) {
              if (!sim) {
                return auth.auth.signOut().then(function () { throw new Error("Este login não tem acesso à loja."); });
              }
              window.location.href = destino;
            });
          })
          .catch(function (err) {
            erro.textContent = err.message || "Não foi possível entrar.";
            botao.disabled = false; botao.textContent = "Entrar";
          });
      });
    }
  }

  /* =================================================================
     ANIMAÇÕES
     ================================================================= */
  var semMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1) Elementos com a classe "surgir" aparecem suavemente ao rolar. */
  var obs = (!semMovimento && "IntersectionObserver" in window)
    ? new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.12 })
    : null;
  function revelar() {
    var alvos = document.querySelectorAll(".surgir:not([data-vigiado])");
    alvos.forEach(function (el, i) {
      el.setAttribute("data-vigiado", "");
      if (obs) { el.style.transitionDelay = (i % 4) * 70 + "ms"; obs.observe(el); }
      else { el.classList.add("visivel"); }
    });
  }
  revelar();

  /* 2) Abertura da página inicial: os três aparelhos surgem conforme
        a pessoa rola a página.
        >>> PARA ALTERAR a duração da animação, mude a altura de
        ".cena.animada" no arquivo css/estilo.css (220vh = padrão;
        número maior = animação mais longa). */
  var cena = document.querySelector(".cena");
  if (cena && !semMovimento) {
    cena.classList.add("animada");
    var suave = function (t) { return 1 - Math.pow(1 - t, 3); };
    var limita = function (v) { return Math.max(0, Math.min(1, v)); };
    var el = function (sel) { return cena.querySelector(sel); };
    var texto = el(".cena-texto"), brilho = el(".cena-brilho"), sombra = el(".palco-sombra"),
        dica = el(".dica-rolar"), centro = el(".fone-centro"), esq = el(".fone-esq"), dir = el(".fone-dir");

    /* >>> PARA ALTERAR a "inércia" da animação: 0.10 = mais macio e lento,
       0.25 = acompanha a rolagem mais de perto. */
    var INERCIA = 0.14;

    var alvo = 0, atual = -1, rodando = false, ultimo = 0, alturaTela = window.innerHeight, total = 1, inicio = 0;
    var medir = function () {
      alturaTela = window.innerHeight;
      total = Math.max(1, cena.offsetHeight - alturaTela);
      inicio = cena.getBoundingClientRect().top + window.pageYOffset;
    };
    var lerAlvo = function () { alvo = limita((window.pageYOffset - inicio) / total); };

    var desenhar = function (p) {
      var a = suave(limita(p / 0.55));          // aparelho central sobe
      var b = suave(limita((p - 0.3) / 0.6));   // laterais abrem em leque
      var vh = alturaTela / 100;
      texto.style.transform = "translate3d(0," + ((1 - a) * 14 * vh).toFixed(2) + "px,0)";
      brilho.style.opacity = (0.27 + 0.73 * a).toFixed(3);
      if (dica) { dica.style.opacity = Math.max(0, 1 - a * 3).toFixed(3); }
      centro.style.opacity = a.toFixed(3);
      centro.style.transform = "translate3d(-50%," + ((1 - a) * 50 * vh).toFixed(2) + "px,0) scale(" + (0.86 + 0.14 * a).toFixed(4) + ")";
      var y = (1 - b) * 22 * vh;
      esq.style.opacity = dir.style.opacity = b.toFixed(3);
      esq.style.transform = "translate3d(calc(-50% - " + (b * 78).toFixed(2) + "%), calc(9% + " + y.toFixed(2) + "px), 0) rotate(" + (-9 * b).toFixed(2) + "deg)";
      dir.style.transform = "translate3d(calc(-50% + " + (b * 78).toFixed(2) + "%), calc(9% + " + y.toFixed(2) + "px), 0) rotate(" + (9 * b).toFixed(2) + "deg)";
      if (sombra) { sombra.style.opacity = b.toFixed(3); }
    };

    var quadro = function (agora) {
      var dt = ultimo ? Math.min(64, agora - ultimo) : 16;
      ultimo = agora;
      var passo = 1 - Math.pow(1 - INERCIA, dt / 16.7);   // igual em telas de 60 e 120 Hz
      atual = atual < 0 ? alvo : atual + (alvo - atual) * passo;
      if (Math.abs(alvo - atual) < 0.0004) { atual = alvo; }
      desenhar(atual);
      if (atual !== alvo) { window.requestAnimationFrame(quadro); }
      else { rodando = false; ultimo = 0; }
    };
    var acordar = function () {
      lerAlvo();
      if (!rodando) { rodando = true; window.requestAnimationFrame(quadro); }
    };

    window.addEventListener("scroll", acordar, { passive: true });
    window.addEventListener("resize", function () { medir(); acordar(); });
    window.addEventListener("load", function () { medir(); acordar(); });
    medir();
    acordar();
  }

  /* Liga tudo: busca o estoque (se a conexão estiver ligada) e monta as páginas */
  carregarEstoque().then(montarPaginas);
  iniciarAreaDaLoja();
})();
