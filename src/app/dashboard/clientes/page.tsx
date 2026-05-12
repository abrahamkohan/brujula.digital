import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/verificar");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  const { data: modules } = await supabase
    .from("modules")
    .select("id, name")
    .eq("active", true);

  // Get client modules
  const { data: clientMods } = await supabase
    .from("client_modules")
    .select("client_id, module_id, enabled, max_queries");

  const clientModulesMap = new Map<string, Map<string, { enabled: boolean; max_queries: number | null }>>();
  clientMods?.forEach((cm) => {
    if (!clientModulesMap.has(cm.client_id)) {
      clientModulesMap.set(cm.client_id, new Map());
    }
    clientModulesMap.get(cm.client_id)!.set(cm.module_id, {
      enabled: cm.enabled,
      max_queries: cm.max_queries,
    });
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1E1D]">Clientes</h1>
          <p className="text-sm text-[#87867F] mt-1">
            {profiles?.length ?? 0} clientes registrados
          </p>
        </div>
      </div>

      <Card className="border-[#D4D2C9] shadow-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4D2C9]">
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Rol</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Módulos</th>
                  <th className="text-left py-3 px-4 text-[#87867F] font-medium">Registro</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.filter(p => p.role !== "superadmin").map((profile) => {
                  const mods = clientModulesMap.get(profile.id);
                  return (
                    <tr key={profile.id} className="border-b border-[#E5E4DD] hover:bg-[#F5F4ED]/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#1F1E1D]">{profile.full_name ?? "Sin nombre"}</p>
                      </td>
                      <td className="py-3 px-4 text-[#5C5B57]">{profile.email}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-[#F5F4ED] text-[#87867F] hover:bg-[#F5F4ED] border-0 capitalize">
                          {profile.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {modules?.map((mod) => {
                            const cm = mods?.get(mod.id);
                            if (!cm?.enabled) return null;
                            return (
                              <Badge
                                key={mod.id}
                                className="bg-[#C96442]/10 text-[#C96442] hover:bg-[#C96442]/10 border-0 text-xs"
                              >
                                {mod.name}
                              </Badge>
                            );
                          })}
                          {(!mods || Array.from(mods.values()).every(m => !m.enabled)) && (
                            <span className="text-xs text-[#87867F]">Sin módulos</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#87867F] text-xs">
                        {new Date(profile.created_at).toLocaleDateString("es-PY")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
