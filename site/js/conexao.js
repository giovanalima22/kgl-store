/* =====================================================================
   KGL STORE — CONEXÃO COM O KGL GESTÃO (estoque ao vivo)

   Ligado (ligado: false   // mude para true depois de preencher url e chave): o site mostra os aparelhos cadastrados no
   painel de gestão que estão "Disponível" e com "Mostrar no site = Sim".
   Fotos, preço, bateria, cor, acompanha e descrição vêm de lá.
   Vendeu ou reservou no painel -> sai do site sozinho.

   Desligado (ligado: false): o site volta a usar a lista manual de
   js/aparelhos.js.

   A chave abaixo é a chave PÚBLICA (publishable) do Supabase, a mesma
   que já fica no painel. Ela só enxerga a "vitrine_publica": custo,
   IMEI, fornecedor, vendas e caixa ficam inacessíveis.
   NUNCA coloque aqui a chave "secret" / "service_role".
   ===================================================================== */
var SUPABASE_VITRINE = {
  ligado: false,   // mude para true depois de preencher url e chave
  url: "https://SEU-PROJETO.supabase.co",
  chave: "SUA_CHAVE_PUBLISHABLE",
  bucket: "kgl-device-photos",
  /* Endereço do painel de gestão (pasta public_html/gestao/) */
  gestao: "gestao/"
};
