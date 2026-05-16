-- Agregar tipo "complejo" al check de directorios
alter table public.directorios drop constraint if exists directorios_tipo_check;

alter table public.directorios
  add constraint directorios_tipo_check
  check (tipo in (
    'shopping', 'gastronomia', 'bar', 'hotel', 'teatro',
    'museo', 'parque', 'edificio', 'estadio', 'venue',
    'centro-cultural', 'libreria', 'barrio-zona',
    'complejo'
  ));
