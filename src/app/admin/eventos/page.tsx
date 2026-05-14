"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Music,
  Trophy,
  Globe,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Link2,
  Play,
} from "lucide-react";

// ─── Fuentes de eventos ────────────────────────────────────────

interface SourceLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  category: string;
  social?: { name: string; url: string; icon: React.ReactNode }[];
}

const SOURCES: SourceLink[] = [
  {
    name: "Ticketea.com.py",
    url: "https://ticketea.com.py",
    icon: <Music className="h-4 w-4" />,
    category: "Venta de entradas",
    social: [
      { name: "Instagram", url: "https://instagram.com/ticketeapy", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Facebook", url: "https://facebook.com/TicketeaParaguay", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Twitter", url: "https://twitter.com/TicketeaPy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Tuti.com.py",
    url: "https://tuti.com.py",
    icon: <Music className="h-4 w-4" />,
    category: "Venta de entradas",
    social: [
      { name: "Instagram", url: "https://instagram.com/tuti.py", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "APF — Fútbol Paraguayo",
    url: "https://apf.org.py",
    icon: <Trophy className="h-4 w-4" />,
    category: "Deportes",
    social: [
      { name: "Instagram", url: "https://instagram.com/apforganiza", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Facebook", url: "https://facebook.com/APForganiza", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Twitter", url: "https://twitter.com/APFOficial", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Visit Paraguay",
    url: "https://visitparaguay.travel",
    icon: <Globe className="h-4 w-4" />,
    category: "Turismo oficial",
    social: [
      { name: "Instagram", url: "https://instagram.com/visitparaguaypy", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Facebook", url: "https://facebook.com/VisitParaguayPy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Tiketon Paraguay",
    url: "https://tiketon.com/paraguay",
    icon: <Calendar className="h-4 w-4" />,
    category: "Venta de entradas",
    social: [
      { name: "Instagram", url: "https://instagram.com/TiketonArgentina", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "AllAccess Paraguay",
    url: "https://allaccess.com.py",
    icon: <Calendar className="h-4 w-4" />,
    category: "Venta de entradas",
    social: [
      { name: "Instagram", url: "https://instagram.com/allaccesspy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Market Comunicaciones",
    url: "https://marketcomunicaciones.com",
    icon: <Building2 className="h-4 w-4" />,
    category: "Expos y ferias empresariales",
    social: [
      { name: "Instagram", url: "https://instagram.com/marketcomunicaciones", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
];

// ─── Grandes productoras / promoters ───────────────────────────

interface PromoterLink {
  name: string;
  social: { name: string; url: string; icon: React.ReactNode }[];
}

const PROMOTERS: PromoterLink[] = [
  {
    name: "G5Pro",
    social: [
      { name: "Instagram", url: "https://instagram.com/g5pro", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Track",
    social: [
      { name: "Instagram", url: "https://instagram.com/trackpy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "TuTicket",
    social: [
      { name: "Instagram", url: "https://instagram.com/tuticketpy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
  {
    name: "Secretaría de Turismo (Senatur)",
    social: [
      { name: "Instagram", url: "https://instagram.com/senaturpy", icon: <Globe className="h-3.5 w-3.5" /> },
      { name: "Facebook", url: "https://facebook.com/SenaturPy", icon: <Globe className="h-3.5 w-3.5" /> },
    ],
  },
];

// ─── Últimos scrapes ───────────────────────────────────────────

interface ScrapeLog {
  fuente: string;
  registros_nuevos: number;
  registros_totales: number;
  duracion_ms: number;
  estado: string;
  created_at: string;
}

// ─── Componente principal ──────────────────────────────────────

export default function AdminEventosPage() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/scrape/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch {
      // No hay API todavía, silencioso
    } finally {
      setLoading(false);
    }
  }

  async function handleScrape(source: string) {
    setScraping(source);
    setResult(null);
    try {
      const res = await fetch("/api/scrape/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();
      setResult(
        `✅ ${data.events_inserted ?? 0} eventos de ${source} insertados`
      );
      fetchLogs();
    } catch (err) {
      setResult(`❌ Error: ${(err as Error).message}`);
    } finally {
      setScraping(null);
    }
  }

  const lastScrapes = logs.slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D] mb-2">
            ⚙️ Radar Admin
          </h1>
          <p className="text-[#5C5B57] text-sm">
            Fuentes de eventos del Paraguay — scrapeá datos, seguí redes, controlá
            el radar
          </p>
        </div>

        {/* Últimos scrapes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#1F1E1D]">
              📊 Últimos scrapes
            </h2>
            <button
              onClick={fetchLogs}
              className="text-xs text-[#C96442] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" /> Actualizar
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-[#87867F] py-4">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Cargando...
            </div>
          ) : lastScrapes.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#D4D2C9] p-4 text-sm text-[#87867F]">
              Aún no hay scrapes registrados. Scrapeá desde los botones de abajo.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#D4D2C9] divide-y divide-[#E5E4DD]">
              {lastScrapes.map((log, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    {log.estado === "ok" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className="font-medium text-[#1F1E1D] capitalize">
                      {log.fuente}
                    </span>
                    <span className="text-[#87867F]">
                      {log.registros_nuevos} eventos
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[#87867F] text-xs">
                    <span>{(log.duracion_ms / 1000).toFixed(1)}s</span>
                    <span>
                      {new Date(log.created_at).toLocaleString("es-PY", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Resultado del scrape */}
        {result && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-white border border-[#D4D2C9] text-sm font-medium text-[#1F1E1D]">
            {result}
          </div>
        )}

        {/* Portales */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1F1E1D] mb-3">
            🌐 Portales de eventos
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {SOURCES.map((source) => (
              <div
                key={source.name}
                className="bg-white rounded-lg border border-[#D4D2C9] p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C96442]/10 flex items-center justify-center text-[#C96442]">
                      {source.icon}
                    </div>
                    <div>
                      <Link
                        href={source.url}
                        target="_blank"
                        className="font-bold text-sm text-[#1F1E1D] hover:text-[#C96442] transition-colors flex items-center gap-1"
                      >
                        {source.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <p className="text-[10px] text-[#87867F] uppercase tracking-wider">
                        {source.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {source.social?.map((s) => (
                    <Link
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      className="text-[#87867F] hover:text-[#C96442] transition-colors"
                      title={s.name}
                    >
                      {s.icon}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => handleScrape(source.name.toLowerCase().split(" ")[0])}
                  disabled={scraping === source.name.toLowerCase().split(" ")[0]}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E5E4DD] transition-colors disabled:opacity-50"
                >
                  {scraping === source.name.toLowerCase().split(" ")[0] ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Scrapeando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Scrapear ahora
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Redes de productoras */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#1F1E1D] mb-3">
            📱 Productoras &amp; Organizadores
          </h2>
          <div className="bg-white rounded-lg border border-[#D4D2C9] divide-y divide-[#E5E4DD]">
            {PROMOTERS.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="font-bold text-sm text-[#1F1E1D]">{p.name}</span>
                <div className="flex items-center gap-2">
                  {p.social.map((s) => (
                    <Link
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#E5E4DD] transition-colors text-xs"
                    >
                      {s.icon}
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ayuda / Cómo scrapear */}
        <section className="bg-white rounded-lg border border-[#D4D2C9] p-5">
          <h2 className="text-lg font-bold text-[#1F1E1D] mb-2">
            🛠️ Scrapeo manual
          </h2>
          <div className="text-sm text-[#5C5B57] space-y-1">
            <p>
              Los scrapers que usan Playwright se corren desde tu máquina local:
            </p>
            <pre className="bg-[#F5F4ED] p-3 rounded-lg text-xs font-mono text-[#1F1E1D] mt-2 overflow-x-auto">
              {`# Todos los scrapers
npm run scrape:all

# Solo uno
npm run scrape:ticketea
npm run scrape:tuti
npm run scrape:apf
npm run scrape:visitparaguay`}
            </pre>
            <p className="mt-2 text-[#87867F]">
              Los datos se insertan directamente en Supabase y aparecen al toque
              en la{" "}
              <Link
                href="/eventos"
                className="text-[#C96442] hover:underline font-medium"
              >
                página de eventos
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
