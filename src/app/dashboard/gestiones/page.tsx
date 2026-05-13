"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, DollarSign, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Gestion {
  id: string; cliente_nombre: string; tipo: string; estado: string;
  precio_cobrado: number; descripcion: string; fecha_inicio: string; fecha_entrega: string;
}

const estados = ["recibido", "en_proceso", "completado"];
const estadoLabels: Record<string, string> = { recibido: "Recibido", en_proceso: "En proceso", completado: "Completado" };
const estadoColors: Record<string, string> = { recibido: "bg-blue-50 text-blue-600", en_proceso: "bg-amber-50 text-amber-600", completado: "bg-[#5A7D5A]/10 text-[#5A7D5A]" };
const tipoIcons: Record<string, string> = { antecedente: "Antecedente", residencia: "Residencia", ruc: "RUC", habilitacion: "Habilitación", dncp: "DNCP", bundle: "Bundle Expat" };

export default function GestionesPage() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("gestiones").select("*, cliente:clientes_gestion(nombre)").order("created_at", { ascending: false }).then(({ data }) => {
      const parsed = (data ?? []).map(g => ({
        id: g.id, cliente_nombre: (g.cliente as { nombre?: string })?.nombre ?? "—",
        tipo: g.tipo, estado: g.estado, precio_cobrado: g.precio_cobrado || 0,
        descripcion: g.descripcion || "", fecha_inicio: g.fecha_inicio, fecha_entrega: g.fecha_entrega,
      }));
      setGestiones(parsed);
      setTotalRevenue(parsed.reduce((s, g) => s + (g.precio_cobrado || 0), 0));
      setLoading(false);
    });
  }, []);

  function fmtGs(n: number) { return n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}k` : `${n}`; }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#C96442]" /></div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1E1D]">Panel de Gestorías</h1>
          <p className="text-sm text-[#87867F]">{gestiones.length} gestiones · Revenue: {fmtGs(totalRevenue)} Gs</p>
        </div>
      </div>

      {gestiones.length === 0 ? (
        <Card className="border-[#D4D2C9]"><CardContent className="pt-8 pb-8 text-center text-[#87867F]">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 text-[#D4D2C9]" />
          <p className="font-medium">Sin gestiones todavía</p>
          <p className="text-sm">Acá vas a hacer tracking de trámites de clientes</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {estados.map(estado => {
            const items = gestiones.filter(g => g.estado === estado);
            return (
              <div key={estado}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#1F1E1D]">{estadoLabels[estado]}</h3>
                  <Badge className="bg-[#F5F4ED] text-[#87867F] text-xs">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map(g => (
                    <Card key={g.id} className="border-[#D4D2C9] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#1F1E1D]">{tipoIcons[g.tipo] || g.tipo}</p>
                            <p className="text-xs text-[#5C5B57]">{g.descripcion || "Sin descripción"}</p>
                          </div>
                          <Badge className={estadoColors[g.estado] + " text-[10px]"}>{estadoLabels[g.estado]}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#87867F]">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{g.cliente_nombre}</span>
                          {g.precio_cobrado > 0 && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{fmtGs(g.precio_cobrado)} Gs</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {items.length === 0 && (
                    <div className="bg-[#F5F4ED] rounded-xl border border-dashed border-[#D4D2C9] p-6 text-center text-xs text-[#87867F]">
                      Sin gestiones
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick calculator */}
      <Card className="border-[#D4D2C9] shadow-sm mt-8">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-[#1F1E1D] mb-4">💰 Precios de referencia</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { tipo: "Antecedente", precio: "80–150k Gs", margen: "Alto" },
              { tipo: "Residencia temp.", precio: "USD 200–400", margen: "Medio" },
              { tipo: "Bundle Expat", precio: "USD 400–700", margen: "Alto" },
              { tipo: "Habilitación", precio: "Variable", margen: "Medio" },
            ].map(p => (
              <div key={p.tipo} className="bg-[#F5F4ED] rounded-xl p-3 text-center">
                <p className="text-xs text-[#87867F]">{p.tipo}</p>
                <p className="font-bold text-[#C96442] text-sm mt-1">{p.precio}</p>
                <p className="text-[10px] text-[#87867F] mt-0.5">Margen: {p.margen}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
