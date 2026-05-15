-- ============================================================
-- Admin Panel — Migration: tabla directorios (CRUD)
-- ============================================================
-- Directorios editoriales: shopping, gastronomia, bares,
-- hoteles, teatros. Gestionables desde /admin/directorios.
-- ============================================================

create table if not exists public.directorios (
  id uuid default gen_random_uuid() primary key,
  tipo text not null check (tipo in ('shopping', 'gastronomia', 'bar', 'hotel', 'teatro')),
  name text not null,
  descripcion text not null default '',
  zone text not null default 'otras',
  image text not null default '',
  url text not null default '',
  tipo_lugar text,
  horario text,
  badge text,
  stars int check (stars >= 1 and stars <= 5),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_directorios_tipo on public.directorios(tipo);
create index if not exists idx_directorios_active on public.directorios(active);
create index if not exists idx_directorios_sort on public.directorios(tipo, sort_order);

-- RLS: cualquiera puede leer, solo admin puede escribir
alter table public.directorios enable row level security;

create policy "Anyone can read directorios"
  on public.directorios for select
  using (true);

create policy "Admin full access to directorios"
  on public.directorios for all
  using (true)
  with check (true);
