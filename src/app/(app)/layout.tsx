"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, Package, ClipboardList, ShieldCheck,
  TrendingUp, Shield, Activity, Search, Building2, Home,
  Wheat, Calendar, Banknote, ArrowLeftRight,
  Menu, X, LogOut, Zap, Database, Globe, Monitor
} from "lucide-react";

const navItems = [
  { section: "Principal", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "Módulos", items: [
    { href: "/verificar", label: "Funcionarios", icon: ShieldCheck },
    { href: "/precios", label: "Precios DNCP", icon: TrendingUp },
    { href: "/score", label: "Empresa Score", icon: Shield },
    { href: "/check", label: "Background Check", icon: Search },
    { href: "/radar", label: "Radar", icon: Activity },
    { href: "/eventos", label: "Eventos", icon: Calendar },
    { href: "/fincheck", label: "FinCheck", icon: Banknote },
    { href: "/inmobiliario", label: "Inmobiliario", icon: Home },
    { href: "/agro", label: "Agro", icon: Wheat },
    { href: "/portal", label: "Portal PY", icon: Globe },
  ]},
  { section: "Herramientas", items: [
    { href: "/buscar", label: "Buscador", icon: Search },
    { href: "/entidades", label: "Entidades", icon: Building2 },
    { href: "/comparar", label: "Comparar", icon: ArrowLeftRight },
    { href: "/proveedores", label: "Proveedores", icon: Users },
  ]},
  { section: "Gestión", items: [
    { href: "/dashboard/gestiones", label: "Gestorías", icon: ClipboardList },
    { href: "/dashboard/clientes", label: "Clientes", icon: Users },
    { href: "/dashboard/modulos", label: "Módulos", icon: Package },
  ]},
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); });
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* Mobile header — oculto en eventos */}
      {!pathname.startsWith("/eventos") && (
        <div className="lg:hidden flex items-center justify-between bg-white border-b border-[#D4D2C9] px-4 h-14">
          <Link href="/" className="text-lg font-bold text-[#1F1E1D] tracking-tight">
            Bru<span className="text-[#C96442] italic">jula</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#5C5B57]">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      )}

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />}

      <div className="flex">
        {/* Sidebar — completamente oculto en eventos */}
        {!pathname.startsWith("/eventos") && (
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-white border-r border-[#D4D2C9] flex flex-col shrink-0 transition-transform`}>
          <div className="px-5 py-5">
            <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#C96442]" />
              <span className="text-xl font-bold text-[#1F1E1D] tracking-tight">
                Bru<span className="text-[#C96442] italic">jula</span>
              </span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 space-y-5">
            {navItems.map(group => (
              <div key={group.section}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4D2C9]">{group.section}</p>
                {group.items.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active ? "bg-[#C96442]/10 text-[#C96442]" : "text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D]"
                      }`}>
                      <item.icon className="h-4 w-4 shrink-0" />{item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-[#D4D2C9]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C96442]/10 flex items-center justify-center text-[#C96442] text-xs font-bold shrink-0">A</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#1F1E1D] truncate">{user?.email || "Usuario"}</p>
              </div>
              <a href="/auth/signout" className="p-1.5 rounded-lg hover:bg-[#F5F4ED] text-[#87867F]" title="Salir"><LogOut className="h-3.5 w-3.5" /></a>
            </div>
          </div>
        </aside>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
