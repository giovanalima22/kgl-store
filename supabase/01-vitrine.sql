-- =====================================================================
-- KGL STORE · LIGAÇÃO ENTRE O KGL GESTÃO E O SITE
-- Onde rodar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Pode rodar mais de uma vez sem problema (inclusive se já rodou a versão anterior).
--
-- O que este script faz:
--   1. Cria 5 campos novos no cadastro do aparelho, só para o site
--      (mostrar no site, conservação, acessórios, descrição e o
--      armazenamento já existente continua igual).
--   2. Cria a "vitrine_publica": uma janela SOMENTE LEITURA com os
--      dados que podem aparecer no site. Custo, IMEI, número de série,
--      fornecedor, compras, vendas e caixa NUNCA passam por ela.
--   3. Libera para o site apenas as FOTOS de aparelhos publicados e
--      disponíveis. Notas fiscais continuam fechadas.
-- =====================================================================

-- 1) Campos novos do aparelho -----------------------------------------
alter table public.devices add column if not exists site_publicar    boolean not null default true;
alter table public.devices add column if not exists site_conservacao text;
alter table public.devices add column if not exists site_acessorios  text;
alter table public.devices add column if not exists site_descricao   text;

-- 1b) Tipo da foto: estado (só administração) x anúncio (vai para o site)
alter table public.device_photos add column if not exists para_anuncio boolean not null default false;
-- Fotos antigas ficam como "estado" (só administração). Para levar alguma
-- para o anúncio, use o botão "Usar no anúncio" na edição do aparelho.

-- 2) Vitrine pública ---------------------------------------------------
-- Aparece no site: aparelho com status "in_stock" (Disponível) e com
-- "Mostrar no site" = Sim. Vendeu ou reservou -> some do site sozinho.
drop view if exists public.vitrine_publica;
create view public.vitrine_publica as
select
  d.id,
  d.model            as modelo,
  d.storage          as armazenamento,
  d.color            as cor,
  d.battery_health   as bateria,
  d.condition        as condicao,
  d.site_conservacao as conservacao,
  d.site_acessorios  as acessorios,
  d.site_descricao   as descricao,
  d.has_invoice      as com_nota,
  nullif(d.sale_price, 0) as preco,
  d.created_at       as cadastrado_em,
  coalesce(
    (select json_agg(f.storage_path order by f.sort_order, f.storage_path)
       from public.device_photos f
      where f.device_id = d.id
        and f.para_anuncio = true),
    '[]'::json
  ) as fotos
from public.devices d
where d.status = 'in_stock'
  and d.site_publicar = true;
-- Se um dia houver mais de uma loja no mesmo banco, acrescente acima:
--   and d.store_id = 'ID-DA-LOJA'

-- Só leitura, e só desta janela, para o público (chave publishable/anon)
revoke all on public.vitrine_publica from anon, authenticated;
grant select on public.vitrine_publica to anon, authenticated;

-- 3) Fotos -------------------------------------------------------------
-- Função que responde "esta foto pertence a um aparelho publicado?"
create or replace function public.foto_esta_na_vitrine(caminho text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.device_photos f
      join public.devices d on d.id = f.device_id
     where f.storage_path = caminho
       and f.para_anuncio = true
       and d.status = 'in_stock'
       and d.site_publicar = true
  );
$$;
revoke all on function public.foto_esta_na_vitrine(text) from public;
grant execute on function public.foto_esta_na_vitrine(text) to anon, authenticated;

-- O bucket kgl-device-photos continua PRIVADO; o site só consegue gerar
-- link temporário para fotos de aparelhos que estão na vitrine.
drop policy if exists "site le fotos da vitrine" on storage.objects;
create policy "site le fotos da vitrine"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'kgl-device-photos'
    and public.foto_esta_na_vitrine(name)
  );

-- Teste rápido (deve listar seus aparelhos disponíveis):
-- select modelo, armazenamento, cor, preco, json_array_length(fotos) from public.vitrine_publica;
