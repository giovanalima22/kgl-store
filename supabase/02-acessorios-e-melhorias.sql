-- =====================================================================
-- KGL STORE · ACESSÓRIOS + MELHORIAS DO SITE
-- Onde rodar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Rode DEPOIS do 1-supabase-vitrine.sql. Pode rodar mais de uma vez.
--
-- Cria:
--   • Acessórios: produtos, fotos, compras e vendas (estoque automático)
--   • Aparelhos: checklist (laudo) e destaque (Oferta / Novidade)
--   • Depoimentos de clientes
--   • "Avise-me quando chegar"
--   • Visitas e cliques no WhatsApp por anúncio
-- O público (site) só lê janelas próprias e só grava avisos e visitas,
-- por funções controladas. Custos e dados internos continuam fechados.
-- =====================================================================

create extension if not exists pgcrypto;

-- Quem é da loja? (usado nas regras de acesso abaixo)
create or replace function public.kgl_membro(loja uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.store_members m where m.store_id = loja and m.user_id = auth.uid());
$$;
revoke all on function public.kgl_membro(uuid) from public;
grant execute on function public.kgl_membro(uuid) to authenticated;

-- A loja do site (primeira loja cadastrada)
create or replace function public.kgl_loja_do_site()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.stores order by id limit 1;
$$;
revoke all on function public.kgl_loja_do_site() from public;

-- ---------------------------------------------------------------------
-- 1) APARELHOS: laudo e destaque
-- ---------------------------------------------------------------------
alter table public.devices add column if not exists site_destaque  text;   -- null, 'Oferta' ou 'Novidade'
alter table public.devices add column if not exists site_checklist jsonb not null default '[]'::jsonb; -- itens aprovados

-- Ligação do caixa com as compras/vendas de acessórios (para estornar junto)
alter table public.cash_movements add column if not exists accessory_ref uuid;

-- ---------------------------------------------------------------------
-- 2) ACESSÓRIOS
-- ---------------------------------------------------------------------
create table if not exists public.accessories (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null,
  nome            text not null,
  categoria       text not null,                 -- Capinhas, Películas, Cabos, Carregadores...
  marca           text not null,                 -- Originais Apple, Baseus...
  compatibilidade text,                          -- "iPhone 15, iPhone 15 Pro" (vazio = universal)
  cor             text,
  descricao       text,
  preco_venda     numeric(12,2) not null default 0,
  custo_medio     numeric(12,2) not null default 0,
  estoque         integer not null default 0 check (estoque >= 0),
  site_publicar   boolean not null default true,
  site_destaque   text,
  created_at      timestamptz not null default now(),
  created_by      uuid
);

create table if not exists public.accessory_photos (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null,
  accessory_id uuid not null references public.accessories(id) on delete cascade,
  storage_path text not null unique,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  created_by   uuid
);

create table if not exists public.accessory_purchases (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null,
  accessory_id   uuid not null references public.accessories(id) on delete cascade,
  quantidade     integer not null check (quantidade > 0),
  custo_unitario numeric(12,2) not null check (custo_unitario >= 0),
  fornecedor     text,
  data           date not null default current_date,
  pago           boolean not null default true,
  created_at     timestamptz not null default now(),
  created_by     uuid
);

create table if not exists public.accessory_sales (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null,
  accessory_id    uuid not null references public.accessories(id) on delete cascade,
  quantidade      integer not null check (quantidade > 0),
  preco_unitario  numeric(12,2) not null check (preco_unitario >= 0),
  desconto        numeric(12,2) not null default 0,
  custo_unitario  numeric(12,2) not null default 0,   -- preenchido sozinho (custo médio do momento)
  cliente         text,
  canal           text,
  forma_pagamento text,
  data            date not null default current_date,
  created_at      timestamptz not null default now(),
  created_by      uuid
);

-- Estoque e custo médio automáticos
create or replace function public.kgl_acessorio_compra() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update accessories a
       set custo_medio = case when a.estoque + new.quantidade > 0
                              then round(((a.custo_medio * a.estoque) + (new.custo_unitario * new.quantidade)) / (a.estoque + new.quantidade), 2)
                              else new.custo_unitario end,
           estoque = a.estoque + new.quantidade
     where a.id = new.accessory_id;
    return new;
  else
    update accessories set estoque = greatest(0, estoque - old.quantidade) where id = old.accessory_id;
    return old;
  end if;
end $$;
drop trigger if exists trg_acessorio_compra on public.accessory_purchases;
create trigger trg_acessorio_compra after insert or delete on public.accessory_purchases
  for each row execute function public.kgl_acessorio_compra();

create or replace function public.kgl_acessorio_venda_antes() returns trigger
language plpgsql security definer set search_path = public as $$
declare a accessories%rowtype;
begin
  select * into a from accessories where id = new.accessory_id for update;
  if a.estoque < new.quantidade then
    raise exception 'Estoque insuficiente: há % unidade(s) de %.', a.estoque, a.nome;
  end if;
  new.custo_unitario := a.custo_medio;
  return new;
end $$;
drop trigger if exists trg_acessorio_venda_antes on public.accessory_sales;
create trigger trg_acessorio_venda_antes before insert on public.accessory_sales
  for each row execute function public.kgl_acessorio_venda_antes();

create or replace function public.kgl_acessorio_venda() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update accessories set estoque = estoque - new.quantidade where id = new.accessory_id;
    return new;
  else
    update accessories set estoque = estoque + old.quantidade where id = old.accessory_id;
    return old;
  end if;
