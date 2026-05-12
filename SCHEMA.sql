-- Ejecutar en: https://supabase.com/dashboard/project/loxqrmihxdqecrvnzcqb/sql/new

-- 1. Funcionarios (Módulo 3)
create table if not exists public.funcionarios (
  id                      uuid primary key default gen_random_uuid(),
  cedula                  text not null,
  nombre                  text,
  apellido                text,
  organismo               text,
  cargo                   text,
  estado                  text default 'activo' check (estado in ('activo', 'inactivo', 'desconocido')),
  fuente_id               text,
  fecha_ingreso           date,
  ultima_actualizacion    timestamptz default now(),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
create index if not exists idx_funcionarios_cedula on public.funcionarios(cedula);

-- 2. Consultas (rate limiting + analytics)
create table if not exists public.consultas (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  tipo          text not null,
  parametro     text not null,
  resultado     text,
  ip_address    text,
  created_at    timestamptz default now()
);
create index if not exists idx_consultas_user_id on public.consultas(user_id);
create index if not exists idx_consultas_created_at on public.consultas(created_at);

-- 3. Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text default 'user' check (role in ('user', 'admin', 'superadmin')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 4. Modules
create table if not exists public.modules (
  id           text primary key,
  name         text not null,
  slug         text unique not null,
  description  text,
  price_cents  integer not null default 0,
  active       boolean default true,
  created_at   timestamptz default now()
);

-- 5. Client modules
create table if not exists public.client_modules (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references auth.users(id) on delete cascade,
  module_id    text not null references public.modules(id) on delete cascade,
  enabled      boolean default false,
  max_queries  integer,
  created_at   timestamptz default now(),
  unique(client_id, module_id)
);

-- RLS
alter table public.funcionarios enable row level security;
alter table public.consultas enable row level security;
alter table public.profiles enable row level security;
alter table public.client_modules enable row level security;

-- Policies
create policy "Anyone can search funcionarios"
  on public.funcionarios for select using (true);

create policy "Users can view own queries"
  on public.consultas for select using (user_id = auth.uid());

create policy "Users can insert own queries"
  on public.consultas for insert with check (true);

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own modules"
  on public.client_modules for select using (client_id = auth.uid());

-- Seed modules
insert into public.modules (id, name, slug, description, price_cents) values
  ('verificar-funcionarios', 'Verificación de Funcionarios', 'verificar', 'Consultá si una persona es funcionario público por CI', 3000),
  ('precios-dncp', 'Inteligencia de Precios', 'precios', 'Historial de precios adjudicados en licitaciones DNCP', 5000),
  ('empresa-score', 'Empresa Score API', 'score', 'Perfil de riesgo completo de una empresa por RUC', 8000)
on conflict (id) do nothing;

-- Datos de prueba (5 funcionarios)
insert into public.funcionarios (cedula, nombre, apellido, organismo, cargo, estado) values
  ('1234567', 'Carlos', 'González', 'Ministerio de Salud', 'Director de Insumos', 'activo'),
  ('2345678', 'María', 'López', 'Ministerio de Educación', 'Supervisora Regional', 'activo'),
  ('3456789', 'Juan', 'Martínez', 'Secretaría de la Función Pública', 'Jefe de Departamento', 'activo'),
  ('4567890', 'Ana', 'Rodríguez', 'Ministerio de Hacienda', 'Auditora Senior', 'activo'),
  ('5678901', 'Pedro', 'Ramírez', 'Corte Suprema de Justicia', 'Secretario Judicial', 'inactivo');
