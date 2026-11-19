(function(){
 var F=function(n){return "../site/img/demo/cabo.png"};
 var T={
  vitrine_publica:[
   {id:"a1",modelo:"iPhone 15 Pro",armazenamento:"256 GB",cor:"Titânio natural",bateria:91,condicao:"Usado",conservacao:"Excelente",acessorios:"Caixa original, Cabo",descricao:"Sem marcas de uso.",com_nota:true,preco:5200,cadastrado_em:"2026-11-18",fotos:["p/1","p/2"],destaque:"Oferta",checklist:["Face ID / Touch ID","Câmeras","Tela e touch","Som e microfones","Sem bloqueio iCloud","IMEI regular (Anatel)"]},
   {id:"a2",modelo:"iPhone 15",armazenamento:"128 GB",cor:"Preto",bateria:86,condicao:"Usado",preco:3500,cadastrado_em:"2026-11-17",fotos:[],checklist:[]},
   {id:"a3",modelo:"iPhone 13",armazenamento:"128 GB",cor:"Azul",bateria:82,condicao:"Usado",preco:2100,cadastrado_em:"2026-11-16",fotos:[],destaque:"Novidade"},
   {id:"a4",modelo:"iPhone 15",armazenamento:"256 GB",cor:"Rosa",bateria:95,condicao:"Usado",preco:3900,cadastrado_em:"2026-11-15",fotos:[]}],
  vitrine_acessorios:[
   {id:"x1",nome:"Capinha de silicone MagSafe",categoria:"Capinhas",marca:"Originais Apple",compatibilidade:"iPhone 15 Pro",cor:"Preto",preco:349,poucas_unidades:true,destaque:"Novidade",fotos:["acc/1"],descricao:"Original Apple."},
   {id:"x2",nome:"Película de vidro 3D",categoria:"Películas",marca:"Baseus",compatibilidade:"iPhone 15 Pro, iPhone 15",preco:79,fotos:["acc/3"]},
   {id:"x3",nome:"Cabo USB-C 1 m",categoria:"Cabos",marca:"Originais Apple",compatibilidade:"",preco:149,fotos:["acc/4"]},
   {id:"x4",nome:"Carregador 20 W",categoria:"Carregadores",marca:"Baseus",compatibilidade:"",preco:119,fotos:["acc/2"]},
   {id:"x5",nome:"Capinha transparente",categoria:"Capinhas",marca:"Baseus",compatibilidade:"iPhone 13",preco:89,fotos:["acc/5"]}],
  depoimentos_publicos:[
   {nome:"Mariana S.",cidade:"Campinas",aparelho:"iPhone 15 Pro",texto:"Comprei com medo de seminovo, mas veio exatamente como nas fotos. Atendimento impecável!",nota:5,foto_path:"dep/1"},
   {nome:"Rafael T.",cidade:"São Paulo",aparelho:"iPhone 13",texto:"Rápido, honesto e bateria do jeito que estava no anúncio.",nota:5},
   {nome:"Júlia M.",texto:"Ótima experiência, recomendo.",nota:4}]};
 var mapa={"p/1":F("centro"),"p/2":F("direita"),"acc/1":"img/demo/capinha-magsafe.png","acc/2":"img/demo/carregador.png","acc/3":"img/demo/pelicula.png","acc/4":"img/demo/cabo.png","acc/5":"img/demo/capinha-transparente.png","dep/1":F("centro")};
 window.__RPC=[];
 window.supabase={createClient:function(){return{
  auth:{getSession:function(){return Promise.resolve({data:{session:null}})}},
  from:function(t){var q={select:function(){return q},order:function(){return q},eq:function(){return q},limit:function(){return q},then:function(a,b){return Promise.resolve({data:T[t]||[],error:null}).then(a,b)}};return q},
  rpc:function(n,p){window.__RPC.push([n,p]);return Promise.resolve({data:null,error:null})},
  storage:{from:function(){return{createSignedUrls:function(p){return Promise.resolve({data:p.map(function(x){return{path:x,signedUrl:mapa[x]}})})}}}}}}};
})();
