"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Activity, Clock, AlertCircle } from "lucide-react";

interface ScraperStatus {
  fuente: string; estado: string; registros_totales: number; ultimo_sync: string;
}

export default function StatusBar() {
  const [fuentes, setFuentes] = useState<ScraperStatus[]>([]);
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    const supabase = createClient();
    function refresh() {
      supabase.from("scraper_status").select("*").order("fuente").then(({ data }) => {
        if (data) {
          setFuentes(data);
          const latest = data.reduce((max: string, s: ScraperStatus) => s.ultimo_sync && s.ultimo_sync > max ? s.ultimo_sync : max, "");
          setLastSync(latest);
        }
      });
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  const estadoColor: Record<string, string> = {
    activa: "bg-[#5A7D5A]",
    caida: "bg-red-500",
    rate_limited: "bg-amber-500",
    nunca_synced: "bg-gray-400",
  };

  return (
    <div className="bg-white border-b border-[#D4D2C9] px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {fuentes.map(f => (
            <div key={f.fuente} className="flex items-center gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${estadoColor[f.estado] || "bg-gray-400"}`} />
              <span className="text-[#5C5B57]">{f.fuente.split(" ")[0]}</span>
              <span className="text-[#87867F]">{f.registros_totales}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-[#87867F] shrink-0">
          {lastSync && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(lastSync).toLocaleString("es-PY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3" />{fuentes.filter(f => f.estado === "activa").length}/{fuentes.length}
          </span>
        </div>
      </div>
    </div>
  );
}
