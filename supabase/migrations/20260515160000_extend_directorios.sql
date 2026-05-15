-- ============================================================
-- Brújula Digital — Extender tabla directorios
-- ============================================================
-- Agrega nuevos tipos y campos para la guía completa.
-- ============================================================

-- 1. Agregar nuevos tipos al CHECK constraint
alter table public.directorios
  drop constraint if exists directorios_tipo_check;

alter table public.directorios
  add constraint directorios_tipo_check
  check (tipo in (
    'shopping', 'gastronomia', 'bar', 'hotel', 'teatro',
    'museo', 'parque', 'edificio', 'estadio', 'venue',
    'centro-cultural', 'libreria', 'barrio-zona'
  ));

-- 2. Nuevos campos para el detalle de lugares
alter table public.directorios
  add column if not exists direccion text,
  add column if not exists contacto_whatsapp text,
  add column if not exists telefono text,
  add column if not exists instagram text,
  add column if not exists website text,
  add column if not exists featured boolean not null default false,
  add column if not exists es_premium boolean not null default false;
