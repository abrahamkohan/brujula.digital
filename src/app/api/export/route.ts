import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") || "";
  
  // Proxy: just redirect to our own API and format as CSV
  try {
    let data: Array<Record<string, unknown>> = [];
    
    if (source === "funcionarios") {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: rows } = await supabase.from("funcionarios").select("cedula,nombre,apellido,organismo,cargo,estado").limit(100);
      data = rows ?? [];
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "Sin datos" }, { status: 404 });
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=brujula-${source}-${Date.now()}.csv`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error generando CSV" }, { status: 500 });
  }
}
