"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F5F4ED] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#5A7D5A]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-[#5A7D5A]" />
            </div>
            <h2 className="text-lg font-bold text-[#1F1E1D]">Link enviado</h2>
            <p className="text-sm text-[#5C5B57] leading-relaxed">
              Revisá <strong className="text-[#1F1E1D]">{email}</strong>. Te enviamos un link para entrar sin contraseña.
            </p>
            <p className="text-xs text-[#87867F]">Si no aparece, revisá spam.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-[#D4D2C9] shadow-sm">
        <CardHeader className="text-center pt-8">
          <h1 className="text-2xl font-bold text-[#1F1E1D] tracking-tight">
            Bru<span className="text-[#C96442] italic">jula</span>
          </h1>
          <p className="text-sm text-[#5C5B57] mt-2">
            Ingresá sin contraseña
          </p>
        </CardHeader>
        <CardContent className="pb-8 space-y-4">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email && sendLink()}
            className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442]"
            autoFocus
            autoComplete="email"
          />
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}
          <Button
            onClick={sendLink}
            disabled={loading || !email}
            className="w-full h-12 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Enviar link de acceso
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-[#87867F] text-center">Sin códigos ni contraseñas</p>
        </CardContent>
      </Card>
    </div>
  );
}
