"use client";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Package, LogOut, Menu, X, ClipboardList } from "lucide-react";
import StatusBar from "@/components/status-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { redirect("/login"); return; }
      setUser(data.user);
      supabase.from("profiles").select("role").eq("id", data.user.id).single().then(({ data: profile }) => {
        setRole(profile?.role ?? "user");
      });
    });
  }, []);

  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-[#D4D2C9] px-4 h-14">
        <Link href="/dashboard" className="text-xl font-bold text-[#1F1E1D] tracking-tight">
          Bru<span className="text-[#C96442] italic">jula</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#5C5B57]">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#D4D2C9] flex flex-col shrink-0 transition-transform`}>
          <div className="p-6 hidden lg:block">
            <Link href="/dashboard" className="text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Bru<span className="text-[#C96442] italic">jula</span>
            </Link>
            <p className="text-xs text-[#87867F] mt-1">Panel de administración</p>
          </div>
          <div className="p-6 lg:hidden">
            <Link href="/dashboard" className="text-xl font-bold text-[#1F1E1D] tracking-tight">
              Bru<span className="text-[#C96442] italic">jula</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/dashboard/clientes" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors">
              <Users className="h-4 w-4" /> Clientes
            </Link>
            <Link href="/dashboard/gestiones" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors">
              <ClipboardList className="h-4 w-4" /> Gestorías
            </Link>
            {isAdmin && (
              <Link href="/dashboard/modulos" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D] transition-colors">
                <Package className="h-4 w-4" /> Módulos
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-[#D4D2C9]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-xs font-bold shrink-0">
                {role === "superadmin" ? "SA" : "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F1E1D] truncate">{user?.email ?? "—"}</p>
                <p className="text-xs text-[#87867F] capitalize">{role ?? "..."}</p>
              </div>
            </div>
            <a href="/auth/signout" className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-[#D4D2C9] text-sm text-[#87867F] hover:bg-[#F5F4ED] transition-colors">
              <LogOut className="h-4 w-4" /> Salir
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 overflow-auto flex flex-col">
          <StatusBar />
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