end $$;
drop trigger if exists trg_acessorio_venda on public.accessory_sales;
create trigger trg_acessorio_venda after insert or delete on public.accessory_sales
  for each row execute function public.kgl_acessorio_venda();

-- ---------------------------------------------------------------------
-- 3) DEPOIMENTOS, AVISE-ME e VISITAS
-- ---------------------------------------------------------------------
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null,
  nome       text not null,
  cidade     text,
  aparelho   text,
  texto      text not null,
  nota       integer not null default 5 check (nota between 1 and 5),
  foto_path  text,
  publicado  boolean not null default true,
  ordem      integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_alerts (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null,
  nome       text not null,
  whatsapp   text not null,
  procura    text not null,      -- ex.: "iPhone 15 Pro 256 GB"
  observacao text,
  atendido   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  store_id   uuid not null,
  tipo       text not null check (tipo in ('visita','whatsapp','compartilhar')),
  item_tipo  text not null check (item_tipo in ('aparelho','acessorio','pagina')),
  item_id    text not null,
  created_at timestamptz not null default now()
);
create index if not exists site_events_item on public.site_events (store_id, item_tipo, item_id, created_at);

-- Funções que o site pode chamar (sem login)
create or replace function public.kgl_avise_me(p_nome text, p_whatsapp text, p_procura text, p_obs text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(trim(p_nome)),0) < 2 or length(regexp_replace(coalesce(p_whatsapp,''), '\D', '', 'g')) < 10
     or coalesce(length(trim(p_procura)),0) < 3 then
    raise exception 'Preencha nome, WhatsApp com DDD e o modelo procurado.';
  end if;
  insert into stock_alerts (store_id, nome, whatsapp, procura, observacao)
  values (kgl_loja_do_site(), left(trim(p_nome),80), left(trim(p_whatsapp),30), left(trim(p_procura),120), left(nullif(trim(p_obs),''),300));
end $$;

create or replace function public.kgl_registrar_evento(p_tipo text, p_item_tipo text, p_item_id text)
returns void language sql security definer set search_path = public as $$
  insert into site_events (store_id, tipo, item_tipo, item_id)
  select kgl_loja_do_site(), p_tipo, p_item_tipo, left(p_item_id, 80)
  where p_tipo in ('visita','whatsapp','compartilhar') and p_item_tipo in ('aparelho','acessorio','pagina');
$$;

revoke all on function public.kgl_avise_me(text,text,text,text) from public;
revoke all on function public.kgl_registrar_evento(text,text,text) from public;
grant execute on function public.kgl_avise_me(text,text,text,text) to anon, authenticated;
grant execute on function public.kgl_registrar_evento(text,text,text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4) REGRAS DE ACESSO (só a equipe da loja lê e grava)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['accessories','accessory_photos','accessory_purchases','accessory_sales','testimonials','stock_alerts','site_events'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "equipe da loja" on public.%I', t);
    execute format('create policy "equipe da loja" on public.%I for all to authenticated using (public.kgl_membro(store_id)) with check (public.kgl_membro(store_id))', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 5) JANELAS PÚBLICAS DO SITE (somente leitura)
-- ---------------------------------------------------------------------
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
  ) as fotos,
  d.site_destaque    as destaque,
  d.site_checklist   as checklist
from public.devices d
where d.status = 'in_stock'
  and d.site_publicar = true;

create or replace view public.vitrine_acessorios as
select
  a.id, a.nome, a.categoria, a.marca, a.compatibilidade, a.cor, a.descricao,
  nullif(a.preco_venda, 0) as preco,
  (a.estoque <= 2) as poucas_unidades,
  a.site_destaque as destaque,
  a.created_at as cadastrado_em,
  coalesce(
    (select json_agg(f.storage_path order by f.sort_order, f.storage_path)
       from public.accessory_photos f where f.accessory_id = a.id),
    '[]'::json
  ) as fotos
from public.accessories a
where a.site_publicar = true and a.estoque > 0;

create or replace view public.depoimentos_publicos as
select id, nome, cidade, aparelho, texto, nota, foto_path, ordem, created_at
from public.testimonials
where publicado = true;

revoke all on public.vitrine_publica, public.vitrine_acessorios, public.depoimentos_publicos from anon, authenticated;
grant select on public.vitrine_publica, public.vitrine_acessorios, public.depoimentos_publicos to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6) FOTOS NO SITE: anúncio de aparelho, acessórios e depoimentos
--    (o bucket continua privado; só estas fotos ganham link temporário)
-- ---------------------------------------------------------------------
create or replace function public.foto_esta_na_vitrine(caminho text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
           select 1 from device_photos f join devices d on d.id = f.device_id
            where f.storage_path = caminho and f.para_anuncio = true
              and d.status = 'in_stock' and d.site_publicar = true)
      or exists (
           select 1 from accessory_photos f join accessories a on a.id = f.accessory_id
            where f.storage_path = caminho and a.site_publicar = true and a.estoque > 0)
      or exists (
           select 1 from testimonials t where t.foto_path = caminho and t.publicado = true);
$$;
revoke all on function public.foto_esta_na_vitrine(text) from public;
grant execute on function public.foto_esta_na_vitrine(text) to anon, authenticated;

drop policy if exists "site le fotos da vitrine" on storage.objects;
create policy "site le fotos da vitrine"
  on storage.objects for select to anon
  using (bucket_id = 'kgl-device-photos' and public.foto_esta_na_vitrine(name));

-- Teste rápido:
-- select nome, categoria, marca, preco from public.vitrine_acessorios;
