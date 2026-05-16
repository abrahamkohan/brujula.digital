// ============================================================
// Brújula Digital — Seed de itinerarios
// ============================================================
// Inserta los 4 itinerarios curados en Supabase.
//
// Uso: npx tsx src/scripts/seed-itinerarios.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Paso {
  lugar_nombre: string;
  lugar_url: string;
  tiempo_estimado: string;
  nota: string;
}

interface Itinerario {
  slug: string;
  titulo: string;
  descripcion: string;
  duracion_texto: string;
  imagen: string;
  activo: boolean;
  orden: number;
  pasos: Paso[];
}

const DATA: Itinerario[] = [
  {
    slug: "noche-barrio-mariscal",
    titulo: "Una noche en Barrio Mariscal",
    descripcion:
      "El barrio más vivo de Asunción después de las 19hs. Calles arboladas, restaurantes que no decepcionan y bares donde la noche se alarga sin apuro. Más de 20 negocios en pocas cuadras — todo a pie, todo en orden. Llevate el mapa y explorá.",
    duracion_texto: "3 horas (desde las 19hs)",
    imagen: "",
    activo: true,
    orden: 1,
    pasos: [
      {
        lugar_nombre: "Bajate el mapa",
        lugar_url:
          "https://barriomariscal.com/wp-content/uploads/2026/02/Mapa-Barrio-Mariscal_1.png",
        tiempo_estimado: "2 min antes de salir",
        nota: "Barrio Mariscal tiene su propio mapa con todos los locales marcados. Descargalo antes de salir y usalo de guía.",
      },
      {
        lugar_nombre: "Cena en La Cuadrita",
        lugar_url:
          "https://www.google.com/maps/search/La+Cuadrita+Asuncion+Paraguay",
        tiempo_estimado: "1.5 horas",
        nota: "La zona gastronómica del barrio — una cuadra con varios restaurantes lado a lado. Patria Parrilla para carne, Mozzafiato para pasta, Pez de Mar Dulce para pescado. Llegá sin reserva antes de las 20hs.",
      },
      {
        lugar_nombre: "Pintón Casa Bistró",
        lugar_url:
          "https://www.google.com/maps/search/Pinton+Casa+Bistro+Asuncion",
        tiempo_estimado: "1 hora",
        nota: "Cocina de autor, carta chica y bien pensada. El ambiente es de los mejores del barrio — luminoso, sin ruido de fondo.",
      },
      {
        lugar_nombre: "Bares del barrio",
        lugar_url: "https://barriomariscal.com",
        tiempo_estimado: "1 hora o más",
        nota: "Varios bares a poca distancia entre sí. Ideal para terminar caminando de uno al otro. Los jueves y viernes la energía es la mejor.",
      },
    ],
  },
  {
    slug: "manana-nu-guasu",
    titulo: "Mañana en el Parque Ñu Guasu",
    descripcion:
      "25 hectáreas de verde en el área metropolitana de Asunción. El parque donde los asuncenos van a correr, andar en bici, hacer ejercicio o simplemente existir sin ruido de ciudad. Llegá temprano, llevá agua y disfrutá el único pulmón verde grande que tiene la capital.",
    duracion_texto: "2 horas (mejor entre 7hs y 10hs)",
    imagen: "",
    activo: true,
    orden: 2,
    pasos: [
      {
        lugar_nombre: "Llegada y primera vuelta",
        lugar_url:
          "https://www.google.com/maps/search/Parque+Nu+Guasu+Luque+Paraguay",
        tiempo_estimado: "45 min",
        nota: "Pistas marcadas para correr y caminar alrededor de un lago artificial. Los domingos temprano hay más ambiente — familias, grupos de running, ciclistas.",
      },
      {
        lugar_nombre: "Lago y zonas verdes",
        lugar_url:
          "https://www.google.com/maps/search/Parque+Nu+Guasu+lago+Luque",
        tiempo_estimado: "30 min",
        nota: "El lago en el centro del parque es el punto de encuentro. Bancos y sombra alrededor. Juegos infantiles en este sector.",
      },
      {
        lugar_nombre: "Gimnasio al aire libre",
        lugar_url:
          "https://visitparaguay.travel/index.php/places/parque-nu-guasu",
        tiempo_estimado: "30 min",
        nota: "Canchas y equipamiento de ejercicio al aire libre sin costo. Bueno para complementar la corrida con algo de fuerza.",
      },
      {
        lugar_nombre: "Desayuno post-parque",
        lugar_url:
          "https://www.google.com/maps/search/cafes+desayuno+Luque+Paraguay",
        tiempo_estimado: "45 min",
        nota: "La zona de Luque tiene panaderías y cafés que abren temprano. O cruzás de vuelta a Asunción y desayunás en Villa Morra o Carmelitas.",
      },
    ],
  },
  {
    slug: "asuncion-en-un-dia",
    titulo: "Asunción en un día — el recorrido que no falla",
    descripcion:
      "500 años de historia, mercado popular, costanera y el mejor museo de arte del país — todo en un día. Sin tours, sin guías, sin apuro. Llegá a las 9hs y terminás con la puesta de sol sobre el río.",
    duracion_texto: "Un día completo (9hs a 18hs)",
    imagen: "",
    activo: true,
    orden: 3,
    pasos: [
      {
        lugar_nombre: "Palacio de López al amanecer",
        lugar_url:
          "https://www.google.com/maps/search/Palacio+de+Lopez+Asuncion",
        tiempo_estimado: "30 min",
        nota: "El símbolo de Asunción. Frente al río, con la bahía de fondo. Llegá antes de las 9:30hs para evitar los grupos escolares.",
      },
      {
        lugar_nombre: "Calle Palma y el Centro histórico",
        lugar_url:
          "https://www.google.com/maps/search/Calle+Palma+Asuncion+Paraguay",
        tiempo_estimado: "1 hora",
        nota: "Catedral, Casa de la Independencia, Panteón Nacional — todo en pocas cuadras a pie. Una calle viva con vendedores, chiperas y gente real.",
      },
      {
        lugar_nombre: "Manzana de la Rivera",
        lugar_url:
          "https://www.google.com/maps/search/Manzana+de+la+Rivera+Asuncion",
        tiempo_estimado: "45 min",
        nota: "Ocho casas históricas restauradas convertidas en museos. Entrada gratuita. El patio tiene buena sombra para el calor del mediodía.",
      },
      {
        lugar_nombre: "Almuerzo en Mercado 4",
        lugar_url:
          "https://www.google.com/maps/search/Mercado+4+Asuncion+Paraguay",
        tiempo_estimado: "1 hora",
        nota: "El mercado más auténtico de Asunción. Buscá los puestos del fondo — sopa paraguaya, chipa guazú y surubí frito. Comés bien por menos de 20.000 guaraníes.",
      },
      {
        lugar_nombre: "Costanera",
        lugar_url:
          "https://www.google.com/maps/search/Costanera+Asuncion+Paraguay",
        tiempo_estimado: "1 hora",
        nota: "El malecón renovado sobre el río Paraguay. Los fines de semana hay feria de artesanías. Entre semana está más tranquilo.",
      },
      {
        lugar_nombre: "Museo del Barro",
        lugar_url:
          "https://www.google.com/maps/search/Museo+del+Barro+Asuncion",
        tiempo_estimado: "1.5 horas",
        nota: "El mejor museo de arte paraguayo. Cerámica indígena, arte popular y contemporáneo. Tomá un taxi desde la costanera, son 15 minutos.",
      },
    ],
  },
  {
    slug: "finde-san-bernardino",
    titulo: "Finde en San Bernardino — el lago que engaña",
    descripcion:
      "A 50 km de Asunción hay un lago, una costanera y un ritmo de vida que hace que dos días parezcan una semana. Accesible, auténtico y con el mejor surubí a la parrilla del Paraguay. Salís el sábado, volvés el domingo descansado.",
    duracion_texto: "Fin de semana",
    imagen: "",
    activo: true,
    orden: 4,
    pasos: [
      {
        lugar_nombre: "Llegada y primer vistazo al lago",
        lugar_url:
          "https://www.google.com/maps/search/Costanera+San+Bernardino+Paraguay",
        tiempo_estimado: "1 hora",
        nota: "50 km por la Ruta 2, unos 45 minutos en auto. Bajá directo a la costanera. El Lago Ypacaraí no impresiona en foto — en persona sí.",
      },
      {
        lugar_nombre: "Lago Ypacaraí: agua o costanera",
        lugar_url:
          "https://www.google.com/maps/search/Lago+Ypacarai+San+Bernardino",
        tiempo_estimado: "2 horas",
        nota: "Podés alquilar kayaks o lanchas en la costanera. Si no querés mojarte, caminar por la orilla alcanza.",
      },
      {
        lugar_nombre: "Almuerzo de pescado frente al agua",
        lugar_url:
          "https://www.google.com/maps/search/restaurantes+pescado+San+Bernardino+Paraguay",
        tiempo_estimado: "1.5 horas",
        nota: "Los restaurantes frente al lago. Pedí el surubí a la parrilla — es el plato de la zona. Reservá en temporada alta.",
      },
      {
        lugar_nombre: "Casco histórico alemán",
        lugar_url:
          "https://www.google.com/maps/search/casco+historico+San+Bernardino+Paraguay",
        tiempo_estimado: "1 hora",
        nota: "San Bernardino fue fundada en 1881 por colonos alemanes. Casas de estilo europeo que sobrevivieron al tiempo. Una vuelta a pie que cambia la perspectiva del lugar.",
      },
      {
        lugar_nombre: "Atardecer en el lago",
        lugar_url:
          "https://www.google.com/maps/search/Lago+Ypacarai+San+Bernardino",
        tiempo_estimado: "1 hora",
        nota: "Llevá algo para tomar, buscá un banco en la costanera y mirá cómo el sol se mete detrás del lago. El momento que no se planifica.",
      },
      {
        lugar_nombre: "Domingo tranquilo, vuelta sin apuro",
        lugar_url:
          "https://www.google.com/maps/search/San+Bernardino+Paraguay",
        tiempo_estimado: "La mañana",
        nota: "Desayuná despacio y dalé una última vuelta. Salí antes del mediodía para evitar el tráfico de regreso a Asunción.",
      },
    ],
  },
];

