import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/verificar");

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";

  return (
    <div className="min-h-screen bg-[#F5F4ED] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D4D2C9] flex flex-col shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold text-[#1F1E1D] tracking-tight">
            Bru<span className="text-[#C96442] italic">jula</span>
          </Link>
          <p className="text-xs text-[#87867F] mt-1">Panel de administración</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/clientes"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors"
          >
            <Users className="h-4 w-4" />
            Clientes
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/modulos"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors"
            >
              <Package className="h-4 w-4" />
              Módulos
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-[#D4D2C9]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-xs font-bold">
              {profile?.role === "superadmin" ? "SA" : "AD"}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1F1E1D] truncate max-w-[140px]">
                {user.email}
              </p>
              <p className="text-xs text-[#87867F] capitalize">{profile?.role ?? "user"}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" className="w-full text-[#87867F] border-[#D4D2C9] hover:bg-[#F5F4ED]">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
