-- =====================================================================
-- KGL STORE · VISITANTES ÚNICOS (por IP)
-- Onde rodar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Rode DEPOIS do 2-supabase-acessorios-e-melhorias.sql. Pode repetir.
--
-- Cada visita/clique passa a guardar uma "impressão digital" do IP:
-- um código embaralhado (hash) que permite saber se é a mesma pessoa,
-- mas que NÃO permite descobrir o IP de volta. O IP em si não é salvo.
-- =====================================================================

alter table public.site_events add column if not exists visitante text;

-- Chave secreta usada para embaralhar o IP (criada uma única vez)
create table if not exists public.kgl_segredos (
  nome  text primary key,
  valor text not null
);
alter table public.kgl_segredos enable row level security;
revoke all on public.kgl_segredos from anon, authenticated;
insert into public.kgl_segredos (nome, valor)
values ('sal_visitante', md5(random()::text || clock_timestamp()::text || random()::text))
on conflict (nome) do nothing;

-- Registrar visita / clique (o site já chama esta função)
create or replace function public.kgl_registrar_evento(p_tipo text, p_item_tipo text, p_item_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  cab jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  ip  text  := trim(split_part(coalesce(cab->>'cf-connecting-ip', cab->>'x-forwarded-for', cab->>'x-real-ip', ''), ',', 1));
  sal text;
begin
  if p_tipo not in ('visita','whatsapp','compartilhar') or p_item_tipo not in ('aparelho','acessorio','pagina') then
    return;
  end if;
  select valor into sal from kgl_segredos where nome = 'sal_visitante';
  insert into site_events (store_id, tipo, item_tipo, item_id, visitante)
  values (kgl_loja_do_site(), p_tipo, p_item_tipo, left(p_item_id, 80),
          case when ip = '' then null
               else left(encode(sha256(convert_to(ip || coalesce(sal, ''), 'UTF8')), 'hex'), 24) end);
end $$;
revoke all on function public.kgl_registrar_evento(text,text,text) from public;
grant execute on function public.kgl_registrar_evento(text,text,text) to anon, authenticated;

create index if not exists site_events_data on public.site_events (store_id, created_at);
