"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Trash2, Loader2, Search } from "lucide-react";
import Link from "next/link";

interface Evento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  venue: string | null;
  editorial_pick: boolean;
  fuente: string | null;
}

const categorias = ["Todas", "Concierto", "Deporte", "Feria", "Teatro", "Congreso", "Entretenimiento", "Otro"];

export default function AdminEventosPage() {
  const supabase = createClient();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [filtroFuente, setFiltroFuente] = useState("");
  const [filtroPick, setFiltroPick] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("eventos")
      .select("id, titulo, categoria, fecha, venue, editorial_pick, fuente")
      .order("fecha", { ascending: true });

    if (filtroCat !== "Todas") query = query.eq("categoria", filtroCat.toLowerCase());
    if (filtroFuente) query = query.eq("fuente", filtroFuente);
    if (filtroPick === true) query = query.eq("editorial_pick", true);
    else if (filtroPick === false) query = query.eq("editorial_pick", false);

    const { data } = await query;
    if (data) setEventos(data);
    setLoading(false);
  }, [supabase, filtroCat, filtroFuente, filtroPick]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  async function togglePick(evento: Evento) {
    setToggling(evento.id);
    await supabase.from("eventos").update({ editorial_pick: !evento.editorial_pick }).eq("id", evento.id);
    setToggling(null);
    fetchEventos();
  }

  async function handleDelete(evento: Evento) {
    if (!confirm(`¿Eliminar "${evento.titulo}"?`)) return;
    setDeleting(evento.id);
    await supabase.from("eventos").delete().eq("id", evento.id);
    setDeleting(null);
    fetchEventos();
  }

  function formatFecha(f: string) {
    return new Date(f + "T12:00:00").toLocaleDateString("es-PY", { day: "numeric", month: "short" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Eventos</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">{eventos.length} eventos</p>
        </div>
        <Link href="/admin/eventos/nuevo"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors">
          + Nuevo evento
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="text" value={filtroFuente} onChange={(e) => setFiltroFuente(e.target.value)}
          placeholder="Filtrar por fuente..."
          className="px-3 py-1.5 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F] w-44" />

        <select
          value={filtroPick === true ? "pick" : filtroPick === false ? "nopick" : "todas"}
          onChange={(e) => {
            const v = e.target.value;
            setFiltroPick(v === "pick" ? true : v === "nopick" ? false : null);
          }}
          className="px-3 py-1.5 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
          <option value="todas">Todos</option>
          <option value="pick">★ Selección</option>
          <option value="nopick">Sin selección</option>
        </select>

        <button onClick={fetchEventos} className="p-1.5 rounded-lg text-[#87867F] hover:text-[#1F1E1D] hover:bg-[#F5F4ED]">
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-[#87867F] text-sm py-8 text-center">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D4D2C9] overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_100px_1fr_60px_110px] gap-3 px-5 py-3 text-xs font-medium text-[#87867F] border-b border-[#D4D2C9]">
            <span>Título</span>
            <span>Cat</span>
            <span>Fecha</span>
            <span>Venue</span>
            <span>Pick</span>
            <span>Acciones</span>
          </div>

          {eventos.length === 0 ? (
            <div className="px-5 py-8 text-center text-[#87867F] text-sm">No hay eventos con esos filtros.</div>
          ) : (
            eventos.map((evento) => (
              <div key={evento.id}
                className="grid grid-cols-[1fr_80px_100px_1fr_60px_110px] gap-3 px-5 py-3 text-sm border-b border-[#D4D2C9] last:border-0 items-center">
                <span className="font-medium text-[#1F1E1D] truncate">{evento.titulo}</span>
                <span className="text-[#5C5B57]">{evento.categoria}</span>
                <span className="text-[#5C5B57]">{formatFecha(evento.fecha)}</span>
                <span className="text-[#87867F] truncate">{evento.venue ?? "—"}</span>
                <div>
                  <button onClick={() => togglePick(evento)} disabled={toggling === evento.id}
                    className={`transition-colors ${evento.editorial_pick ? "text-[#C96442]" : "text-[#D4D2C9] hover:text-[#87867F]"}`}>
                    {toggling === evento.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Star className={`h-4 w-4 ${evento.editorial_pick ? "fill-[#C96442]" : ""}`} />
                    }
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/eventos/nuevo?id=${evento.id}`}
                    className="px-2.5 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E8DCC8] transition-colors">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(evento)} disabled={deleting === evento.id}
                    className="p-1.5 rounded-lg text-[#87867F] hover:text-[#C96442] hover:bg-[#F5F4ED] transition-colors disabled:opacity-50">
                    {deleting === evento.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
