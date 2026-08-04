-- Desafío del día: carreras jugadas con la semilla compartida de la fecha.
alter table public.runs add column daily boolean not null default false;

-- Un solo endpoint filtrable para el ranking: rama, país, ventana de días o
-- el desafío de hoy (fecha argentina). SECURITY DEFINER: lee la tabla cerrada
-- pero solo devuelve las columnas públicas del top-50.
create or replace function public.top_runs(
  p_rama text default null,
  p_country text default null,
  p_days integer default null,
  p_daily boolean default false
) returns table (
  player text, flag text, rama text, country text, "position" text,
  score integer, verdict text, titles smallint, caps smallint,
  max_rating smallint, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select player, flag, rama, country, "position", score, verdict,
         titles, caps, max_rating, created_at
  from public.runs
  where (p_rama is null or rama = p_rama)
    and (p_country is null or country = p_country)
    and (p_days is null or created_at > now() - make_interval(days => p_days))
    and (not p_daily or (daily and (created_at at time zone 'America/Argentina/Buenos_Aires')::date
                               = (now() at time zone 'America/Argentina/Buenos_Aires')::date))
  order by score desc, created_at asc
  limit 50;
$$;

revoke all on function public.top_runs(text, text, integer, boolean) from public;
grant execute on function public.top_runs(text, text, integer, boolean) to anon;

-- Vistas de análisis de balance: solo para el dashboard (sin grant a anon).
create view public.balance_by_position as
  select "position", rama, count(*) as runs,
         round(avg(score)) as avg_score, round(avg(max_rating)) as avg_val,
         round(avg(titles), 1) as avg_titles
  from public.runs group by "position", rama order by avg_score desc;

create view public.balance_by_country as
  select country, rama, count(*) as runs, round(avg(score)) as avg_score,
         count(*) filter (where verdict in ('inmortal','icono')) as elite_runs
  from public.runs group by country, rama order by runs desc;

create view public.balance_daily as
  select (created_at at time zone 'America/Argentina/Buenos_Aires')::date as dia,
         count(*) as runs, round(avg(score)) as avg_score, max(score) as top_score
  from public.runs group by 1 order by 1 desc;
