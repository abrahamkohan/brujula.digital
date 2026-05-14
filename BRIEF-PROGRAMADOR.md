# Brief para el programador — Brújula Digital
### Radar de Eventos Paraguay — Mayo 2026

---

## Contexto del producto

Brújula Digital es el "Google de eventos de Paraguay". El usuario objetivo son **turistas y extranjeros** que no conocen la ciudad. La UX tiene que transmitir confianza, claridad y modernidad desde el primer segundo. Referentes visuales: **Fever, Time Out, Airbnb Experiences**.

---

## BUGS CRÍTICOS — arreglar antes que cualquier cosa

### BUG 1 — Doble render en desktop cuando se expande una sección de eventos

En `page.tsx` líneas 362–383, el bloque de Recitales/Deportes/Teatro/Ferias tiene esta lógica:

```jsx
{expanded ? (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {sec.events.map(...)}   // Grid A: todos los eventos
  </div>
) : (
  <div className="flex sm:hidden ...">  // Carrusel mobile (solo mobile)
    {visible.map(...)}
  </div>
)}

{/* Este div SIEMPRE se renderiza en desktop */}
<div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {visible.map(...)}   // Grid B: duplicado cuando expanded=true
</div>
```

Cuando `expanded = true` en desktop: **Grid A y Grid B renderizan al mismo tiempo**. Todos los eventos aparecen dos veces.

**Fix:**

```jsx
{!expanded && (
  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {visible.map((e) => <EventCard key={e.id} event={e} />)}
  </div>
)}
```

---

### BUG 2 — `MovieCard` existe pero no se usa

Hay un componente `src/components/eventos/movie-card.tsx` con diseño propio (card blanca con poster, info abajo). La sección Cine en `page.tsx` ignora este componente y usa JSX inline en su lugar.

**Fix:** Reemplazar el JSX inline de Cine (líneas 393–411) por `<MovieCard movie={p} />`.

---

### BUG 3 — `renderCard` no tiene modo grid

La función `renderCard()` (línea 222) tiene `w-56 sm:w-64 shrink-0 snap-start` hardcodeado. Cuando el usuario expande Gastronomía/Bares/Shopping/Hoteles, el container sigue siendo `flex overflow-x-auto` — un carrusel infinito, no un grid.

**Fix:** Ver sección "Ver todos" más abajo.

---

## FEATURE — "Ver todos" debe navegar a una página dedicada

### Comportamiento actual (malo)
El botón "Ver todos" expande el carrusel inline. En mobile sigue siendo un scroll horizontal eterno. El usuario no tiene una vista completa, limpia y navegable.

### Comportamiento deseado
"Ver todos" en cualquier sección navega a `/eventos/[categoria]` — una página dedicada con grid, filtros y breadcrumb de vuelta.

### Ruta a crear

```
src/app/(app)/eventos/[categoria]/page.tsx
```

Categorías válidas: `recitales`, `deportes`, `teatro`, `ferias`, `cine`, `gastronomia`, `bares`, `shopping`, `hoteles`

### Cambio en `page.tsx`

Reemplazar todos los `onClick={() => toggleExpand(sec.id)}` por links:

```tsx
import Link from "next/link";

<Link href={`/eventos/${sec.id}`}>
  Ver todos ({sec.events.length}) →
</Link>
```

Lo mismo para Cine, Gastronomía, Bares, Shopping, Hoteles.

Una vez hecho esto, eliminar completamente: `expandidas`, `setExpandidas`, `toggleExpand`, `visibleItems`. Ya no se necesitan.

### Layout de la página `/eventos/[categoria]`

```
┌─────────────────────────────────────────┐
│ ← Eventos        Recitales              │  ← Header con breadcrumb
├─────────────────────────────────────────┤
│ [Filtros: zona · fecha · tipo]          │  ← Pills
├─────────────────────────────────────────┤
│ 24 resultados                           │  ← Count
│                                         │
│ ┌───────┐ ┌───────┐ ┌───────┐          │
│ │ Card  │ │ Card  │ │ Card  │          │  ← 2 cols mobile
│ └───────┘ └───────┘ └───────┘          │     3 cols tablet
│ ┌───────┐ ┌───────┐ ┌───────┐          │     4 cols desktop
│ │ Card  │ │ Card  │ │ Card  │          │
│ └───────┘ └───────┘ └───────┘          │
└─────────────────────────────────────────┘
```

Para Gastronomía y Bares: incluir el filtro de tipo en esta página también.

---

## REDISEÑO — UI moderna para turistas

### Paleta y tipografía — no tocar

La paleta (`#1F1E1D`, `#C96442`, `#F5F4ED`) y la tipografía heading ya están bien. Mantenerlas.

