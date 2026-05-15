import { Share2 } from "lucide-react";

interface Pelicula {
  id: string;
  titulo: string;
  duracion_min?: number | null;
  clasificacion?: string | null;
  poster_url?: string | null;
  source_url?: string | null;
}

function formatDuracion(min?: number | null) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}

export default function MovieCard({ movie }: { movie: Pelicula }) {
  const hasPoster = movie.poster_url?.startsWith("http");

  const content = (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#E5E4DD] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
      {/* Poster */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F4ED]">
        {hasPoster ? (
          <img
            src={movie.poster_url!}
            alt={movie.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(ev) => {
              const el = ev.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.classList.add(
                "flex",
                "items-center",
                "justify-center",
                "bg-gradient-to-br",
                "from-blue-200",
                "to-indigo-100"
              );
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#1F1E1D] flex items-center justify-center">
            <span className="text-5xl opacity-20">🎬</span>
          </div>
        )}

        {/* Top row: clasificación + share */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {movie.clasificacion && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wide bg-white/85 backdrop-blur-sm text-[#5C5B57] shadow-xs">
              {movie.clasificacion}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const text = encodeURIComponent(`🎬 ${movie.titulo}\n\n${movie.source_url ?? `https://brujula.digital/eventos/cine`}`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <Share2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm text-[#1F1E1D] leading-snug line-clamp-2">
          {movie.titulo}
        </h3>
        {movie.duracion_min && (
          <p className="text-xs text-[#87867F]">{formatDuracion(movie.duracion_min)}</p>
        )}
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/0 group-hover:ring-[#C96442]/15 transition-all pointer-events-none" />
    </div>
  );

  if (movie.source_url) {
    return (
      <a
        key={movie.id}
        href={movie.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return <div key={movie.id}>{content}</div>;
}
