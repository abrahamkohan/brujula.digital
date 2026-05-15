"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Play, Eye, ExternalLink, X, Check, Loader2, CircleAlert, CheckCircle2 } from "lucide-react";

interface Source {
  id: string;
  name: string;
  url: string;
  categoria: string | null;
  scraper: string;
  status: string;
  last_run_at: string | null;
  last_error: string | null;
  events_last_run: number;
  active: boolean;
  created_at: string;
}

type ModalMode = "new" | "error" | null;

export default function AdminFuentesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [errorSource, setErrorSource] = useState<Source | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategoria, setNewCategoria] = useState("Concierto");
  const [newScraper, setNewScraper] = useState("manual");
  const [saving, setSaving] = useState(false);

  const fetchSources = useCallback(async () => {
    const res = await fetch("/api/admin/sources");
    if (res.ok) {
      const data = await res.json();
      setSources(data.sources ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  async function toggleActive(source: Source) {
    await fetch("/api/admin/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: source.id, active: !source.active }),
    });
    fetchSources();
  }

  async function handleNewSource(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, url: newUrl, categoria: newCategoria, scraper: newScraper }),
    });
    setSaving(false);
    setModal(null);
    setNewName(""); setNewUrl(""); setNewCategoria("Concierto"); setNewScraper("manual");
    fetchSources();
  }

  async function handleReRun(source: Source) {
    if (source.scraper === "manual") return;
    setRunning(source.id);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/scrape/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source.id }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setNotification({
          type: "success",
          message: `${source.name}: ${result.events_inserted} eventos insertados (${result.events_found} encontrados)`,
        });
      } else if (result.vercel) {
        setNotification({
          type: "error",
          message: `${source.name}: corre en terminal → npm run scrape:all (o ${result.command})`,
        });
      } else {
        setNotification({
          type: "error",
          message: `${source.name}: ${result.error || "Error al ejecutar scraper"}`,
        });
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: `${source.name}: ${(err as Error).message || "Error de conexión"}`,
      });
    }

    setRunning(null);
    fetchSources();
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "ok": return <span className="text-[#5A7D5A] font-medium text-xs">OK</span>;
      case "error": return <span className="text-[#C96442] font-medium text-xs">Error</span>;
      case "manual": return <span className="text-[#B89B4B] font-medium text-xs">Manual</span>;
      default: return <span className="text-[#87867F] text-xs">Pendiente</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Fuentes</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">Gestión de fuentes de eventos</p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors"
        >
          <Plus className="h-4 w-4" /> Nueva fuente
        </button>
      </div>

      {/* Notification toast */}
      {notification && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-[#F0F7F0] border-[#5A7D5A] text-[#2D4A2D]"
              : "bg-[#FDF0EE] border-[#C96442] text-[#6B2C23]"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <CircleAlert className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-0.5 rounded hover:opacity-70 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-[#87867F] text-sm py-8 text-center">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Cargando...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#D4D2C9] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px_100px_50px_130px] gap-3 px-5 py-3 text-xs font-medium text-[#87867F] border-b border-[#D4D2C9]">
            <span>Nombre</span>
            <span>Cat</span>
            <span>Scraper</span>
            <span>Estado</span>
            <span>Últ. run</span>
            <span>Evts</span>
            <span>Acción</span>
          </div>

          {sources.map((source) => (
            <div
              key={source.id}
              className="grid grid-cols-[1fr_80px_80px_80px_100px_50px_130px] gap-3 px-5 py-3 text-sm border-b border-[#D4D2C9] last:border-0 items-center"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(source)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    source.active ? "bg-[#5A7D5A] border-[#5A7D5A]" : "border-[#D4D2C9]"
                  }`}
                >
                  {source.active && <Check className="h-2.5 w-2.5 text-white" />}
                </button>
                <span className={`font-medium ${source.active ? "text-[#1F1E1D]" : "text-[#87867F]"}`}>
                  {source.name}
                </span>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#87867F] hover:text-[#C96442] transition-colors">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <span className="text-[#5C5B57] text-sm">{source.categoria}</span>
              <span className="text-[#87867F] text-xs">{source.scraper}</span>
              <div>{statusBadge(source.status)}</div>
              <span className="text-[#87867F] text-xs">
                {source.last_run_at
                  ? new Date(source.last_run_at).toLocaleDateString("es-PY", { day: "numeric", month: "short" })
                  : "—"}
              </span>
              <span className="text-[#1F1E1D] font-medium">{source.events_last_run}</span>
              <div className="flex items-center gap-1">
                {source.scraper !== "manual" && (
                  <button
                    onClick={() => handleReRun(source)}
                    disabled={running === source.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E8DCC8] transition-colors disabled:opacity-50"
                  >
                    {running === source.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                    Re-run
                  </button>
                )}
                {source.status === "manual" && (
                  <Link href="/admin/eventos/nuevo" className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#B89B4B] hover:bg-[#E8DCC8] transition-colors">
                    + Evento
                  </Link>
                )}
                {source.status === "error" && source.last_error && (
                  <button
                    onClick={() => { setErrorSource(source); setModal("error"); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[#F5F4ED] text-[#C96442] hover:bg-[#E8DCC8] transition-colors"
                  >
                    <Eye className="h-3 w-3" /> Error
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nueva fuente */}
      {modal === "new" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-md bg-white rounded-xl border border-[#D4D2C9] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1F1E1D]">Nueva fuente</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-[#F5F4ED] rounded-lg text-[#87867F]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleNewSource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">Nombre</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="Ej: Shopping Mariscal" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C5B57] mb-1">URL</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] placeholder-[#87867F]"
                  placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Categoría</label>
                  <select value={newCategoria} onChange={(e) => setNewCategoria(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
                    {["Concierto", "Deporte", "Feria", "Teatro", "Congreso", "Entretenimiento", "Otro"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C5B57] mb-1">Scraper</label>
                  <select value={newScraper} onChange={(e) => setNewScraper(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442]">
                    {["manual", "playwright", "fetch", "llm"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-xl text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear fuente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver error */}
      {modal === "error" && errorSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-full max-w-lg bg-white rounded-xl border border-[#D4D2C9] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#1F1E1D]">Error: {errorSource.name}</h2>
              <button onClick={() => { setModal(null); setErrorSource(null); }}
                className="p-1 hover:bg-[#F5F4ED] rounded-lg text-[#87867F]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="bg-[#F5F4ED] border border-[#D4D2C9] rounded-xl p-4 text-sm text-[#C96442] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {errorSource.last_error}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
