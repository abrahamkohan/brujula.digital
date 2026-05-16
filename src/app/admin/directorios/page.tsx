"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, X, Loader2, ExternalLink, Check, Trash2,
  ShoppingBag, UtensilsCrossed, Beer, Hotel, Film,
  Landmark, TreePine, Building2, Trophy, MicVocal,
  TreePalm, BookOpen, MapPin, Compass,
  Image as ImageIcon, Star,
} from "lucide-react";
import { ZONAS } from "@/lib/directorios/types";

// ─── Tipos ─────────────────────────────────────────────────────

interface DirectorioItem {
  id: string;
  tipo: string;
  name: string;
  descripcion: string;
  zone: string;
  image: string;
  url: string;
  tipo_lugar: string | null;
  horario: string | null;
  badge: string | null;
  stars: number | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type ModalMode = "new" | "edit" | null;

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shopping: ShoppingBag,
  gastronomia: UtensilsCrossed,
  bar: Beer,
  hotel: Hotel,
  teatro: Film,
  museo: Landmark,
  parque: TreePine,
  edificio: Building2,
  estadio: Trophy,
  venue: MicVocal,
  "centro-cultural": TreePalm,
  libreria: BookOpen,
  "barrio-zona": MapPin,
};

const TAB_LABELS: Record<string, string> = {
  shopping: "Shoppings",
  gastronomia: "Gastronomía",
  bar: "Bares",
  hotel: "Hoteles",
  teatro: "Teatros",
  museo: "Museos",
  parque: "Parques",
  edificio: "Edificios",
  estadio: "Estadios",
  venue: "Venues",
  "centro-cultural": "Centros Culturales",
  libreria: "Librerías",
  "barrio-zona": "Barrios/Zonas",
};

// ─── Helpers ─────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Page ──────────────────────────────────────────────────────

