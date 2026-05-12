import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;
  const res = await fetch(DNCP_AUTH, { method: "POST", headers: { Authorization: `Basic ${RT}` }, signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";
  try {
    const token = await getToken();
    const params = new URLSearchParams({ items_per_page: "12" });
    if (search) params.set("name", search);

    const res = await fetch(`${DNCP_API}/search/procuringEntities?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
    }).catch(() => null);

    if (!res?.ok) return NextResponse.json({ entidades: [] });

    const text = await res.text();
    if (!text) return NextResponse.json({ entidades: [] });

    const data = JSON.parse(text);
    const results = data.releases ?? data.results ?? [];

    const entidades = results.slice(0, 12).map((e: Record<string, unknown>) => ({
      id: (e as { identifier?: { id?: string } }).identifier?.id ?? (e as { id?: string }).id ?? "",
      nombre: (e as { name?: string }).name ?? "Sin nombre",
      tipo: (e as { details?: { entityType?: string } }).details?.entityType ?? "",
      nivel: (e as { details?: { level?: string } }).details?.level ?? "",
      sicp: (e as { identifier?: { id?: string } }).identifier?.id ?? "",
    }));

    return NextResponse.json({ entidades });
  } catch {
    return NextResponse.json({ error: "No disponible" }, { status: 500 });
  }
}
