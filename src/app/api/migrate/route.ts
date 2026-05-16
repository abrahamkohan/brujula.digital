// ─── Crea tablas y seedea itinerarios ─────────────────────────
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ITINERARIOS = [
  {
    slug: "noche-barrio-mariscal",
    titulo: "Una noche en Barrio Mariscal",
    descripcion: "El barrio más vivo de Asunción después de las 19hs. Calles arboladas, restaurantes que no decepcionan y bares donde la noche se alarga sin apuro.",
    duracion_texto: "3 horas (desde las 19hs)",
    orden: 1,
    pasos: [
      { orden: 0, lugar_nombre: "Bajate el mapa", lugar_url: "https://barriomariscal.com/wp-content/uploads/2026/02/Mapa-Barrio-Mariscal_1.png", tiempo_estimado: "2 min antes de salir", nota: "Barrio Mariscal tiene su propio mapa con todos los locales marcados. Descargalo antes de salir." },
      { orden: 1, lugar_nombre: "Cena en La Cuadrita", lugar_url: "https://www.google.com/maps/search/La+Cuadrita+Asuncion+Paraguay", tiempo_estimado: "1.5 horas", nota: "Patria Parrilla para carne, Mozzafiato para pasta, Pez de Mar Dulce para pescado. Llegá sin reserva antes de las 20hs." },
      { orden: 2, lugar_nombre: "Pintón Casa Bistró", lugar_url: "https://www.google.com/maps/search/Pinton+Casa+Bistro+Asuncion", tiempo_estimado: "1 hora", nota: "Cocina de autor, carta chica. El ambiente es de los mejores del barrio." },
      { orden: 3, lugar_nombre: "Bares del barrio", lugar_url: "https://barriomariscal.com", tiempo_estimado: "1 hora o más", nota: "Varios bares a poca distancia. Los jueves y viernes la energía es la mejor." },
    ],
  },
  {
    slug: "manana-nu-guasu",
    titulo: "Mañana en el Parque Ñu Guasu",
    descripcion: "25 hectáreas de verde en el área metropolitana de Asunción. El parque donde los asuncenos van a correr, andar en bici o simplemente existir sin ruido.",
    duracion_texto: "2 horas (mejor entre 7hs y 10hs)",
    orden: 2,
    pasos: [
      { orden: 0, lugar_nombre: "Llegada y primera vuelta", lugar_url: "https://www.google.com/maps/search/Parque+Nu+Guasu+Luque+Paraguay", tiempo_estimado: "45 min", nota: "Pistas marcadas alrededor de un lago artificial. Los domingos temprano hay mejor ambiente." },
      { orden: 1, lugar_nombre: "Lago y zonas verdes", lugar_url: "https://www.google.com/maps/search/Parque+Nu+Guasu+lago+Luque", tiempo_estimado: "30 min", nota: "Bancos y sombra alrededor del lago. Juegos infantiles en este sector." },
      { orden: 2, lugar_nombre: "Gimnasio al aire libre", lugar_url: "https://visitparaguay.travel/index.php/places/parque-nu-guasu", tiempo_estimado: "30 min", nota: "Canchas y equipamiento sin costo." },
      { orden: 3, lugar_nombre: "Desayuno post-parque", lugar_url: "https://www.google.com/maps/search/cafes+desayuno+Luque+Paraguay", tiempo_estimado: "45 min", nota: "Panaderías y cafés en Luque. O volvés a Villa Morra o Carmelitas." },
    ],
  },
  {
    slug: "asuncion-en-un-dia",
    titulo: "Asunción en un día — el recorrido que no falla",
    descripcion: "500 años de historia, mercado popular, costanera y el mejor museo de arte del país — todo en un día. Sin tours, sin guías, sin apuro.",
    duracion_texto: "Un día completo (9hs a 18hs)",
    orden: 3,
    pasos: [
      { orden: 0, lugar_nombre: "Palacio de López al amanecer", lugar_url: "https://www.google.com/maps/search/Palacio+de+Lopez+Asuncion", tiempo_estimado: "30 min", nota: "El símbolo de Asunción. Llegá antes de las 9:30hs." },
      { orden: 1, lugar_nombre: "Calle Palma y el Centro histórico", lugar_url: "https://www.google.com/maps/search/Calle+Palma+Asuncion+Paraguay", tiempo_estimado: "1 hora", nota: "Catedral, Casa de la Independencia, Panteón Nacional. Una calle viva." },
      { orden: 2, lugar_nombre: "Manzana de la Rivera", lugar_url: "https://www.google.com/maps/search/Manzana+de+la+Rivera+Asuncion", tiempo_estimado: "45 min", nota: "Ocho casas históricas. Entrada gratuita." },
      { orden: 3, lugar_nombre: "Almuerzo en Mercado 4", lugar_url: "https://www.google.com/maps/search/Mercado+4+Asuncion+Paraguay", tiempo_estimado: "1 hora", nota: "Sopa paraguaya, chipa guazú y surubí frito por menos de 20.000 Gs." },
      { orden: 4, lugar_nombre: "Costanera", lugar_url: "https://www.google.com/maps/search/Costanera+Asuncion+Paraguay", tiempo_estimado: "1 hora", nota: "Malecón renovado sobre el río. Fines de semana hay feria de artesanías." },
      { orden: 5, lugar_nombre: "Museo del Barro", lugar_url: "https://www.google.com/maps/search/Museo+del+Barro+Asuncion", tiempo_estimado: "1.5 horas", nota: "El mejor museo de arte paraguayo. Tomá un taxi desde la costanera." },
    ],
  },
  {
    slug: "finde-san-bernardino",
    titulo: "Finde en San Bernardino — el lago que engaña",
    descripcion: "A 50 km de Asunción hay un lago, una costanera y un ritmo de vida que hace que dos días parezcan una semana.",
    duracion_texto: "Fin de semana",
    orden: 4,
    pasos: [
      { orden: 0, lugar_nombre: "Llegada y primer vistazo al lago", lugar_url: "https://www.google.com/maps/search/Costanera+San+Bernardino+Paraguay", tiempo_estimado: "1 hora", nota: "45 min en auto. Bajá directo a la costanera." },
      { orden: 1, lugar_nombre: "Lago Ypacaraí", lugar_url: "https://www.google.com/maps/search/Lago+Ypacarai+San+Bernardino", tiempo_estimado: "2 horas", nota: "Kayaks o lanchas en la costanera." },
      { orden: 2, lugar_nombre: "Almuerzo de pescado frente al agua", lugar_url: "https://www.google.com/maps/search/restaurantes+pescado+San+Bernardino+Paraguay", tiempo_estimado: "1.5 horas", nota: "Surubí a la parrilla. Reservá en temporada alta." },
      { orden: 3, lugar_nombre: "Casco histórico alemán", lugar_url: "https://www.google.com/maps/search/casco+historico+San+Bernardino+Paraguay", tiempo_estimado: "1 hora", nota: "Casas de estilo europeo de 1881. Una vuelta a pie que vale la pena." },
      { orden: 4, lugar_nombre: "Atardecer en el lago", lugar_url: "https://www.google.com/maps/search/Lago+Ypacarai+San+Bernardino", tiempo_estimado: "1 hora", nota: "El sol metiéndose detrás del lago. El momento que no se planifica." },
      { orden: 5, lugar_nombre: "Domingo tranquilo", lugar_url: "https://www.google.com/maps/search/San+Bernardino+Paraguay", tiempo_estimado: "La mañana", nota: "Desayuná despacio. Salí antes del mediodía." },
    ],
  },
];

