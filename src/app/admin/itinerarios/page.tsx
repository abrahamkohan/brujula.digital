"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Loader2, Trash2, Clock, Eye } from "lucide-react";
import Link from "next/link";

interface Itinerario {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  duracion_texto: string;
  imagen: string;
  activo: boolean;
  orden: number;
  created_at: string;
}

interface Paso {
  id?: string;
  itinerario_id?: string;
  orden: number;
  lugar_nombre: string;
  lugar_url: string;
  tiempo_estimado: string;
  nota: string;
}

export default function AdminItinerariosPage() {
  const [items, setItems] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"new" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Itinerario | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [formTitulo, setFormTitulo] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuracion, setFormDuracion] = useState("");
  const [formImagen, setFormImagen] = useState("");
  const [formActivo, setFormActivo] = useState(true);
  const [formOrden, setFormOrden] = useState(0);
  const [pasos, setPasos] = useState<Paso[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/itinerarios");
    const data = await res.json();
    setItems(data.itinerarios ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openNew() {
    setEditItem(null);
    setFormTitulo(""); setFormSlug(""); setFormDesc(""); setFormDuracion(""); setFormImagen(""); setFormActivo(true); setFormOrden(0);
    setPasos([]);
    setModal("new");
  }

  function openEdit(item: Itinerario) {
    setEditItem(item);
    setFormTitulo(item.titulo); setFormSlug(item.slug); setFormDesc(item.descripcion); setFormDuracion(item.duracion_texto); setFormImagen(item.imagen); setFormActivo(item.activo); setFormOrden(item.orden);
    loadPasos(item.id);
    setModal("edit");
  }

  async function loadPasos(itinerarioId: string) {
    const res = await fetch(`/api/admin/itinerarios?pasos=${itinerarioId}`);
    const data = await res.json();
    setPasos(data.pasos ?? []);
  }

  function addPaso() {
    setPasos([...pasos, { orden: pasos.length, lugar_nombre: "", lugar_url: "", tiempo_estimado: "", nota: "" }]);
  }

  function updatePaso(i: number, field: keyof Paso, value: string | number) {
    const updated = [...pasos];
    (updated[i] as any)[field] = value;
    setPasos(updated);
  }

  function removePaso(i: number) {
    setPasos(pasos.filter((_, idx) => idx !== i));
  }

  function autoSlug(title: string) {
    if (editItem) return;
    setFormSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { titulo: formTitulo, slug: formSlug, descripcion: formDesc, duracion_texto: formDuracion, imagen: formImagen, activo: formActivo, orden: formOrden, pasos };

    try {
      const res = editItem
        ? await fetch("/api/admin/itinerarios", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editItem.id, ...payload }) })
        : await fetch("/api/admin/itinerarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      const result = await res.json();
      if (!res.ok) {
        setNotification({ type: "error", message: result.error || "Error al guardar" });
      } else {
        setNotification({ type: "success", message: editItem ? `"${formTitulo}" actualizado` : `"${formTitulo}" creado` });
        setModal(null);
        fetchItems();
      }
    } catch (err) {
      setNotification({ type: "error", message: (err as Error).message });
    }
    setSaving(false);
  }

  async function handleToggleActive(item: Itinerario) {
    await fetch("/api/admin/itinerarios", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, activo: !item.activo }) });
    fetchItems();
  }

  async function handleDelete(item: Itinerario) {
    if (!confirm(`¿Eliminar "${item.titulo}" definitivamente?`)) return;
    await fetch(`/api/admin/itinerarios?id=${item.id}`, { method: "DELETE" });
    setNotification({ type: "success", message: `"${item.titulo}" eliminado` });
    fetchItems();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Itinerarios</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">{items.length} itinerarios</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors">
          <Plus className="h-4 w-4" /> Nuevo itinerario
        </button>
      </div>

      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${notification.type === "success" ? "bg-[#F0F7F0] border-[#5A7D5A] text-[#2D4A2D]" : "bg-[#FDF0EE] border-[#C96442] text-[#6B2C23]"}`}>
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-0.5 rounded hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {loading ? (
        <div className="text-[#87867F] text-sm py-8 text-center"><Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D4D2C9] p-8 text-center">
          <p className="text-[#87867F] text-sm mb-4">No hay itinerarios todavía</p>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors"><Plus className="h-4 w-4" /> Crear el primero</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D4D2C9] overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_80px_120px] gap-3 px-5 py-3 text-xs font-medium text-[#87867F] border-b border-[#D4D2C9]">
            <span>Título</span><span>Duración</span><span>Orden</span><span>Activo</span><span>Acciones</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_100px_80px_80px_120px] gap-3 px-5 py-3 text-sm border-b border-[#D4D2C9] last:border-0 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <Link href={`/itinerarios/${item.slug}`} target="_blank" className="text-[#87867F] hover:text-[#C96442]"><Eye className="h-3.5 w-3.5" /></Link>
                <span className={`font-medium truncate ${item.activo ? "text-[#1F1E1D]" : "text-[#87867F]"}`}>{item.titulo}</span>
              </div>
              <span className="text-[#5C5B57] text-sm flex items-center gap-1">{item.duracion_texto && <><Clock className="h-3 w-3" /> {item.duracion_texto}</>}</span>
              <span className="text-[#87867F] text-xs">{item.orden}</span>
              <button onClick={() => handleToggleActive(item)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.activo ? "bg-[#5A7D5A] border-[#5A7D5A]" : "border-[#D4D2C9]"}`}>
                {item.activo && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(item)} className="px-2.5 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E8DCC8] transition-colors">Editar</button>
                <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg text-[#87867F] hover:text-[#C96442] hover:bg-[#F5F4ED] transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-[#D4D2C9] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1F1E1D]">{editItem ? "Editar itinerario" : "Nuevo itinerario"}</h2>
              <button onClick={() => { setModal(null); setEditItem(null); }} className="p-1 hover:bg-[#F5F4ED] rounded-lg text-[#87867F]"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Título *</label>
                  <input type="text" value={formTitulo} onChange={(e) => { setFormTitulo(e.target.value); autoSlug(e.target.value); }} required className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 placeholder-[#87867F]" placeholder="Ej: Un día en Villa Morra" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Slug *</label>
                  <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 placeholder-[#87867F]" placeholder="un-dia-en-villa-morra" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Descripción</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 placeholder-[#87867F]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Duración</label>
                  <input type="text" value={formDuracion} onChange={(e) => setFormDuracion(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" placeholder="Ej: 3 horas, Un día" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Orden</label>
                  <input type="number" value={formOrden} onChange={(e) => setFormOrden(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Imagen URL</label>
                <input type="url" value={formImagen} onChange={(e) => setFormImagen(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formActivo} onChange={(e) => setFormActivo(e.target.checked)} className="w-4 h-4 rounded border-[#D4D2C9] text-[#C96442] focus:ring-[#C96442]" />
                <span className="text-sm text-[#1F1E1D]">Activo</span>
              </label>

              {/* Pasos */}
              <div className="border-t border-[#D4D2C9] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#1F1E1D]">Pasos ({pasos.length})</h3>
                  <button type="button" onClick={addPaso} className="text-xs text-[#C96442] hover:underline">+ Agregar paso</button>
                </div>
                {pasos.length === 0 ? (
                  <p className="text-xs text-[#87867F]">Sin pasos todavía. Agregá al menos uno.</p>
                ) : (
                  <div className="space-y-3">
                    {pasos.map((paso, i) => (
                      <div key={i} className="bg-[#F5F4ED] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#5C5B57]">Paso {i + 1}</span>
                          <button type="button" onClick={() => removePaso(i)} className="text-[#C96442] text-xs hover:underline">Quitar</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <input type="text" value={paso.lugar_nombre} onChange={(e) => updatePaso(i, "lugar_nombre", e.target.value)} placeholder="Nombre del lugar" className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D2C9] text-xs focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
                          </div>
                          <div>
                            <input type="text" value={paso.tiempo_estimado} onChange={(e) => updatePaso(i, "tiempo_estimado", e.target.value)} placeholder="15 min" className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D2C9] text-xs focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
                          </div>
                        </div>
                        <input type="url" value={paso.lugar_url} onChange={(e) => updatePaso(i, "lugar_url", e.target.value)} placeholder="URL (Google Maps, web...)" className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D2C9] text-xs focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
                        <input type="text" value={paso.nota} onChange={(e) => updatePaso(i, "nota", e.target.value)} placeholder="Nota / sugerencia" className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D2C9] text-xs focus:outline-none focus:ring-2 focus:ring-[#C96442]/20" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditItem(null); }} className="px-4 py-2 rounded-xl text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors disabled:opacity-50">
                  {saving ? "Guardando..." : editItem ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
