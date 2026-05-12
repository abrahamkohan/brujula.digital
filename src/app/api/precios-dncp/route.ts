import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }
  const res = await fetch(DNCP_AUTH, {
    method: "POST",
    headers: { Authorization: `Basic ${RT}` },
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + 14 * 60 * 1000,
  };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");
  const year = request.nextUrl.searchParams.get("year") ?? "2025";

  try {
    const token = await getToken();

    const params = new URLSearchParams({
      items_per_page: "15",
      tipo_fecha: "adjudicacion",
      fecha_desde: `${year}-01-01`,
      fecha_hasta: `${year}-12-31`,
    });

    if (search) params.set("tender.title", search);

    const url = `${DNCP_API}/search/processes?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();

    if (!text || res.status === 404) {
      return NextResponse.json({ awards: [], search, year, message: "Sin resultados" });
    }

    const data = JSON.parse(text);
    const records = data.records ?? [];

    // Fetch releases in parallel (max 8)
    const awardsPromises = records.slice(0, 8).map(async (record: {
      ocid: string;
      releases?: Array<{ url?: string }>;
    }) => {
      const latestRelease = record.releases?.[0];
      if (!latestRelease?.url) return null;

      try {
        const relRes = await fetch(latestRelease.url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000),
        });
        const relText = await relRes.text();
        if (!relText) return null;
        const releaseData = JSON.parse(relText);
        const inner = releaseData.releases?.[0] ?? releaseData;
        const tender = inner.tender;
        const award = inner.awards?.[0];
        const contract = inner.contracts?.[0];

        return {
          ocid: record.ocid,
          title: tender?.title ?? record.ocid,
          entity: tender?.procuringEntity?.name ?? "—",
          supplier: award?.suppliers?.[0]?.name ?? "—",
          amount: award?.value?.amount ?? contract?.value?.amount ?? tender?.value?.amount ?? 0,
          currency: award?.value?.currency ?? "PYG",
          date: award?.date ?? contract?.dateSigned ?? latestRelease.url.split("-").pop()?.slice(0, 10) ?? "",
          dncp_url: award?.documents?.[0]?.url ?? `https://www.contrataciones.gov.py/licitaciones/${record.ocid.replace("ocds-03ad3f-","")}`,
          items: [
            ...new Set([
              ...(tender?.items?.map((i: { description: string }) => i.description) ?? []),
              ...(award?.items?.map((i: { description: string }) => i.description) ?? []),
            ]),
          ].slice(0, 5),
        };
      } catch {
        return null;
      }
    });

    const awards = (await Promise.all(awardsPromises)).filter(Boolean);

    const amounts = awards
      .filter((a) => a && a.amount > 0)
      .map((a) => a!.amount)
      .sort((a: number, b: number) => a - b);

    const stats =
      amounts.length > 0
        ? {
            min: amounts[0],
            max: amounts[amounts.length - 1],
            avg: Math.round(amounts.reduce((s: number, v: number) => s + v, 0) / amounts.length),
            count: amounts.length,
            currency: "PYG",
          }
        : null;

    return NextResponse.json({ awards, stats, search, year });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("precios-dncp error:", msg);
    return NextResponse.json(
      { error: "No pudimos consultar en este momento.", awards: [], message: msg.slice(0, 100) },
      { status: 500 }
    );
  }
}