export async function GET() {
  const start = Date.now();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const log: string[] = [];
  let created = false;

  // 1. Verificar si las tablas existen, si no → crearlas
  const { error: checkError } = await supabase.from("itinerarios").select("id").limit(1);
  if (checkError?.message?.includes("relation") || checkError?.message?.includes("does not exist")) {
    log.push("Tabla no existe. Intentando refresh de schema cache...");
    
    // Force schema cache refresh by querying information_schema
    // (this triggers PostgREST to reload)
    const { error: schemaErr } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "itinerarios");
    
    log.push(`Schema check: ${schemaErr?.message || "OK"}`);
    
    // Try direct insert again
    const { error: retryError } = await supabase.from("itinerarios").select("id").limit(1);
    if (retryError?.message?.includes("relation") || retryError?.message?.includes("does not exist")) {
      log.push("Tabla realmente no existe.");
      return NextResponse.json({ status: "error", message: "Las tablas no existen en Supabase. Usá el SQL Editor del dashboard para crear las tablas.", log });
    }
  }

  log.push("Tablas OK");

  // 2. Insertar itinerarios
  let insertados = 0;
  for (const it of ITINERARIOS) {
    const { data: existente } = await supabase.from("itinerarios").select("id").eq("slug", it.slug).maybeSingle();
    if (existente) {
      log.push(`⏭️ Ya existe: ${it.titulo}`);
      continue;
    }

    const { data: itinerario, error: err } = await supabase
      .from("itinerarios")
      .insert({
        slug: it.slug, titulo: it.titulo, descripcion: it.descripcion,
        duracion_texto: it.duracion_texto, orden: it.orden, activo: true,
      })
      .select()
      .single();

    if (err) {
      log.push(`❌ ${it.titulo}: ${err.message}`);
      continue;
    }

    const { error: pErr } = await supabase.from("itinerario_pasos").insert(
      it.pasos.map((p) => ({ ...p, itinerario_id: itinerario.id }))
    );

    log.push(pErr ? `⚠️ ${it.titulo} creado pero pasos fallaron: ${pErr.message}` : `✅ ${it.titulo} (${it.pasos.length} pasos)`);
    insertados++;
  }

  log.push(`⏱️ ${((Date.now() - start) / 1000).toFixed(1)}s`);
  log.push(`✅ ${insertados} itinerarios insertados`);

  return NextResponse.json({ status: "ok", log });
}
