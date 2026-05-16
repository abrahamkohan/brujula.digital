-- Agregar campo tipo a itinerarios: 'urbano' | 'escapada'
ALTER TABLE public.itinerarios
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'urbano'
  CHECK (tipo IN ('urbano', 'escapada'));
