-- Instagram scraper runs — rastrea cada ejecución de Apify
create table if not exists public.ig_scraper_runs (
  id             uuid primary key default gen_random_uuid(),
  run_id         text unique not null,
  handle         text not null,
  venue_hint     text not null default '',
  categoria_hint text not null default 'entretenimiento',
  status         text not null default 'pending'
                   check (status in ('pending', 'done', 'failed')),
  triggered_at   timestamptz not null default now(),
  processed_at   timestamptz
);

create index if not exists idx_ig_runs_status on public.ig_scraper_runs(status);
create index if not exists idx_ig_runs_triggered on public.ig_scraper_runs(triggered_at desc);

alter table public.ig_scraper_runs enable row level security;

create policy "Admin full access to ig_scraper_runs"
  on public.ig_scraper_runs for all
  using (true)
  with check (true);
