"""
Testes de ponta a ponta do site e do KGL Gestão (Playwright).

O Supabase é substituído por versões simuladas (testes/mocks), então
os testes rodam sem internet e sem tocar no banco de verdade.

Como rodar:
    pip install playwright pytest
    playwright install chromium
    pytest testes/
"""
import functools
import http.server
import pathlib
import threading

import pytest
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
MOCK_SITE = (RAIZ / "testes/mocks/supabase-site.js").read_text(encoding="utf-8")
MOCK_GESTAO = (RAIZ / "testes/mocks/supabase-gestao.js").read_text(encoding="utf-8")
SEM_ANIMACAO = ".surgir{opacity:1!important;transform:none!important;transition:none!important}"


class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@pytest.fixture(scope="session")
def servidor():
    handler = functools.partial(_Silencioso, directory=str(RAIZ))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}/"
    srv.shutdown()


@pytest.fixture(scope="session")
def navegador():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


def _pagina(navegador, mock, conexao_ligada=True):
    pg = navegador.new_page(viewport={"width": 1280, "height": 900})
    erros = []
    pg.on("pageerror", lambda e: erros.append(str(e)))
    pg.route("https://cdn.jsdelivr.net/**", lambda r: r.fulfill(body=mock, content_type="application/javascript"))
    if conexao_ligada:
        conexao = (RAIZ / "site/js/conexao.js").read_text(encoding="utf-8").replace("ligado: false", "ligado: true")
        pg.route("**/js/conexao.js", lambda r: r.fulfill(body=conexao, content_type="application/javascript"))
    pg.erros = erros
    return pg


def test_inicio_mostra_destaques_acessorios_e_depoimentos(servidor, navegador):
    pg = _pagina(navegador, MOCK_SITE)
    pg.goto(servidor + "site/index.html")
    pg.wait_for_timeout(800)
    for secao in ["secao-destaques", "secao-acessorios", "secao-depoimentos"]:
        assert pg.evaluate(f"document.getElementById('{secao}').hidden") is False
    assert not pg.erros


def test_filtros_e_ordenacao_dos_iphones(servidor, navegador):
    pg = _pagina(navegador, MOCK_SITE)
    pg.goto(servidor + "site/aparelhos.html")
    pg.wait_for_timeout(600)
    pg.select_option("[data-f=ordem]", "menor")
    precos = pg.eval_on_selector_all("#vitrine .cartao-preco", "e => e.map(x => x.textContent)")
    valores = [int("".join(c for c in p if c.isdigit())) for p in precos]
    assert valores == sorted(valores)
    pg.select_option("[data-f=bat]", "90")
    assert pg.locator("#vitrine .cartao").count() == 2


def test_anuncio_com_laudo_pagamento_e_combo(servidor, navegador):
    pg = _pagina(navegador, MOCK_SITE)
    pg.goto(servidor + "site/aparelho.html?id=a1")
    pg.wait_for_timeout(700)
    assert pg.locator(".laudo-lista li").count() == 6
    assert pg.locator(".pag-tabela").is_hidden()
    pg.click(".pag-ver")
    assert pg.locator(".pag-tabela").is_visible()
    pg.add_style_tag(content=SEM_ANIMACAO)
    pg.check(".combo-item input >> nth=0")
    pg.check(".combo-item input >> nth=1")
    assert "R$ 5.585,20" in pg.inner_text("[data-combo-resumo]")  # 5.200 + 10% off em 349 e 79
    assert "application/ld+json" in pg.content()


def test_avise_me_chama_a_funcao_do_banco(servidor, navegador):
    pg = _pagina(navegador, MOCK_SITE)
    pg.goto(servidor + "site/aparelhos.html?modelo=iphone-14")
    pg.wait_for_timeout(600)
    pg.fill(".vazio [name=nome]", "Ana")
    pg.fill(".vazio [name=whatsapp]", "11900000000")
    pg.click(".vazio .avise-form button")
    pg.wait_for_timeout(300)
    chamadas = pg.evaluate("__RPC.filter(r => r[0] === 'kgl_avise_me').length")
    assert chamadas == 1


def test_site_funciona_sem_banco(servidor, navegador):
    """Com a conexão desligada, o site usa a lista manual de js/aparelhos.js."""
    pg = _pagina(navegador, MOCK_SITE, conexao_ligada=False)
    pg.goto(servidor + "site/aparelhos.html")
    pg.wait_for_timeout(500)
    assert pg.locator("#vitrine .cartao").count() >= 1
    assert not pg.erros


def test_gestao_acessorios_estoque_e_caixa(servidor, navegador):
    pg = _pagina(navegador, MOCK_GESTAO, conexao_ligada=False)
    pg.on("dialog", lambda d: d.accept())
    pg.goto(servidor + "gestao/index.html")
    pg.wait_for_timeout(1500)
    pg.evaluate("showPage('accessories')")
    pg.wait_for_timeout(500)
    antes = pg.evaluate("__DB.accessories.find(a => a.id === 'x2').estoque")
    pg.evaluate("accVendaForm('x2')")
    pg.fill("#xForm [name=quantidade]", "2")
    pg.click("#xSave")
    pg.wait_for_timeout(800)
    depois = pg.evaluate("__DB.accessories.find(a => a.id === 'x2').estoque")
    assert depois == antes - 2
    assert pg.evaluate("__DB.cash_movements.some(m => m.category === 'Venda de acessórios')")
    assert not pg.erros
