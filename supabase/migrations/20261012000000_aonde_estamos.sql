-- "Aonde estamos agora?": cada linha é uma chegada. A mais recente é onde vocês estão.
create table public.travel_log (
  id bigint generated always as identity primary key,
  city text not null,
  country text not null,
  lat double precision not null,
  lon double precision not null,
  timezone text not null default 'UTC',
  arrived date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index travel_log_arrived_idx on public.travel_log (arrived desc, id desc);

alter table public.travel_log enable row level security;

create policy "todo mundo vê onde estamos" on public.travel_log
  for select using (true);

create policy "só os donos registram paradas" on public.travel_log
  for insert with check (public.is_admin());

create policy "só os donos corrigem paradas" on public.travel_log
  for update using (public.is_admin()) with check (public.is_admin());

create policy "só os donos apagam paradas" on public.travel_log
  for delete using (public.is_admin());

insert into public.travel_log (city, country, lat, lon, timezone, arrived, note)
values ('Dublin', 'Irlanda', 53.35, -6.26, 'Europe/Dublin', '2026-07-10', 'Nossa base. Daqui saem as viagens pela Europa.');
