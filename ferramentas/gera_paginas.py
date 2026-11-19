import pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "site"

def simbolo(stem="#fff", ilha="#111113", ouro="#c9a45c", fundo=None, extra=""):
    b = f'<rect width="120" height="120" rx="27" fill="{fundo}"/>' if fundo else ''
    return (f'<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {extra}>{b}'
            f'<rect x="27" y="19" width="33" height="82" rx="10" fill="{stem}"/>'
            f'<rect x="35.500" y="27" width="16" height="6.400" rx="3.200" fill="{ilha}"/>'
            f'<path d="M71 60 L95 24 M71 60 L95 96" stroke="{ouro}" stroke-width="13" stroke-linecap="round" fill="none"/></svg>')

# ---- arquivos da logo ----
L = OUT/"img/logo"
(L/"kgl-simbolo-fundo-escuro.svg").write_text(simbolo())
(L/"kgl-simbolo-fundo-claro.svg").write_text(simbolo(stem="#111113", ilha="#fff"))
(L/"kgl-icone.svg").write_text(simbolo(fundo="#111113"))
def lockup(cor, stem, ilha, store):
    return (f'<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">'
            f'<rect x="27" y="19" width="33" height="82" rx="10" fill="{stem}"/><rect x="35.500" y="27" width="16" height="6.400" rx="3.200" fill="{ilha}"/>'
            f'<path d="M71 60 L95 24 M71 60 L95 96" stroke="#c9a45c" stroke-width="13" stroke-linecap="round" fill="none"/>'
            f'<text x="132" y="72" font-family="Inter Display, Inter, Helvetica, Arial, sans-serif" font-weight="800" font-size="62" fill="{cor}">KGL</text>'
            f'<text x="135" y="100" font-family="Inter, Helvetica, Arial, sans-serif" font-weight="500" font-size="17" letter-spacing="10.500" fill="{store}">STORE</text></svg>')
(L/"kgl-logo-fundo-escuro.svg").write_text(lockup("#fff","#fff","#111113","#c9a45c"))
(L/"kgl-logo-fundo-claro.svg").write_text(lockup("#111113","#111113","#fff","#111113"))

