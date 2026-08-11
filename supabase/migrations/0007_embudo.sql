-- El embudo de HANDBOLUDO: cuántos llegan a cada pantalla y dónde se caen.
--
--   setup            abrió el juego y vio la inscripción
--   career_started   apretó "Empezar la carrera"
--   first_decision   tomó la primera decisión (quien la toma, casi siempre llega al final)
--   career_finished  terminó la carrera (con su puntaje)
--   share / share_wa apretó compartir (imagen / WhatsApp)
--
-- Mismo esquema de seguridad que `runs`: la tabla es de sólo inserción para
-- el rol anónimo y nadie de afuera puede recorrer filas; el tablero
-- (analytics.html) lee únicamente las vistas agregadas de acá abajo, que
-- corren como el dueño (security_invoker = off), igual que `stats`.

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event      text not null check (event in
             ('setup', 'career_started', 'first_decision',
              'career_finished', 'share', 'share_wa')),
  country    text,
  rama       text,
  mode       text,
  locale     text,
  score      int
);

alter table public.events enable row level security;

create policy "cualquiera inserta, nadie lee"
  on public.events for insert to anon with check (true);

-- El embudo total, listo para dibujar barras.
create or replace view public.funnel
  with (security_invoker = off) as
  select event, count(*)::bigint as n
  from public.events
  group by event;

-- El embudo abierto por país de origen elegido.
create or replace view public.funnel_by_country
  with (security_invoker = off) as
  select coalesce(country, '??') as country, event, count(*)::bigint as n
  from public.events
  group by 1, 2;

-- La serie diaria del último mes, para ver el pico del lanzamiento.
create or replace view public.funnel_daily
  with (security_invoker = off) as
  select (created_at at time zone 'America/Argentina/Buenos_Aires')::date as day,
         event, count(*)::bigint as n
  from public.events
  where created_at > now() - interval '30 days'
  group by 1, 2;

grant select on public.funnel, public.funnel_by_country, public.funnel_daily to anon;
