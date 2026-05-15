-- ============================================================
-- Admin Panel — Migración de fuentes (sources)
-- ============================================================
-- Ejecutar en: https://supabase.com/dashboard/project/loxqrmihxdqecrvnzcqb/sql/new
-- ============================================================

-- 1. Tabla de fuentes
create table if not exists public.sources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  categoria text,
  scraper text default 'manual',       -- 'playwright' | 'fetch' | 'llm' | 'manual'
  status text default 'pending',       -- 'ok' | 'error' | 'manual' | 'pending'
  last_run_at timestamptz,
  last_error text,
  events_last_run int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Aseguramos que editorial_pick exista en eventos
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'eventos' and column_name = 'editorial_pick'
  ) then
    alter table public.eventos add column editorial_pick boolean default false;
  end if;
end $$;

-- 3. RLS (relajado para admin con service_role)
alter table public.sources enable row level security;

create policy "Admin full access to sources"
  on public.sources for all
  using (true)
  with check (true);

-- 4. Seed inicial: fuentes conocidas
insert into public.sources (name, url, categoria, scraper, status, active) values
  ('Smashasu', 'https://smashasu.com', 'Teatro', 'playwright', 'ok', true),
  ('Ticketea', 'https://ticketea.com.py', 'Concierto', 'playwright', 'ok', true),
  ('Tuti', 'https://tuti.com.py', 'Concierto', 'playwright', 'ok', true),
  ('APF', 'https://apf.org.py', 'Deporte', 'fetch', 'ok', true),
  ('Visit Paraguay', 'https://visitparaguay.travel', 'Feria', 'fetch', 'ok', true),
  ('Cinemark', 'https://cinemark.com.py', 'Entretenimiento', 'playwright', 'ok', true),
  ('Market Comunicaciones', 'https://marketcomunicaciones.com', 'Congreso', 'fetch', 'ok', true),
  ('Shopping Sol', 'https://shoppingsol.com.py', 'Feria', 'manual', 'manual', true),
  ('Multiplaza', 'https://multiplaza.com.py', 'Feria', 'playwright', 'error', true),
  ('AllAccess', 'https://allaccess.com.py', 'Concierto', 'playwright', 'ok', true)
on conflict (id) do nothing;
