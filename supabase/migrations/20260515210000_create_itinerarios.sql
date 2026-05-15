-- ============================================================
-- Brújula Digital — Itinerarios turísticos
-- ============================================================

create table if not exists public.itinerarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text default '',
  duracion_texto text default '',       -- "3 horas", "Un día", "Finde completo"
  duracion_minutos integer,             -- para filtros / orden (opcional)
  imagen text default '',
  activo boolean default true,
  orden integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinerario_pasos (
  id uuid primary key default gen_random_uuid(),
  itinerario_id uuid references public.itinerarios(id) on delete cascade not null,
  orden integer not null default 0,
  lugar_id uuid references public.directorios(id) on delete set null,
  lugar_nombre text not null,           -- siempre requerido
  lugar_url text default '',            -- link externo si no hay lugar_id
  tiempo_estimado text default '',      -- "15 min", "2 horas"
  nota text default ''                  -- texto libre sobre el paso
);

create index if not exists idx_itinerarios_activo on public.itinerarios(activo);
create index if not exists idx_itinerarios_orden on public.itinerarios(orden);
create index if not exists idx_pasos_itinerario on public.itinerario_pasos(itinerario_id);
create index if not exists idx_pasos_orden on public.itinerario_pasos(itinerario_id, orden);

alter table public.itinerarios enable row level security;
alter table public.itinerario_pasos enable row level security;

create policy "Anyone can read itinerarios"
  on public.itinerarios for select using (true);

create policy "Anyone can read itinerario_pasos"
  on public.itinerario_pasos for select using (true);

create policy "Admin full access to itinerarios"
  on public.itinerarios for all using (true) with check (true);

create policy "Admin full access to itinerario_pasos"
  on public.itinerario_pasos for all using (true) with check (true);
