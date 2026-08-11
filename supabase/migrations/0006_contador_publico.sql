-- El contador de la portada: cuántas partidas jugó el mundo y cuántos partidos
-- suman todas esas carreras juntas.
--
-- La vista ya existía para la nota del ranking; le agregamos la suma de
-- partidos al final. Va como columna nueva y no toca las anteriores, así que
-- el `create or replace` no rompe a nadie que ya la esté leyendo.
--
-- Sumamos desde la vista y no desde el navegador porque `runs` es de sólo
-- inserción para el rol anónimo: nadie de afuera puede recorrer las filas.

create or replace view public.stats
  with (security_invoker = off) as
  select count(*)::int                                                  as total_runs,
         coalesce(round(avg(score)), 0)::int                            as avg_score,
         coalesce(max(score), 0)::int                                   as top_score,
         count(*) filter (where rama = 'F')::int                        as femenino,
         count(*) filter (where created_at > now() - interval '1 day')::int as last_24h,
         coalesce(sum(matches), 0)::bigint                              as total_matches
  from public.runs;

grant select on public.stats to anon;
