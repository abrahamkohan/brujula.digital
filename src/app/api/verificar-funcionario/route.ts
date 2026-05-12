import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface FuncionarioResult {
  encontrado: boolean;
  cedula: string;
  nombre?: string;
  apellido?: string;
  organismo?: string;
  cargo?: string;
  estado?: string;
  ultima_actualizacion?: string;
}

export async function GET(request: NextRequest) {
  const ci = request.nextUrl.searchParams.get("ci");
  if (!ci || !/^\d{1,8}$/.test(ci)) {
    return NextResponse.json(
      { error: "Cédula inválida. Ingresá solo números (máximo 8 dígitos)." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Rate limiting: check queries today
  const { data: { user } } = await supabase.auth.getUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user) {
    const { count } = await supabase
      .from("consultas")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    // Check module access + limits
    const { data: modAccess } = await supabase
      .from("client_modules")
      .select("max_queries")
      .eq("client_id", user.id)
      .eq("module_id", "verificar-funcionarios")
      .eq("enabled", true)
      .single();

    // Free tier: 3 queries/day without auth
    // Auth user without module: 5 queries/day
    // Auth user with module: as per max_queries
    const dailyLimit = modAccess
      ? (modAccess.max_queries ?? Infinity)
      : 5;

    if (count && count >= dailyLimit) {
      return NextResponse.json(
        { error: "Límite diario alcanzado. Actualizá tu plan para consultas ilimitadas." },
        { status: 429 }
      );
    }
  } else {
    // Anonymous: 3 queries per IP per day
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { count } = await supabase
      .from("consultas")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", today.toISOString());

    if (count && count >= 3) {
      return NextResponse.json(
        { error: "Límite diario alcanzado. Registrate para más consultas gratuitas." },
        { status: 429 }
      );
    }
  }

  // Query the database
  const { data: funcionario, error } = await supabase
    .from("funcionarios")
    .select("cedula, nombre, apellido, organismo, cargo, estado, ultima_actualizacion")
    .eq("cedula", ci)
    .maybeSingle();

  // Log the query
  await supabase.from("consultas").insert({
    user_id: user?.id ?? null,
    tipo: "funcionario",
    parametro: ci,
    resultado: funcionario ? "positivo" : "negativo",
    ip_address: request.headers.get("x-forwarded-for") ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: "No pudimos verificar en este momento. Intentá de nuevo." },
      { status: 500 }
    );
  }

  if (!funcionario) {
    return NextResponse.json({
      encontrado: false,
      cedula: ci,
    } satisfies FuncionarioResult);
  }

  return NextResponse.json({
    encontrado: true,
    cedula: funcionario.cedula,
    nombre: funcionario.nombre,
    apellido: funcionario.apellido,
    organismo: funcionario.organismo,
    cargo: funcionario.cargo,
    estado: funcionario.estado,
    ultima_actualizacion: funcionario.ultima_actualizacion,
  } satisfies FuncionarioResult);
}
