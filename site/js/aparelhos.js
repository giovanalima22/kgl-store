/* =====================================================================
   KGL STORE — DADOS DO SITE
   Este é o arquivo que você edita no dia a dia.
   Depois de editar, envie para a pasta js/ da hospedagem (substituindo
   o antigo) e atualize o site com Ctrl+F5.

   CUIDADOS AO EDITAR
   - Textos ficam sempre entre aspas:  "assim"
   - Cada linha de dado termina com vírgula
   - Não apague chaves { }, colchetes [ ] nem vírgulas
   - Se o site ficar em branco depois de editar, quase sempre é uma
     vírgula ou aspas faltando neste arquivo
   ===================================================================== */


/* ---------- 1. DADOS DA LOJA ---------- */
const LOJA = {

  // WhatsApp: código do país + DDD + número, só números.
  // Exemplo: 55 (Brasil) + 11 (DDD) + 999998888  ->  "5511999998888"
  whatsapp: "5500000000000",   // <<< TROQUE PELO SEU NÚMERO

  // Opcionais. Deixe "" para não aparecer na página Contato.
  instagram: "",   // exemplo: "kglstore" (sem o @)
  cidade: "",      // exemplo: "São Paulo - SP"

  // Mostrar o preço nos cartões da página Aparelhos?
  //   true  = mostra (ajuda a diferenciar dois aparelhos do mesmo modelo)
  //   false = preço aparece só dentro do anúncio
  mostrarPrecoNaVitrine: true
};


/* ---------- 2. MODELOS (cartões da página inicial) ----------
   Cada linha vira um cartão "iPhone 16", "iPhone 15"... na página
   inicial. Ao clicar, a pessoa vê só os aparelhos daquele modelo.

   id    identificador, sem espaços nem acentos
   nome  nome que aparece no cartão
   foto  imagem do modelo, na pasta img/modelos/
         Enquanto o arquivo não existir, aparece uma ilustração.

   PARA ADICIONAR UM MODELO: copie uma linha e troque os dados.
   PARA REMOVER: apague a linha.
   A ordem aqui é a ordem em que aparecem no site.
   ------------------------------------------------------------------ */
const MODELOS = [
  { id: "iphone-16", nome: "iPhone 16", foto: "img/modelos/iphone-16.png" },
  { id: "iphone-15", nome: "iPhone 15", foto: "img/modelos/iphone-15.png" },
  { id: "iphone-14", nome: "iPhone 14", foto: "img/modelos/iphone-14.png" },
  { id: "iphone-13", nome: "iPhone 13", foto: "img/modelos/iphone-13.png" }
];


/* ---------- 3. APARELHOS (cada unidade à venda) ----------
   Cada aparelho fica entre { } e separado do próximo por vírgula.

   PARA ADICIONAR: copie um bloco inteiro (de { até },), cole abaixo
                   do último e troque os dados.
   PARA REMOVER (vendeu): apague o bloco inteiro.

   id            identificador único, sem espaços nem acentos (vai no link)
   linha         o "id" do modelo lá em cima (ex.: "iphone-16").
                 Um iPhone 16 Pro também pode usar linha "iphone-16"
                 para aparecer junto com os iPhone 16.
   modelo        nome completo, ex.: "iPhone 16 Pro"
   armazenamento ex.: "128 GB"
   cor           ex.: "Preto"
   preco         número sem pontos (3500). Use null para mostrar "Consulte"
   bateria       saúde da bateria, ex.: "87%"
   conservacao   ex.: "Excelente"
   pecas         ex.: "Sem troca informada"
   acessorios    o que acompanha, separado por vírgula,
                 ex.: "Caixa original, Nota fiscal, Cabo"
   procedencia   ex.: "Nacional, único dono"
   descricao     texto livre sobre ESTA unidade (estado da tela, laterais,
                 câmeras, observações). Aparece em "Detalhes do aparelho".
   fotos         fotos REAIS desta unidade, na pasta img/
                 ex.: ["img/img1.jpeg", "img/img2.jpeg"]
                 A primeira é a principal. Aparecem só dentro do anúncio.

   Campo em branco ("") simplesmente não aparece no site.
   ------------------------------------------------------------------ */
const APARELHOS = [

  {
    id: "iphone-16-128gb",
    linha: "iphone-16",
    modelo: "iPhone 16",
    armazenamento: "128 GB",
    cor: "",                      // <<< preencha a cor
    preco: 3500,
    bateria: "87%",
    conservacao: "Excelente",
    pecas: "Sem troca informada",
    acessorios: "Caixa original, Nota fiscal",
    procedencia: "",
    descricao: "",                // <<< descreva esta unidade
    fotos: []
  }

  // Exemplo de segundo aparelho. Para usar: coloque uma vírgula depois
  // da chave } acima, apague as duas barras // do começo de cada linha
  // abaixo e troque os dados.
  //
  // {
  //   id: "iphone-15-pro-256gb",
  //   linha: "iphone-15",
  //   modelo: "iPhone 15 Pro",
  //   armazenamento: "256 GB",
  //   cor: "Titânio natural",
  //   preco: null,
  //   bateria: "",
  //   conservacao: "",
  //   pecas: "",
  //   acessorios: "",
  //   procedencia: "",
  //   descricao: "",
  //   fotos: []
  // }

];
