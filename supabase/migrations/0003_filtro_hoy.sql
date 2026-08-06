-- "Hoy" y "Desafío" son dos cosas distintas: el primero es todo lo jugado
-- hoy (en cualquier modo) y el segundo es el ranking del desafío diario.
-- Antes los dos caían en el mismo filtro y "Hoy" mostraba una sola carrera
-- de las catorce que se habían jugado.
create or replace function public.top_runs(
  p_rama text default null,
  p_country text default null,
  p_days integer default null,
  p_daily boolean default false,
  p_today boolean default false
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
    and (not p_today or (created_at at time zone 'America/Argentina/Buenos_Aires')::date
                      = (now() at time zone 'America/Argentina/Buenos_Aires')::date)
  order by score desc, created_at asc
  limit 50;
$$;

revoke all on function public.top_runs(text, text, integer, boolean, boolean) from public;
grant execute on function public.top_runs(text, text, integer, boolean, boolean) to anon;
