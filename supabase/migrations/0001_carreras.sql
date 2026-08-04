-- HANDBALLER · esquema del backend (proyecto Supabase "handboludo")
--
-- Una sola tabla append-only con cada carrera terminada, cerrada con RLS:
-- el mundo solo puede INSERTAR (con validaciones duras) y leer las dos
-- vistas públicas: el top-100 y los totales. La tabla cruda no se lee
-- desde afuera: privacidad y cero scraping.

create table public.runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  client_id   uuid not null,                -- anónimo, generado por navegador
  player      text not null check (char_length(player) between 1 and 16),
  flag        text check (char_length(flag) <= 8),
  rama        text not null check (rama in ('M', 'F')),
  country     text not null check (char_length(country) = 3),
  position    text not null check (position in ('GK','LW','LB','CB','RB','RW','PV')),
  pace        smallint not null check (pace between 1 and 3),
  locale      text not null check (locale in ('es','fr','de')),
  score       integer not null check (score between 0 and 4000),
  verdict     text not null check (verdict in ('inmortal','icono','leyenda','idolo','trotamundos')),
  seasons     smallint not null check (seasons between 1 and 30),
  matches     integer not null check (matches between 0 and 1500),
  goals       integer not null check (goals between 0 and 6000),
  assists     integer not null check (assists between 0 and 6000),
  saves       integer not null check (saves between 0 and 20000),
  caps        smallint not null check (caps between 0 and 400),
  titles      smallint not null check (titles between 0 and 100),
  max_rating  smallint not null check (max_rating between 40 and 99),
  max_salary  integer not null check (max_salary between 0 and 60000),
  climb       smallint not null check (climb between 0 and 300),
  comeback    smallint not null check (comeback between 0 and 500),
  first_club  text check (char_length(first_club) <= 60),
  last_club   text check (char_length(last_club) <= 60),
  app_version text not null default '1' check (char_length(app_version) <= 12)
);

alter table public.runs enable row level security;

-- El mundo puede dar de alta su carrera; nunca leer, editar ni borrar.
create policy "alta anonima de carreras"
  on public.runs for insert to anon
  with check (true);

create index runs_score_idx on public.runs (score desc, created_at asc);
create index runs_created_idx on public.runs (created_at desc);

-- Top-100 mundial: lo único legible desde el juego, con columnas mínimas.
create view public.leaderboard
  with (security_invoker = off) as
  select player, flag, rama, country, position, score, verdict,
         titles, caps, max_rating, created_at
  from public.runs
  order by score desc, created_at asc
  limit 100;

grant select on public.leaderboard to anon;

-- Totales para el "se jugaron N carreras": una sola fila agregada.
create view public.stats
  with (security_invoker = off) as
  select count(*)::int                                                  as total_runs,
         coalesce(round(avg(score)), 0)::int                            as avg_score,
         coalesce(max(score), 0)::int                                   as top_score,
         count(*) filter (where rama = 'F')::int                        as femenino,
         count(*) filter (where created_at > now() - interval '1 day')::int as last_24h
  from public.runs;

grant select on public.stats to anon;
