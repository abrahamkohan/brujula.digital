import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package } from "lucide-react";

export default async function ModulosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/verificar");

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F1E1D]">Módulos</h1>
        <p className="text-sm text-[#87867F] mt-1">Configuración de productos disponibles</p>
      </div>

      <Card className="border-[#D4D2C9] shadow-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4D2C9]">
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Módulo</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Slug</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Descripción</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Precio</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {modules?.map((mod) => (
                  <tr key={mod.id} className="border-b border-[#E5E4DD] hover:bg-[#F5F4ED]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#C96442]/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-[#C96442]" />
                        </div>
                        <p className="font-medium text-[#1F1E1D]">{mod.name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5C5B57] font-mono text-xs">{mod.slug}</td>
                    <td className="py-3 px-4 text-[#5C5B57] max-w-xs truncate">{mod.description}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#C96442]">
                        USD {(mod.price_cents / 100).toFixed(0)}/mes
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${
                        mod.active
                          ? "bg-[#5A7D5A]/10 text-[#5A7D5A]"
                          : "bg-[#D4D2C9]/20 text-[#87867F]"
                      } hover:bg-inherit border-0`}>
                        {mod.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#1F1E1D] mb-4">Potencial de revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { plan: "Starter", mods: "1 módulo", price: "USD 30–80/mes", tag: "Entrada" },
            { plan: "Pro", mods: "2–3 módulos", price: "USD 100–200/mes", tag: "Volumen" },
            { plan: "Full", mods: "Todos los módulos", price: "USD 300–500/mes", tag: "All-in" },
          ].map((plan) => (
            <Card key={plan.plan} className="border-[#D4D2C9] shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#1F1E1D]">{plan.plan}</span>
                  <Badge className="bg-[#F5F4ED] text-[#87867F] hover:bg-[#F5F4ED] border-0 text-xs">
                    {plan.tag}
                  </Badge>
                </div>
                <p className="text-xs text-[#87867F] mb-3">{plan.mods}</p>
                <p className="text-lg font-bold text-[#C96442]">{plan.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
