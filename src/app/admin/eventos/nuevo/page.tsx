"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

const categorias = ["Concierto", "Deporte", "Feria", "Teatro", "Congreso", "Entretenimiento", "Otro"];

export default function AdminEventoNuevoPage() {
  return (
    <Suspense fallback={
      <div className="text-[#87867F] text-sm py-8 text-center">
        <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...
      </div>
    }>
      <AdminEventoNuevoForm />
    </Suspense>
  );
}

function AdminEventoNuevoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [venue, setVenue] = useState("");
  const [categoria, setCategoria] = useState("Concierto");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [editorialPick, setEditorialPick] = useState(false);
  const [extraerUrl, setExtraerUrl] = useState("");

  useEffect(() => {
    if (!editId) return;
    supabase.from("eventos").select("*").eq("id", editId).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError("Evento no encontrado"); setLoadingEdit(false); return; }
        setTitulo(data.titulo ?? "");
        setFecha(data.fecha ?? "");
        setVenue(data.venue ?? "");
        setCategoria(data.categoria ? data.categoria.charAt(0).toUpperCase() + data.categoria.slice(1) : "Concierto");
        setSourceUrl(data.source_url ?? "");
        setImagenUrl(data.image_url ?? "");
        setEditorialPick(data.editorial_pick ?? false);
        setLoadingEdit(false);
      });
  }, [editId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      titulo, fecha, venue, categoria: categoria.toLowerCase(),
      source_url: sourceUrl || null, image_url: imagenUrl || null,
      editorial_pick: editorialPick, fuente: "manual",
      external_id: `manual-${Date.now()}`,
      city: "Asunción", scraped_at: new Date().toISOString(),
    };

    const result = editId
      ? await supabase.from("eventos").update(payload).eq("id", editId)
      : await supabase.from("eventos").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      router.push("/admin/eventos");
    }
  }

  if (loadingEdit) {
    return (
      <div className="text-[#87867F] text-sm py-8 text-center">
        <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/eventos" className="p-1.5 rounded-lg hover:bg-[#F5F4ED] text-[#87867F] hover:text-[#1F1E1D] transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">{editId ? "Editar evento" : "Nuevo evento"}</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">{editId ? "Editando evento existente" : "Alta manual de evento"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="bg-white rounded-xl border border-[#D4D2C9] p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#5C5B57] mb-1">Título</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required
              className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
              placeholder="Nombre del evento" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5C5B57] mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required
                className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5B57] mb-1">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5B57] mb-1">Venue / Lugar</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required
              className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
              placeholder="Teatro Municipal, Shopping del Sol..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5B57] mb-1">URL fuente</label>
            <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
              placeholder="https://..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5B57] mb-1">Imagen URL <span className="text-[#87867F]">(opcional)</span></label>
            <input type="url" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
              placeholder="https://..." />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editorialPick} onChange={(e) => setEditorialPick(e.target.checked)}
              className="w-4 h-4 rounded border-[#D4D2C9] text-[#C96442] focus:ring-[#C96442]" />
            <span className="text-sm text-[#1F1E1D]">★ Selección editorial</span>
          </label>
        </div>

        {/* Extraer con IA - placeholder */}
        <div className="bg-white rounded-xl border border-[#D4D2C9] p-6">
          <label className="block text-xs font-medium text-[#5C5B57] mb-2">Extraer desde URL <span className="text-[#87867F]">(opcional)</span></label>
          <div className="flex gap-2">
            <input type="url" value={extraerUrl} onChange={(e) => setExtraerUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
              placeholder="Pegá un link para extraer con IA..." />
            <button type="button" disabled
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5F4ED] text-[#87867F] text-sm cursor-not-allowed">
              <Sparkles className="h-4 w-4" /> Extraer
            </button>
          </div>
          <p className="text-xs text-[#87867F] mt-2">Próximamente: extraé datos automáticamente desde una URL</p>
        </div>

        {error && <p className="text-sm text-[#C96442]">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : editId ? "Actualizar evento" : "Guardar evento"}
          </button>
          <Link href="/admin/eventos"
            className="px-6 py-2.5 rounded-xl text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