FRENTE='''<svg viewBox="0 0 300 610" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<linearGradient id="h-fr" x1="0" x2="1"><stop offset="0" stop-color="#2a2a2d"/><stop offset=".12" stop-color="#8f8f94"/><stop offset=".5" stop-color="#3a3a3e"/><stop offset=".9" stop-color="#9a9a9f"/><stop offset="1" stop-color="#2a2a2d"/></linearGradient>
<linearGradient id="h-sc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1026"/><stop offset=".55" stop-color="#101a3d"/><stop offset="1" stop-color="#05060d"/></linearGradient>
<radialGradient id="h-b1" cx=".25" cy=".8" r=".7"><stop offset="0" stop-color="#e2b866" stop-opacity=".95"/><stop offset="1" stop-color="#e2b866" stop-opacity="0"/></radialGradient>
<radialGradient id="h-b2" cx=".9" cy=".35" r=".7"><stop offset="0" stop-color="#3d6bff" stop-opacity=".9"/><stop offset="1" stop-color="#3d6bff" stop-opacity="0"/></radialGradient>
<radialGradient id="h-b3" cx=".3" cy=".2" r=".5"><stop offset="0" stop-color="#7a4dff" stop-opacity=".55"/><stop offset="1" stop-color="#7a4dff" stop-opacity="0"/></radialGradient>
<linearGradient id="h-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="h-cp"><rect x="11" y="11" width="278" height="588" rx="40"/></clipPath></defs>
<rect width="300" height="610" rx="50" fill="url(#h-fr)"/><rect x="5" y="5" width="290" height="600" rx="45" fill="#050506"/>
<g clip-path="url(#h-cp)"><rect x="11" y="11" width="278" height="588" fill="url(#h-sc)"/><rect x="11" y="11" width="278" height="588" fill="url(#h-b3)"/><rect x="11" y="11" width="278" height="588" fill="url(#h-b2)"/><rect x="11" y="11" width="278" height="588" fill="url(#h-b1)"/>
<path d="M-20 430 C80 330 200 520 330 380 L330 620 L-20 620Z" fill="#05060d" opacity=".55"/><rect x="11" y="11" width="278" height="588" fill="url(#h-gl)"/></g>
<rect x="112" y="26" width="76" height="22" rx="11" fill="#000"/><rect x="100" y="578" width="100" height="5" rx="2.500" fill="#fff" opacity=".7"/></svg>'''
VERSO='''<svg viewBox="0 0 300 610" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<linearGradient id="h-bk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3b40"/><stop offset=".5" stop-color="#1b1b1e"/><stop offset="1" stop-color="#2b2b2f"/></linearGradient>
<linearGradient id="h-fr2" x1="0" x2="1"><stop offset="0" stop-color="#55555a"/><stop offset=".5" stop-color="#2a2a2d"/><stop offset="1" stop-color="#77777c"/></linearGradient></defs>
<rect width="300" height="610" rx="50" fill="url(#h-fr2)"/><rect x="5" y="5" width="290" height="600" rx="45" fill="url(#h-bk)"/>
<rect x="24" y="24" width="120" height="126" rx="34" fill="#242427" stroke="#3d3d42"/>
<circle cx="60" cy="62" r="24" fill="#0a0a0b" stroke="#4a4a50" stroke-width="3"/><circle cx="60" cy="62" r="9" fill="#1c2540"/>
<circle cx="108" cy="112" r="24" fill="#0a0a0b" stroke="#4a4a50" stroke-width="3"/><circle cx="108" cy="112" r="9" fill="#1c2540"/>
<circle cx="112" cy="54" r="7" fill="#d9d2bd"/></svg>'''
GESTAO_ICONE='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>'
WA='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm0 18.200a8.200 8.200 0 0 1-4.200-1.150l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200zm4.500-6.100c-.250-.120-1.460-.720-1.690-.8-.220-.080-.390-.120-.550.120-.160.250-.630.8-.780.970-.140.160-.290.180-.530.060a6.700 6.700 0 0 1-3.330-2.910c-.250-.430.250-.4.720-1.330.080-.160.040-.3-.020-.430-.060-.120-.550-1.330-.760-1.820-.2-.480-.4-.410-.550-.420h-.470a.9.900 0 0 0-.650.300 2.750 2.750 0 0 0-.860 2.040c0 1.200.880 2.370 1 2.530.120.160 1.730 2.640 4.190 3.700 1.560.670 2.170.730 2.950.610.470-.070 1.460-.6 1.670-1.170.2-.580.2-1.070.140-1.170-.060-.110-.220-.170-.470-.290z"/></svg>'
MENU=[("index.html","Início"),("aparelhos.html","iPhones"),("acessorios.html","Acessórios"),("sobre.html","Sobre"),("contato.html","Contato")]
SITE="https://kglstore.com.br/"

