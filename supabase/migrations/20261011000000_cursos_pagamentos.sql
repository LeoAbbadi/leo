-- Cursos, pedidos, matrículas e avisos de pagamento do site Leo & Helena.
--
-- Regra de ouro: o navegador nunca grava nada aqui. Quem cria pedidos e libera
-- cursos são as Edge Functions (com a chave de serviço). O navegador só lê o
-- que as políticas abaixo permitem.

create extension if not exists pgcrypto;

-- ---------- cursos ----------
create table public.courses (
  slug text primary key,
  title text not null,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'BRL',
  max_installments integer not null default 1 check (max_installments between 1 and 12),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Preço oficial (é este valor que o servidor cobra, não o que aparece no site).
insert into public.courses (slug, title, price_cents, max_installments) values
  ('irlanda-do-zero', 'Irlanda do Zero', 39700, 12),
  ('planilha-primeiro-mes', 'Planilha do Primeiro Mês', 4700, 1),
  ('mentoria-a-dois', 'Mentoria a Dois', 29000, 6)
on conflict (slug) do update
  set title = excluded.title,
      price_cents = excluded.price_cents,
      max_installments = excluded.max_installments;

-- ---------- aulas (o link do vídeo só aparece para quem comprou) ----------
create table public.lessons (
  id text primary key,
  course_slug text not null references public.courses (slug),
  title text not null,
  position integer not null,
  preview boolean not null default false,
  video_url text
);

-- ---------- pedidos ----------
create type public.order_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded');
create type public.payment_method as enum ('pix', 'card');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- código secreto que deixa o comprador acompanhar o pedido sem login
  public_token text not null default encode(gen_random_bytes(18), 'hex'),
  course_slug text not null references public.courses (slug),
  name text not null,
  email text not null check (email = lower(email)),
  cpf text,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL',
  method public.payment_method not null,
  status public.order_status not null default 'pending',
  provider text not null default 'mercadopago',
  provider_payment_id text,
  provider_preference_id text,
  pix_copy_paste text,
  pix_qr_base64 text,
  checkout_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  verification jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_email_idx on public.orders (email);
create index orders_status_idx on public.orders (status, created_at desc);
create unique index orders_provider_payment_id_key on public.orders (provider_payment_id)
  where provider_payment_id is not null;

-- ---------- matrículas (quem pode assistir o quê) ----------
create table public.enrollments (
  id bigint generated always as identity primary key,
  email text not null check (email = lower(email)),
  course_slug text not null references public.courses (slug),
  order_id uuid not null references public.orders (id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index enrollments_order_key on public.enrollments (order_id);
create index enrollments_email_idx on public.enrollments (email);

-- ---------- avisos recebidos do Mercado Pago (auditoria) ----------
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null,
  topic text,
  resource_id text,
  request_id text,
  signature_valid boolean not null,
  outcome text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- ---------- segurança por linha ----------
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.enrollments enable row level security;
alter table public.payment_events enable row level security;

-- Dono = usuário com app_metadata.role = "admin" (veja docs/pagamentos.md).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

create or replace function public.session_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create policy "cursos são públicos" on public.courses
  for select using (true);

create policy "aulas abertas, compradas ou do dono" on public.lessons
  for select using (
    preview
    or public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.course_slug = lessons.course_slug
        and e.revoked_at is null
        and e.email = public.session_email()
    )
  );

create policy "aluno vê os próprios pedidos e o dono vê todos" on public.orders
  for select using (email = public.session_email() or public.is_admin());

create policy "aluno vê as próprias matrículas e o dono vê todas" on public.enrollments
  for select using (email = public.session_email() or public.is_admin());

create policy "dono vê os avisos de pagamento" on public.payment_events
  for select using (public.is_admin());

-- Sem políticas de insert/update/delete: só as Edge Functions escrevem.

-- ---------- funções ----------

-- Acompanhar o pedido sem login (página do Pix), usando o código secreto.
create or replace function public.order_status(p_id uuid, p_token text)
returns table (
  id uuid,
  course_slug text,
  name text,
  email text,
  cpf text,
  amount_cents integer,
  method public.payment_method,
  status public.order_status,
  provider_payment_id text,
  created_at timestamptz,
  paid_at timestamptz,
  expires_at timestamptz,
  pix_copy_paste text,
  pix_qr_base64 text,
  checkout_url text,
  verification jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id, o.course_slug, o.name, o.email, null::text, o.amount_cents, o.method,
    case
      when o.status = 'pending' and o.expires_at is not null and o.expires_at < now()
        then 'expired'::public.order_status
      else o.status
    end,
    o.provider_payment_id, o.created_at, o.paid_at, o.expires_at,
    o.pix_copy_paste, o.pix_qr_base64, o.checkout_url, o.verification
  from public.orders o
  where o.id = p_id and o.public_token = p_token
$$;

revoke all on function public.order_status(uuid, text) from public;
grant execute on function public.order_status(uuid, text) to anon, authenticated;

-- Aplica o resultado de um pagamento e libera (ou remove) o acesso, tudo junto.
-- Chamada só pela Edge Function do aviso do Mercado Pago.
create or replace function public.apply_payment(
  p_order uuid,
  p_status public.order_status,
  p_payment_id text,
  p_verification jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  update public.orders
     set status = p_status,
         provider_payment_id = coalesce(p_payment_id, provider_payment_id),
         paid_at = case when p_status = 'paid' then coalesce(paid_at, now()) else paid_at end,
         verification = coalesce(p_verification, verification),
         updated_at = now()
   where id = p_order
     -- aviso atrasado não desfaz um pagamento já confirmado
     and not (status = 'paid' and p_status in ('pending', 'failed', 'expired'))
     and status <> 'refunded'
  returning * into o;

  if o.id is null then
    select * into o from public.orders where id = p_order;
    return o;
  end if;

  if p_status = 'paid' then
    insert into public.enrollments (email, course_slug, order_id)
    values (o.email, o.course_slug, o.id)
    on conflict (order_id) do update set revoked_at = null;
  elsif p_status = 'refunded' then
    update public.enrollments set revoked_at = now()
     where order_id = o.id and revoked_at is null;
  end if;

  return o;
end
$$;

revoke all on function public.apply_payment(uuid, public.order_status, text, jsonb) from public, anon, authenticated;

-- Confirmação manual pelo dono (ex.: Pix recebido direto na conta).
create or replace function public.admin_mark_order_paid(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  if not public.is_admin() then
    raise exception 'Apenas os donos podem confirmar pedidos.' using errcode = '42501';
  end if;

  update public.orders
     set status = 'paid',
         paid_at = coalesce(paid_at, now()),
         updated_at = now(),
         verification = jsonb_build_object(
           'signatureValid', false,
           'amountMatches', false,
           'confirmedWithProvider', false,
           'source', 'manual',
           'checkedAt', now(),
           'by', public.session_email()
         )
   where id = p_id and status in ('pending', 'expired', 'failed')
  returning * into o;

  if o.id is null then
    raise exception 'Pedido não encontrado ou já confirmado.';
  end if;

  insert into public.enrollments (email, course_slug, order_id)
  values (o.email, o.course_slug, o.id)
  on conflict (order_id) do update set revoked_at = null;
end
$$;

revoke all on function public.admin_mark_order_paid(uuid) from public, anon;
grant execute on function public.admin_mark_order_paid(uuid) to authenticated;