export default function AdminDirectoriosPage() {
  const [items, setItems] = useState<DirectorioItem[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [editItem, setEditItem] = useState<DirectorioItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ── Form state ──
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formZone, setFormZone] = useState("centro");
  const [formImage, setFormImage] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formTipoLugar, setFormTipoLugar] = useState("");
  const [formHorario, setFormHorario] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formTipo, setFormTipo] = useState("bar");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/directorios?tipo=${activeTab}&all=true`);
      const data = await res.json();
      setItems(data.directorios ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Cargar tipos disponibles desde la DB
  useEffect(() => {
    fetch("/api/admin/directorios?all=true")
      .then((r) => r.json())
      .then((data: { directorios: DirectorioItem[] }) => {
        const distinct = [...new Set((data.directorios ?? []).map((d) => d.tipo))].sort();
        setTipos(distinct as string[]);
        if (!activeTab && distinct.length > 0) setActiveTab(distinct[0]);
      })
      .catch(() => {});
  }, []);

  // ── Modal handlers ──

  function openNew() {
    setEditItem(null);
    setFormName("");
    setFormDesc("");
    setFormZone("centro");
    setFormImage("");
    setFormUrl("");
    setFormTipoLugar("");
    setFormHorario("");
    setFormActive(true);
    setFormTipo(activeTab);
    setModal("new");
  }

  function openEdit(item: DirectorioItem) {
    setEditItem(item);
    setFormName(item.name);
    setFormDesc(item.descripcion);
    setFormZone(item.zone);
    setFormImage(item.image);
    setFormUrl(item.url);
    setFormTipoLugar(item.tipo_lugar ?? "");
    setFormHorario(item.horario ?? "");
    setFormActive(item.active);
    setFormTipo(item.tipo);
    setModal("edit");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    const payload = {
      name: formName,
      descripcion: formDesc,
      zone: formZone,
      tipo: formTipo,
      image: formImage,
      url: formUrl,
      tipo_lugar: formTipoLugar || null,
      horario: formHorario || null,
      active: formActive,
    };

    try {
      let res;
      if (editItem) {
        res = await fetch("/api/admin/directorios", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/directorios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload }),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        setNotification({ type: "error", message: result.error || "Error al guardar" });
      } else {
        setNotification({
          type: "success",
          message: editItem ? `"${formName}" actualizado` : `"${formName}" creado`,
        });
        setModal(null);
        fetchItems();
      }
    } catch (err) {
      setNotification({ type: "error", message: (err as Error).message });
    }

    setSaving(false);
  }

  async function handleToggleActive(item: DirectorioItem) {
    const res = await fetch("/api/admin/directorios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (res.ok) fetchItems();
  }

  async function handleToggleFeatured(item: DirectorioItem) {
    const res = await fetch("/api/admin/directorios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, featured: !item.featured }),
    });
    if (res.ok) fetchItems();
  }

  async function handleDelete(item: DirectorioItem) {
    if (!confirm(`¿Eliminar "${item.name}" definitivamente?`)) return;
    const res = await fetch(`/api/admin/directorios?id=${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setNotification({ type: "success", message: `"${item.name}" eliminado` });
      fetchItems();
    }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Directorios</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">
            {items.length} lugares &middot; Gestioná shoppings, gastronomía, bares, hoteles y teatros
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {/* ── Notification ── */}
      {notification && (
        <div className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
          notification.type === "success"
            ? "bg-[#F0F7F0] border-[#5A7D5A] text-[#2D4A2D]"
            : "bg-[#FDF0EE] border-[#C96442] text-[#6B2C23]"
        }`}>
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-0.5 rounded hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Tools ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={async () => {
            setFixing(true);
            setFixResult(null);
            try {
              const res = await fetch("/api/admin/fix-images", { method: "POST" });
              const data = await res.json();
              setFixResult(
                `✅ ${data.actualizados} actualizados · ❌ ${data.noEncontrados} sin imagen · ⚠️ ${data.errores} errores`
              );
              fetchItems();
            } catch {
              setFixResult("❌ Error al ejecutar");
            }
            setFixing(false);
          }}
          disabled={fixing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D4D2C9] text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] transition-colors disabled:opacity-50"
        >
          {fixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          {fixing ? "Buscando imágenes..." : "🖼️ Fix imágenes faltantes"}
        </button>
        {fixResult && (
          <span className="text-xs text-[#87867F]">{fixResult}</span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 border-b border-[#D4D2C9]">
        {tipos.map((t) => {
          const Icon = TAB_ICONS[t] ?? Compass;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t
                  ? "border-[#C96442] text-[#C96442]"
                  : "border-transparent text-[#87867F] hover:text-[#5C5B57]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {TAB_LABELS[t] ?? t}
              {activeTab === t && items.length > 0 && (
                <span className="text-xs text-[#87867F] ml-0.5">({items.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="text-[#87867F] text-sm py-8 text-center">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D4D2C9] p-8 text-center">
          <p className="text-[#87867F] text-sm mb-4">No hay lugares en esta categoría</p>
          <button onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors">
            <Plus className="h-4 w-4" /> Agregar primer lugar
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D4D2C9] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px_50px_50px_120px] gap-3 px-5 py-3 text-xs font-medium text-[#87867F] border-b border-[#D4D2C9]">
            <span>Nombre</span>
            <span>Zona</span>
            <span>Subtipo</span>
            <span>Activo</span>
            <span>★</span>
            <span>Acciones</span>
          </div>

          {items.map((item) => (
            <div key={item.id}
              className="grid grid-cols-[1fr_100px_100px_50px_50px_120px] gap-3 px-5 py-3 text-sm border-b border-[#D4D2C9] last:border-0 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F4ED] overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#87867F] text-xs">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className={`font-medium truncate ${item.active ? "text-[#1F1E1D]" : "text-[#87867F]"}`}>
                  {item.name}
                </span>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="text-[#87867F] hover:text-[#C96442] shrink-0">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <span className="text-[#5C5B57] text-sm">
                {ZONAS.find((z) => z.id === item.zone)?.label ?? item.zone}
              </span>
              <span className="text-[#87867F] text-xs truncate">
                {item.tipo_lugar ?? "—"}
              </span>
              <div>
                <button onClick={() => handleToggleActive(item)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    item.active ? "bg-[#5A7D5A] border-[#5A7D5A]" : "border-[#D4D2C9]"
                  }`}>
                  {item.active && <Check className="h-3 w-3 text-white" />}
                </button>
              </div>
              <div>
                <button onClick={() => handleToggleFeatured(item)}
                  className={`transition-colors ${item.featured ? "text-[#C96442]" : "text-[#D4D2C9] hover:text-[#87867F]"}`}>
                  <Star className={`h-4 w-4 ${item.featured ? "fill-[#C96442]" : ""}`} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(item)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E8DCC8] transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(item)}
                  className="p-1.5 rounded-lg text-[#87867F] hover:text-[#C96442] hover:bg-[#F5F4ED] transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Nuevo / Editar ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-lg bg-white rounded-xl border border-[#D4D2C9] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1F1E1D]">
                {editItem ? "Editar lugar" : `Nuevo ${TAB_LABELS[activeTab] ?? activeTab}`}
              </h2>
              <button onClick={() => { setModal(null); setEditItem(null); }}
                className="p-1 hover:bg-[#F5F4ED] rounded-lg text-[#87867F]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Nombre *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="Nombre del lugar" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Descripción</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="Descripción breve..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Categoría *</label>
                  <select value={formTipo} onChange={(e) => setFormTipo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
                    {Object.entries(TAB_LABELS).filter(([k]) => k !== "barrio-zona").map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Zona</label>
                  <select value={formZone} onChange={(e) => setFormZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
                    {ZONAS.map((z) => (
                      <option key={z.id} value={z.id}>{z.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Subtipo <span className="text-[#B8B7B2] font-normal">(opcional — ej: Rock bar, Hotel boutique)</span></label>
                <input type="text" value={formTipoLugar} onChange={(e) => setFormTipoLugar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="Ej: Rock bar, Hotel boutique, Restaurante italiano" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Horario</label>
                <input type="text" value={formHorario} onChange={(e) => setFormHorario(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="Ej: 10:00 - 22:00" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">URL (Google Maps)</label>
                <input type="url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="https://www.google.com/maps?q=..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Imagen URL</label>
                <input type="url" value={formImage} onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="https://..." />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D4D2C9] text-[#C96442] focus:ring-[#C96442]" />
                <span className="text-sm text-[#1F1E1D]">Activo</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditItem(null); }}
                  className="px-4 py-2 rounded-xl text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors disabled:opacity-50">
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