async function main() {
  console.log("\n🗺️ Sembrando itinerarios...\n");

  for (const it of DATA) {
    const { data: existente } = await admin
      .from("itinerarios")
      .select("id")
      .eq("slug", it.slug)
      .single();

    if (existente) {
      console.log(`   ⏭️  Ya existe: ${it.titulo}`);
      continue;
    }

    const { data: itinerario, error } = await admin
      .from("itinerarios")
      .insert({
        slug: it.slug,
        titulo: it.titulo,
        descripcion: it.descripcion,
        duracion_texto: it.duracion_texto,
        imagen: it.imagen,
        activo: it.activo,
        orden: it.orden,
      })
      .select()
      .single();

    if (error) {
      console.log(`   ❌ Error creando "${it.titulo}": ${error.message}`);
      continue;
    }

    const pasos = it.pasos.map((p, i) => ({
      itinerario_id: itinerario.id,
      orden: i,
      lugar_nombre: p.lugar_nombre,
      lugar_url: p.lugar_url,
      tiempo_estimado: p.tiempo_estimado,
      nota: p.nota,
    }));

    const { error: pError } = await admin
      .from("itinerario_pasos")
      .insert(pasos);

    if (pError) {
      console.log(`   ⚠️ "${it.titulo}" creado pero pasos fallaron: ${pError.message}`);
    } else {
      console.log(`   ✅ ${it.titulo} (${it.pasos.length} pasos)`);
    }
  }

  console.log("\n📊 Verificación:");
  const { data: todos } = await admin.from("itinerarios").select("id, titulo, slug");
  console.log(`   Total itinerarios: ${todos?.length ?? 0}`);
  for (const t of todos ?? []) {
    const { count } = await admin
      .from("itinerario_pasos")
      .select("id", { count: "exact", head: true })
      .eq("itinerario_id", t.id);
    console.log(`   · ${t.titulo} (${count} pasos)`);
  }
}

main().catch(console.error);