---

### Problema principal: Gastronomía y directorios tienen UX terrible

**Situación actual:**
- Fila de filtros tipo (scroll horizontal)
- Fila de carrusel (scroll horizontal)
- Dos scrolls horizontales apilados = confusión total
- Botón "Ver todos" dentro del carrusel como card fantasma

**Rediseño para la sección de preview en `page.tsx`:**

Mostrar solo 4 cards en grid 2×2, NO en carrusel. Los filtros encima en pills. Botón "Ver todos" en el header (igual que Recitales).

```
┌─ Gastronomía ────────────────── Ver todos (48) → ┐
│                                                   │
│ [Todos] [Restaurante] [Parrilla] [Sushi]         │
│                                                   │
│ ┌────────────┐  ┌────────────┐                   │
│ │            │  │            │                   │
│ │    Card    │  │    Card    │                   │
│ │            │  │            │                   │
│ └────────────┘  └────────────┘                   │
│ ┌────────────┐  ┌────────────┐                   │
│ │    Card    │  │    Card    │                   │
│ └────────────┘  └────────────┘                   │
└───────────────────────────────────────────────────┘
```

---

### Rediseño de `renderCard` — agregar prop `variant`

La card de directorio actual tiene `w-56 sm:w-64` fijo y `aspect-[3/4]`. Está bien para carrusel pero en grid queda rara.

Crear un prop `variant: "carousel" | "grid"`:

```tsx
function renderCard(
  item: DirectorioItem,
  extra?: React.ReactNode,
  variant: "carousel" | "grid" = "carousel"
) {
  const wrapperClass = variant === "carousel"
    ? "w-56 sm:w-64 shrink-0 snap-start"
    : "w-full";
  const aspectClass = variant === "carousel" ? "aspect-[3/4]" : "aspect-[4/3]";
  // ...
}
```

En la sección preview de `page.tsx` usar grid 2×2 con `variant="grid"`.
En la página `/eventos/gastronomia` usar grid completo con `variant="grid"`.

---

### Mejoras a `EventCard`

El card actual es funcional pero le falta información para turistas que no conocen la ciudad.

**1. Zona visible en el card** — el turista no sabe qué es "Estadio Defensores del Chaco":

```tsx
{event.zona && (
  <span className="flex items-center gap-1 text-[10px] text-white/60">
    <MapPin className="h-2.5 w-2.5" />
    {ZONAS.find(z => z.id === event.zona)?.label ?? event.zona}
  </span>
)}
```

**2. Venue visible en mobile** — actualmente `hidden sm:flex`. Quitar `hidden sm:flex`, dejarlo siempre visible con `truncate`.

---

### Hero — social proof

Agregar debajo del subtítulo:

```tsx
<p className="text-[#87867F] mt-2 text-xs sm:text-sm">
  {eventosValidos.length}+ eventos · {GASTRONOMIA.length} restaurantes · actualizado hoy
</p>
```

Cambiar el placeholder del buscador:

```
"Events, restaurants, bars in Asunción..."
```

---

## RESUMEN — tareas en orden de prioridad

| # | Tarea | Archivo | Tipo |
|---|-------|---------|------|
| 1 | Fix doble render desktop en secciones expandidas | `page.tsx` L379 | BUG |
| 2 | Usar `MovieCard` en sección Cine | `page.tsx` L393–411 | BUG |
| 3 | Crear ruta `/eventos/[categoria]/page.tsx` con grid + filtros | nuevo archivo | Feature |
| 4 | Cambiar "Ver todos" de expand inline a `Link href` en todas las secciones | `page.tsx` | Feature |
| 5 | Secciones de directorio: cambiar carrusel a grid 2×2 en la preview | `page.tsx` L422–515 | UX |
| 6 | Agregar prop `variant` a `renderCard` para soportar grid | `page.tsx` fn renderCard | UX |
| 7 | Mostrar zona y venue en mobile en `EventCard` | `event-card.tsx` L115 | UX |
| 8 | Agregar social proof en Hero | `page.tsx` L255 | UX |

---

## Archivos relevantes

```
src/app/(app)/eventos/page.tsx              ← página principal
src/components/eventos/event-card.tsx       ← card de eventos
src/components/eventos/movie-card.tsx       ← card de películas (EXISTE pero no se usa)
src/lib/directorios/types.ts                ← DirectorioItem, ZonaInfo, ZONAS
src/lib/directorios/gastronomia.ts          ← datos gastronomía
src/lib/directorios/bares.ts                ← datos bares
src/lib/directorios/shopping.ts             ← datos shopping
src/lib/directorios/hoteles.ts              ← datos hoteles
```