def pagina(arq, titulo, desc, corpo, atual=None, body_class="", extra="", robots="index,follow"):
    atual = atual or arq
    nav="\n".join(f'        <a href="{h}"{" class=\"atual\"" if h==atual else ""}>{t}</a>' for h,t in MENU)
    (OUT/arq).write_text(f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- PARA ALTERAR: título da aba do navegador e descrição que aparece no Google -->
  <title>{titulo}</title>
  <meta name="description" content="{desc}">

  <meta name="theme-color" content="#0a0a0b">
  <meta property="og:title" content="{titulo}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{SITE}{'' if arq=='index.html' else arq}">
  <meta property="og:image" content="{SITE}img/compartilhar.jpg">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="robots" content="{robots}">
  <link rel="canonical" href="{SITE}{'' if arq=='index.html' else arq}">
  <link rel="icon" href="img/logo/kgl-icone.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/estilo.css">
</head>
<body{f' class="{body_class}"' if body_class else ''}>

  <!-- ============ MENU DO TOPO (igual em todas as páginas) ============
       PARA ALTERAR um item do menu, mude o texto entre <a ...> e </a>.
       Se mudar aqui, mude também nas outras páginas. -->
  <header class="topo">
    <div class="container">
      <a class="marca" href="index.html" aria-label="KGL Store, página inicial">
        {simbolo(extra='aria-hidden="true"')}
        <span><b>KGL</b><i>STORE</i></span>
      </a>
      <nav class="menu" aria-label="Menu principal">
{nav}
      </nav>
      <div class="topo-acoes">
        <!-- Só aparece para quem entrou com login da loja (veja entrar.html) -->
        <a class="pilula pilula-gestao" href="gestao/" hidden aria-label="Abrir o KGL Gestão">{GESTAO_ICONE}<span>KGL Gestão</span></a>
        <!-- O número do WhatsApp é definido em js/aparelhos.js -->
        <a class="pilula" data-whats href="contato.html" target="_blank" rel="noopener" aria-label="Falar pelo WhatsApp">{WA}<span>WhatsApp</span></a>
        <button class="menu-botao" type="button" aria-label="Abrir menu" aria-expanded="false"><span></span></button>
      </div>
    </div>
  </header>

  <main>
{corpo}
  </main>

  <!-- ============ RODAPÉ ============ -->
  <footer class="rodape">
    <div class="container">
      <span>KGL Store · iPhones seminovos</span>
      <span>iPhone é marca registrada da Apple Inc. A KGL Store é uma loja independente.</span>
      <a class="rodape-entrar" href="entrar.html">Área da loja</a>
    </div>
  </footer>
{extra}
  <!-- Dados da loja e dos aparelhos (é este que você edita) -->
  <script src="js/aparelhos.js"></script>
  <!-- Pix, parcelamento, combos e Google/Meta (é este que você edita) -->
  <script src="js/ajustes.js"></script>
  <!-- Estoque ao vivo do KGL Gestão (Supabase). Para desligar, veja js/conexao.js -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/conexao.js"></script>
  <!-- Funcionamento do site -->
  <script src="js/site.js"></script>
</body>
</html>
''', encoding="utf-8")

FAIXA=f'''      <!-- ============ FAIXA "NÃO ACHOU O MODELO?" ============
           A pessoa deixa nome e WhatsApp; o pedido aparece no
           KGL Gestão > Loja online > Avise-me quando chegar.
           PARA ALTERAR: mude os textos abaixo. -->
      <div class="faixa faixa-avise surgir">
        <div>
          <h2>Não achou o modelo que procura?</h2>
          <p>Deixe seu WhatsApp. Avisamos assim que chegar.</p>
        </div>
        <div data-avise-aqui=""></div>
      </div>'''

pagina("index.html","KGL Store | iPhones seminovos",
"iPhones seminovos conferidos, com fotos reais de cada unidade e atendimento direto pelo WhatsApp.",
f'''
    <!-- ============ ABERTURA COM ANIMAÇÃO ============
         Conforme a pessoa rola a página, os três aparelhos sobem e se
         abrem em leque.

         PARA ALTERAR OS TEXTOS: mude o que está entre as tags abaixo.
         O trecho dentro de <em> ... </em> é o que aparece em dourado.

         FOTOS DOS TRÊS APARELHOS: envie para a pasta img/abertura/
         com estes nomes exatos:
             esquerda.png   (aparelho da esquerda)
             direita.png    (aparelho da direita)
             centro.png     (aparelho do centro, na frente)
         Enquanto uma foto não existir, aparece a ilustração no lugar.
         Use PNG com fundo transparente, aparelho em pé, recortado
         rente às bordas, com cerca de 600 x 1220 px.
         Para mudar o nome ou a pasta, mude o src="..." abaixo. -->
    <section class="cena">
      <div class="cena-fixa">
        <div class="cena-brilho" aria-hidden="true"></div>
        <div class="cena-texto">
          <p class="rotulo">iPhones seminovos selecionados</p>
          <h1>Seu próximo iPhone<br><em>está aqui.</em></h1>
          <p class="cena-sub">Seminovo bom de verdade, sem surpresa. Cada iPhone é conferido ponto a ponto e mostrado exatamente como é, para você comprar com total segurança.</p>
          <div class="cena-botoes">
            <a class="botao botao-branco" href="#escolha">Ver aparelhos</a>
            <a class="botao botao-contorno" data-whats href="contato.html" target="_blank" rel="noopener">{WA} Falar no WhatsApp</a>
          </div>
        </div>

        <div class="palco" aria-hidden="true">
          <div class="palco-sombra"></div>
          <!-- aparelho da esquerda -->
          <div class="fone fone-esq"><img src="img/abertura/esquerda.png" alt="" onerror="this.remove()">{VERSO}</div>
          <!-- aparelho da direita -->
          <div class="fone fone-dir"><img src="img/abertura/direita.png" alt="" onerror="this.remove()">{VERSO}</div>
          <!-- aparelho do centro -->
          <div class="fone fone-centro"><img src="img/abertura/centro.png" alt="" onerror="this.remove()">{FRENTE}</div>
        </div>

        <p class="dica-rolar">Role para ver</p>
      </div>
    </section>

    <!-- ============ FAIXA DE CONFIANÇA ============
         PARA ALTERAR: o texto em <b> é o título; o de baixo é a explicação.
         Escreva só o que a loja realmente cumpre. -->
    <section class="confianca">
      <div class="container">
        <div><b>Fotos reais</b>Da unidade que você vai receber</div>
        <div><b>Dados conferidos</b>Bateria, conservação e procedência</div>
        <div><b>Atendimento direto</b>Tire dúvidas antes de fechar</div>
      </div>
    </section>

    <!-- ============ DESTAQUES ============
         Aparecem aqui os aparelhos e acessórios marcados como
         "Oferta" ou "Novidade" no KGL Gestão. Sem destaque, some sozinha. -->
    <section class="secao secao-destaques" id="secao-destaques" hidden>
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Destaques</p>
            <h2>Ofertas e novidades.</h2>
          </div>
        </div>
        <div class="grade grade-4" id="destaques"></div>
      </div>
    </section>

    <!-- ============ ESCOLHA SEU MODELO ============
         Os cartões são montados automaticamente a partir da lista
         MODELOS do arquivo js/aparelhos.js. As imagens ficam em
         img/modelos/ (veja o LEIA-ME dessa pasta). -->
    <section class="secao" id="escolha">
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Escolha seu modelo</p>
            <h2>Qual iPhone você procura?</h2>
          </div>
          <a class="link-todos" href="aparelhos.html">Ver todos os aparelhos →</a>
        </div>
        <div class="grade grade-4" id="modelos">
          <noscript><p>Ative o JavaScript do navegador para ver os aparelhos.</p></noscript>
        </div>

{FAIXA}
      </div>
    </section>

    <!-- ============ ACESSÓRIOS ============
         Montado com os acessórios do KGL Gestão. Sem estoque, some. -->
    <section class="secao secao-cinza" id="secao-acessorios" hidden>
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Acessórios</p>
            <h2>Complete seu iPhone.</h2>
            <p class="texto" id="acessorios-marcas"></p>
          </div>
          <a class="link-todos" href="acessorios.html">Ver todos os acessórios →</a>
        </div>
        <div class="grade grade-4" id="acessorios-home"></div>
      </div>
    </section>

    <!-- ============ DEPOIMENTOS ============
         Cadastrados no KGL Gestão > Loja online > Depoimentos. -->
    <section class="secao" id="secao-depoimentos" hidden>
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Quem comprou</p>
            <h2>O que dizem os clientes.</h2>
          </div>
        </div>
        <div class="depoimentos" id="depoimentos"></div>
      </div>
    </section>

    <!-- Dados para o Google entender que este site é uma loja -->
    <script type="application/ld+json">
    {{"@context":"https://schema.org","@type":"Store","name":"KGL Store","url":"{SITE}","logo":"{SITE}img/logo/kgl-icone-1024.png","image":"{SITE}img/compartilhar.jpg","description":"iPhones seminovos conferidos, com fotos reais de cada unidade, e acessórios originais Apple e Baseus."}}
    </script>''')

pagina("aparelhos.html","iPhones seminovos disponíveis | KGL Store",
"iPhones seminovos disponíveis na KGL Store. Escolha o modelo e veja as fotos reais de cada unidade.",
f'''
    <!-- ============ LISTA DE APARELHOS ============
         Os filtros e os cartões são montados automaticamente a partir
         do arquivo js/aparelhos.js.
         PARA ALTERAR os textos do topo, mude abaixo. -->
    <section class="secao pagina-topo">
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Aparelhos disponíveis</p>
            <h1 id="vitrine-titulo">Escolha com confiança.</h1>
            <p class="texto">Clique em um aparelho para ver as fotos reais e todos os detalhes daquela unidade.</p>
          </div>
        </div>
        <div class="filtros" id="filtros"></div>
        <!-- Armazenamento, cor, preço, bateria e ordenação (automático) -->
        <div class="filtros-extra" id="filtros-extra"></div>
        <div class="grade" id="vitrine">
          <noscript><p>Ative o JavaScript do navegador para ver os aparelhos.</p></noscript>
        </div>

{FAIXA}
      </div>
    </section>''')

pagina("aparelho.html","Aparelho | KGL Store",
"Fotos reais e detalhes do aparelho: bateria, conservação, acessórios e procedência.",
'''
    <!-- ============ ANÚNCIO DO APARELHO ============
         Esta página serve para TODOS os aparelhos. O conteúdo (fotos
         reais, preço, bateria etc.) vem do arquivo js/aparelhos.js. -->
    <div class="container">
      <div id="detalhe">
        <noscript><p>Ative o JavaScript do navegador para ver este aparelho.</p></noscript>
      </div>

      <!-- ============ COMO COMPRAR ============
           PARA ALTERAR: mude os textos dos três passos para refletir
           como a KGL Store realmente trabalha (formas de pagamento,
           entrega, retirada). -->
      <section class="passos">
        <div class="passo surgir"><span class="passo-n">1</span><span><b>Chame no WhatsApp</b>Tire dúvidas e peça mais fotos ou vídeo do aparelho.</span></div>
        <div class="passo surgir"><span class="passo-n">2</span><span><b>Combine pagamento e entrega</b>Direto com a KGL Store, sem intermediários.</span></div>
        <div class="passo surgir"><span class="passo-n">3</span><span><b>Receba e confira</b>O aparelho das fotos é o que você recebe.</span></div>
      </section>
    </div>''', atual="aparelhos.html", body_class="tem-barra-fixa",
extra='''
  <!-- Barra de WhatsApp que fica fixa no rodapé da tela, só no celular -->
  <div class="barra-fixa" id="barra-fixa" hidden></div>
''')

pagina("sobre.html","Sobre | KGL Store","Conheça a KGL Store: iPhones seminovos vendidos com transparência.",
'''
    <section class="secao pagina-topo">
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Sobre a KGL</p>
            <h1>Seminovo bom de verdade.</h1>
          </div>
        </div>

        <!-- ============ TEXTO SOBRE A LOJA ============
             PARA ALTERAR: reescreva os parágrafos abaixo com a história
             da KGL Store. Cada parágrafo fica entre <p> e </p>. -->
        <div class="texto-longo">
          <p>A KGL Store vende iPhones seminovos do jeito que a gente gostaria de comprar: sabendo exatamente o que está levando.</p>
          <p>Por isso cada anúncio mostra fotos reais daquela unidade, a saúde da bateria, o estado de conservação, o que acompanha e a procedência. E qualquer dúvida você tira direto com a gente, pelo WhatsApp, antes de fechar negócio.</p>
        </div>

        <!-- ============ TRÊS PILARES ============
             PARA ALTERAR: título em <h3>, explicação em <p>. -->
        <div class="pilares">
          <div class="pilar surgir"><h3>Fotos reais</h3><p>Você vê a unidade que vai receber, não uma imagem de catálogo.</p></div>
          <div class="pilar surgir"><h3>Informação clara</h3><p>Bateria, conservação e procedência conferidas e descritas sem rodeio.</p></div>
          <div class="pilar surgir"><h3>Atendimento próximo</h3><p>Conversa direta pelo WhatsApp, do primeiro contato à entrega.</p></div>
        </div>
      </div>
    </section>''')

pagina("contato.html","Contato | KGL Store","Fale com a KGL Store pelo WhatsApp.",
f'''
    <section class="secao pagina-topo">
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Contato</p>
            <h1>Fale com a KGL Store.</h1>
            <p class="texto">Atendimento direto para tirar dúvidas antes de fechar negócio.</p>
          </div>
        </div>

        <!-- ============ CARTÃO DE CONTATO ============
             O número do WhatsApp, o Instagram e a cidade são definidos
             no arquivo js/aparelhos.js (bloco LOJA). -->
        <div class="contato-cartao">
          <p>Chame no WhatsApp e diga qual aparelho você procura.</p>
          <a class="botao botao-whats botao-grande" data-whats href="#" target="_blank" rel="noopener">{WA} Chamar no WhatsApp</a>
          <dl class="lista-contato" id="contato-extras"></dl>
        </div>
      </div>
    </section>''')
pagina("entrar.html","Área da loja | KGL Store","Acesso restrito da equipe KGL Store.",
'''
    <section class="secao pagina-topo">
      <div class="container">
        <!-- ============ LOGIN DA EQUIPE ============
             Usa o MESMO e-mail e senha do KGL Gestão.
             Depois de entrar, aparece o botão "KGL Gestão" no topo do site. -->
        <div class="entrar-cartao">
          <p class="rotulo">Área da loja</p>
          <h1>Entrar.</h1>
          <div id="entrar-conteudo">
            <form id="entrar-form" autocomplete="on">
              <label>E-mail<input name="email" type="email" required autocomplete="username"></label>
              <label>Senha<input name="senha" type="password" required autocomplete="current-password"></label>
              <button class="botao botao-escuro botao-grande" type="submit">Entrar</button>
              <p class="entrar-erro" id="entrar-erro" role="alert"></p>
            </form>
          </div>
        </div>
      </div>
    </section>''', robots="noindex,nofollow")

pagina("acessorios.html","Acessórios para iPhone | KGL Store",
"Capinhas, películas, cabos e carregadores para iPhone: originais Apple, Baseus e mais. Atendimento pelo WhatsApp.",
'''
    <!-- ============ LISTA DE ACESSÓRIOS ============
         Montada automaticamente com os acessórios do KGL Gestão que
         têm estoque e estão marcados "Mostrar no site".
         Separados por marca (Originais Apple primeiro). -->
    <section class="secao pagina-topo">
      <div class="container">
        <div class="secao-topo">
          <div>
            <p class="rotulo">Acessórios</p>
            <h1 id="acc-titulo">Complete seu iPhone.</h1>
            <p class="texto">Capinhas, películas, cabos e carregadores selecionados. Originais Apple e marcas de confiança.</p>
          </div>
        </div>
        <div class="filtros" id="filtros-categoria"></div>
        <div class="filtros filtros-marca" id="filtros-marca"></div>
        <div id="vitrine-acessorios">
          <noscript><p>Ative o JavaScript do navegador para ver os acessórios.</p></noscript>
        </div>
      </div>
    </section>''', atual="acessorios.html")

pagina("acessorio.html","Acessório | KGL Store",
"Fotos, compatibilidade e preço do acessório na KGL Store.",
'''
    <!-- ============ ANÚNCIO DO ACESSÓRIO ============
         Serve para todos os acessórios; o conteúdo vem do KGL Gestão. -->
    <div class="container">
      <div id="detalhe-acessorio">
        <noscript><p>Ative o JavaScript do navegador para ver este produto.</p></noscript>
      </div>
    </div>''', atual="acessorios.html", body_class="tem-barra-fixa",
extra='''
  <!-- Barra de WhatsApp que fica fixa no rodapé da tela, só no celular -->
  <div class="barra-fixa" id="barra-fixa" hidden></div>
''')

# ---- arquivos para o Google ----
(OUT/"robots.txt").write_text(f"""User-agent: *
Allow: /
Disallow: /gestao/
Disallow: /entrar.html

Sitemap: {SITE}sitemap.xml
""")
import datetime
hoje=datetime.date.today().isoformat()
paginas=[("",1.0),("aparelhos.html",0.9),("acessorios.html",0.8),("sobre.html",0.5),("contato.html",0.5)]
(OUT/"sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  "".join(f"  <url><loc>{SITE}{p}</loc><lastmod>{hoje}</lastmod><priority>{pr}</priority></url>\n" for p,pr in paginas) + "</urlset>\n")
print("ok")
