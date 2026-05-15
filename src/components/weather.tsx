// ─── Clima en Asunción — wttr.in con ISR cache 30 min ──────

const ICON_MAP: Record<string, string> = {
  Sunny: "☀️",
  "Partly cloudy": "⛅",
  Cloudy: "☁️",
  Overcast: "☁️",
  Mist: "🌫️",
  "Patchy rain possible": "🌦️",
  "Patchy rain nearby": "🌦️",
  "Light rain": "🌧️",
  "Moderate rain": "🌧️",
  "Heavy rain": "🌧️",
  "Patchy snow possible": "🌨️",
  Thunderstorm: "⛈️",
  Fog: "🌫️",
  Clear: "🌙",
};

const FRASES: Record<string, string> = {
  Sunny: "ideal para tereré",
  "Partly cloudy": "buen día para recorrer",
  Cloudy: "sin sol, mejor plan cultural",
  Overcast: "tarde de museos",
  Mist: "mañana de misterio",
  "Patchy rain possible": "mejor llevar paraguas",
  "Light rain": "tarde de lluvia, plan museo",
  "Moderate rain": "dale al tereré bajo techo",
  "Heavy rain": "día de shopping",
  Thunderstorm: "qué truenos — mejor quedarse",
  Fog: "la ciudad con otro look",
  Clear: "noche ideal para bares",
};

interface WttrCondition {
  temp_C: string;
  weatherDesc: Array<{ value: string }>;
  humidity: string;
  windSpeed: string;
  weatherIconUrl: Array<{ value: string }>;
}

interface WttrResponse {
  current_condition: WttrCondition[];
}

export async function WeatherBadge() {
  let temp = "";
  let desc = "";
  let icon = "";
  let frase = "";

  try {
    const res = await fetch("https://wttr.in/Asuncion?format=j1", {
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;

    const data: WttrResponse = await res.json();
    const c = data.current_condition?.[0];
    if (!c) return null;

    temp = c.temp_C;
    desc = c.weatherDesc?.[0]?.value ?? "";
    icon = ICON_MAP[desc] ?? "🌡️";
    frase = FRASES[desc] ?? "";
  } catch {
    return null;
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-[#87867F] whitespace-nowrap" title={`${desc}, ${temp}°C`}>
      <span className="text-sm leading-none">{icon}</span>
      <span className="font-medium tabular-nums">{temp}°</span>
      {frase && <span className="hidden sm:inline text-[11px] text-[#B8B7B2]">· {frase}</span>}
    </span>
  );
}
