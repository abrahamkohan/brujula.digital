"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#C96442]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-[#C96442]" />
          </div>
          <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Admin</h1>
          <p className="text-sm text-[#87867F] mt-1 font-sans">Brújula Digital</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl border border-[#D4D2C9] bg-white text-[#1F1E1D] text-sm placeholder-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442]/20 focus:border-[#C96442] transition-all"
          />

          {error && (
            <p className="text-xs text-[#C96442] text-center">Contraseña incorrecta</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b85a3a] transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
