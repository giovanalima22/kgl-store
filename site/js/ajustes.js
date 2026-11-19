/* =====================================================================
   KGL STORE — AJUSTES DE VENDA E MEDIÇÃO
   Edite os valores abaixo, envie este arquivo para a pasta js/ da
   hospedagem e atualize o site com Ctrl+F5.
   Mesmos cuidados do aparelhos.js: aspas, vírgulas e chaves.
   ===================================================================== */
var AJUSTES = {

  /* Endereço oficial do site (usado no Google e ao compartilhar) */
  site: "https://kglstore.com.br/",

  /* ---------- PAGAMENTO (aparece em todos os anúncios) ---------- */
  pagamento: {
    mostrar: true,

    // Desconto para pagamento no Pix, em %. 0 = mesmo preço do anúncio.
    // Exemplo: 5  ->  "R$ 3.325 no Pix" para um aparelho de R$ 3.500
    descontoPix: 0,

    // Taxa TOTAL que a sua maquininha cobra em cada número de parcelas (%).
    // >>> TROQUE pelos valores do contrato da sua maquininha. <<<
    // O site calcula o valor de forma que você receba o preço cheio do
    // anúncio, igual ao "Simulador de taxas" do KGL Gestão.
    // Para não oferecer alguma opção, apague a linha dela.
    taxaPorParcela: {
      1: 3.5,
      2: 5.5,
      3: 6.5,
      4: 7.5,
      5: 8.5,
      6: 9.5,
      7: 10.5,
      8: 11.5,
      9: 12.5,
      10: 13.5,
      11: 14.5,
      12: 15.5
    }
  },

  /* ---------- COMBOS (acessórios no anúncio do iPhone) ---------- */
  combo: {
    mostrar: true,
    // Desconto (%) nos acessórios quando levados junto com um iPhone.
    // 0 = sem desconto, só a sugestão.
    descontoAcessorios: 10,
    // Quantos acessórios sugerir em cada anúncio
    maximo: 4
  },

  /* ---------- MEDIÇÃO E ANÚNCIOS PAGOS ----------
     Cole os códigos quando criar as contas (veja o LEIA-ME).
     Deixe "" para desligar. */
  rastreamento: {
    googleAnalytics: "",   // exemplo: "G-ABC123XYZ"
    metaPixel: ""          // exemplo: "123456789012345"
  }
};
