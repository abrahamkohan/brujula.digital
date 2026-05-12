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
  });
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + 14 * 60 * 1000,
  };
  return cachedToken.token;
}

interface Award {
  ocid: string;
  title: string;
  entity: string;
  supplier: string;
  amount: number;
  currency: string;
  date: string;
  items: string[];
}

async function fetchRelease(url: string, token: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");
  const year = request.nextUrl.searchParams.get("year") ?? "2025";

  try {
    const token = await getToken();

    // Search processes with filters
    const params = new URLSearchParams({
      items_per_page: "20",
      tipo_fecha: "adjudicacion",
      fecha_desde: `${year}-01-01`,
      fecha_hasta: `${year}-12-31`,
      order: "date desc",
    });

    if (search) {
      params.set("tender.title", search);
    }

    const url = `${DNCP_API}/search/processes?${params}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();

    if (!text || res.status === 404) {
      return NextResponse.json({ awards: [], search, year, message: "Sin resultados" });
    }

    const data = JSON.parse(text);
    const records = data.records ?? [];

    // Fetch first release for each record to get details
    const awards: Award[] = [];
    for (const record of records.slice(0, 10)) {
      const latestRelease = record.releases?.[0];
      if (!latestRelease?.url) continue;

      const release = await fetchRelease(latestRelease.url, token);
      if (!release) continue;

      const tender = release.tender;
      const award = release.awards?.[0];
      const contract = release.contracts?.[0];

      const amount = award?.value?.amount 
        ?? contract?.value?.amount
        ?? tender?.value?.amount;

      const supplier = award?.suppliers?.[0]?.name ?? "Proveedor no especificado";
      const entity = tender?.procuringEntity?.name ?? "Entidad no especificada";
      const title = tender?.title ?? record.ocid;
      const tenderItems = tender?.items?.map((i: { description: string }) => i.description) ?? [];
      const awardItems = award?.items?.map((i: { description: string }) => i.description) ?? [];

      awards.push({
        ocid: record.ocid,
        title,
        entity,
        supplier,
        amount: amount ?? 0,
        currency: award?.value?.currency ?? "PYG",
        date: award?.date ?? contract?.dateSigned ?? latestRelease.date,
        items: [...new Set([...tenderItems, ...awardItems])].slice(0, 5),
      });
    }

    // Calculate stats
    const amounts = awards.filter(a => a.amount > 0).map(a => a.amount).sort((a, b) => a - b);
    const stats = amounts.length > 0
      ? {
          min: amounts[0],
          max: amounts[amounts.length - 1],
          avg: Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length),
          count: amounts.length,
          currency: "PYG",
        }
      : null;

    return NextResponse.json({ awards, stats, search, year });
  } catch (e) {
    return NextResponse.json(
      { error: "No pudimos consultar en este momento.", awards: [] },
      { status: 500 }
    );
  }
}
