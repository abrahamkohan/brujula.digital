import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/verificar");

  // Stats
  const { count: totalClientes } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("role", "superadmin");

  const { count: consultasHoy } = await supabase
    .from("consultas")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const { count: consultasMes } = await supabase
    .from("consultas")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F1E1D]">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1">Resumen general de Brujula</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Clientes totales", value: totalClientes ?? 0, icon: Users, color: "text-[#C96442]", bg: "bg-[#C96442]/10" },
          { label: "Consultas hoy", value: consultasHoy ?? 0, icon: Clock, color: "text-[#5A7D5A]", bg: "bg-[#5A7D5A]/10" },
          { label: "Consultas este mes", value: consultasMes ?? 0, icon: TrendingUp, color: "text-[#B89B4B]", bg: "bg-[#B89B4B]/10" },
          { label: "Módulos activos", value: 3, icon: CheckCircle2, color: "text-[#4A7B9D]", bg: "bg-[#4A7B9D]/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-[#D4D2C9] shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1F1E1D]">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#1F1E1D] mb-4">Acceso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Gestionar clientes", desc: "Ver, asignar módulos y monitorear uso", href: "/dashboard/clientes", color: "bg-[#C96442]" },
            { label: "Configurar módulos", desc: "Precios, descripciones y activación", href: "/dashboard/modulos", color: "bg-[#5A7D5A]" },
            { label: "Verificar funcionario", desc: "Probar la herramienta pública", href: "/verificar", color: "bg-[#4A7B9D]" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="block bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <p className="font-semibold text-[#1F1E1D] mb-1 group-hover:text-[#C96442] transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-[#87867F]">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
