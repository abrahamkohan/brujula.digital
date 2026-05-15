// ============================================================
// Brújula Digital — Seed de la Guía de Asunción
// ============================================================
// Agrega los nuevos tipos y lugares de la guía sin tocar
// los registros existentes (shoppings de VP, gastronomía, etc.)
//
// Uso: npx tsx src/scripts/seed-guia.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SeedInput {
  tipo: string;
  name: string;
  zone: string;
  desc: string;
  direccion?: string;
  image?: string;
  url?: string;
  tipo_lugar?: string;
  horario?: string;
  badge?: string;
  stars?: number;
}

// ─── DATA — Nuevos tipos de la guía ────────────────────────────

const NEW_DATA: SeedInput[] = [
  // 🏛️ MUSEOS (13)
  { tipo: "museo", name: "Museo del Barro", zone: "ykua-sati", desc: "Museo de arte popular paraguayo. Cerámica, arte indígena y contemporáneo.", direccion: "Grabadores del Kabichu'i 001401, Ykua Sati", badge: "Imperdible", stars: 5 },
  { tipo: "museo", name: "Manzana de la Rivera", zone: "centro", desc: "Complejo cultural con museo, galerías y centro de eventos frente al Palacio de López.", direccion: "El Paraguayo Independiente 001012", badge: "Histórico", stars: 5 },
  { tipo: "museo", name: "Panteón Nacional de los Héroes", zone: "centro", desc: "Mausoleo de los héroes de la patria, en el centro histórico.", direccion: "Centro histórico" },
  { tipo: "museo", name: "Casa de la Independencia", zone: "centro", desc: "Casa histórica donde se gestó la independencia del Paraguay.", direccion: "14 de Mayo esq. Presidente Franco 001013", badge: "Histórico" },
  { tipo: "museo", name: "Centro Cultural El Cabildo", zone: "centro", desc: "Centro cultural y museo en el histórico edificio del Cabildo.", direccion: "Av. Stella Maris 001101" },
  { tipo: "museo", name: "Museo Nacional de Bellas Artes", zone: "centro", desc: "Colección de arte paraguayo e internacional.", direccion: "Eligio Ayala 1345" },
  { tipo: "museo", name: "Museo Ferroviario Estación Central", zone: "centro", desc: "Museo del ferrocarril en la histórica estación central.", direccion: "Eligio Ayala, cerca del centro" },
  { tipo: "museo", name: "Jardín Botánico de Asunción", zone: "otras", desc: "Jardín botánico con museo de historia natural.", direccion: "Av. Primer Presidente 001510" },
  { tipo: "museo", name: "Museo CONMEBOL", zone: "luque", desc: "Museo del fútbol sudamericano en la sede de la CONMEBOL.", direccion: "Avda. Sudamericana, Luque" },
  { tipo: "museo", name: "Museo de Arte Sacro", zone: "centro", desc: "Arte sacro colonial en el centro de Asunción.", direccion: "M Domínguez 001101" },
  { tipo: "museo", name: "Museo Etnográfico Andrés Barbero", zone: "centro", desc: "Museo etnográfico con colecciones indígenas.", direccion: "Av. España 217" },
  { tipo: "museo", name: "Museo de las Memorias", zone: "centro", desc: "Museo de la memoria histórica en la antigua prisión.", direccion: "Centro" },
  { tipo: "museo", name: "MUCI — Museo de Ciencias", zone: "otras", desc: "Museo interactivo de ciencias en el Complejo Textilia.", direccion: "Complejo Textilia" },

  // 🌳 PARQUES (8)
  { tipo: "parque", name: "Costanera de Asunción", zone: "centro", desc: "Paseo costanero frente al río Paraguay. Ideal para caminar, correr y atardeceres.", direccion: "Avda. Costanera", badge: "Imperdible", stars: 5 },
  { tipo: "parque", name: "Parque de la Salud", zone: "otras", desc: "Parque urbano con espacios verdes y actividades al aire libre." },
  { tipo: "parque", name: "Jardín Botánico y Zoológico", zone: "otras", desc: "Jardín botánico y zoológico de Asunción.", direccion: "Av. Primer Presidente 001510" },
  { tipo: "parque", name: "Plaza Uruguaya", zone: "centro", desc: "Plaza céntrica rodeada de edificios históricos." },
  { tipo: "parque", name: "Bahía de Asunción", zone: "centro", desc: "Bahía sobre el río Paraguay, parte de la Costanera." },
  { tipo: "parque", name: "Loma San Jerónimo", zone: "loma-san-jeronimo", desc: "Barrio histórico con calles coloridas y mirador.", badge: "Pintoresco" },
  { tipo: "parque", name: "Cerro Lambaré", zone: "otras", desc: "Mirador panorámico de Asunción en las afueras.", badge: "Vista panorámica" },
  { tipo: "parque", name: "Jardín Urbano", zone: "otras", desc: "Espacio verde urbano en Asunción." },

  // 🏛️ EDIFICIOS HISTÓRICOS (8)
  { tipo: "edificio", name: "Palacio de López", zone: "centro", desc: "Sede del gobierno paraguayo. Edificio emblemático frente a la Costanera.", direccion: "Centro, frente a la Costanera", badge: "Imperdible", stars: 5 },
  { tipo: "edificio", name: "Catedral Metropolitana", zone: "centro", desc: "Catedral de Asunción, ícono arquitectónico del centro." },
  { tipo: "edificio", name: "Calle Palma", zone: "centro", desc: "Peatonal comercial en el centro histórico." },
  { tipo: "edificio", name: "Mercado de la Recova", zone: "centro", desc: "Mercado artesanal en el centro histórico." },
  { tipo: "edificio", name: "Escalinata de Antequera", zone: "centro", desc: "Escalinata histórica en el centro." },
  { tipo: "edificio", name: "Plaza de la Democracia", zone: "centro", desc: "Plaza céntrica rodeada de edificios gubernamentales." },
  { tipo: "edificio", name: "Plaza Juan O'Leary", zone: "centro", desc: "Plaza en el microcentro de Asunción." },
  { tipo: "edificio", name: "Plaza de los Desaparecidos", zone: "centro", desc: "Plaza conmemorativa en el centro." },

  // ⚽ ESTADIOS (3)
  { tipo: "estadio", name: "Estadio La Nueva Olla", zone: "barrio-obrero", desc: "Estadio del Club Cerro Porteño. Uno de los más grandes del país.", tipo_lugar: "Fútbol" },
  { tipo: "estadio", name: "Estadio ueno Defensores del Chaco", zone: "otras", desc: "Estadio de la selección nacional de fútbol de Paraguay.", tipo_lugar: "Fútbol", badge: "Selección" },
  { tipo: "estadio", name: "Estadio ueno Osvaldo Domínguez Dibb", zone: "otras", desc: "Estadio del Club Olimpia.", tipo_lugar: "Fútbol" },

  // 🎭 TEATROS (adicionales que no están en la DB)
  { tipo: "teatro", name: "Gran Teatro del BCP", zone: "centro", desc: "Sala de convenciones del Banco Central del Paraguay. Espectáculos de primer nivel.", badge: "Premium" },
  { tipo: "teatro", name: "Sala La Correa", zone: "otras", desc: "Sala de teatro independiente.", direccion: "Prof. Dr. Luis Alberto Garcete & Don Bosco" },

  // 🏟️ VENUES (6)
  { tipo: "venue", name: "Jockey Club Paraguayo", zone: "villa-morra", desc: "Espacio multifuncional para eventos culturales y sociales." },
  { tipo: "venue", name: "SND Arena", zone: "luque", desc: "Arena multiusos para conciertos y eventos deportivos." },
  { tipo: "venue", name: "Arena Asunción", zone: "otras", desc: "Nuevo espacio para eventos masivos en Asunción." },
  { tipo: "venue", name: "Parque Olímpico del COP", zone: "otras", desc: "Parque olímpico del Comité Olímpico Paraguayo." },
  { tipo: "venue", name: "Puerto de Asunción", zone: "centro", desc: "Espacio para eventos al aire libre sobre la Costanera." },
  { tipo: "venue", name: "Anfiteatro José Asunción Flores", zone: "san-bernardino", desc: "Anfiteatro a orillas del lago en San Bernardino (a 45 min de Asunción)." },

  // 🎨 CENTROS CULTURALES (9)
  { tipo: "centro-cultural", name: "Centro Cultural de España (CCE)", zone: "centro", desc: "Centro cultural español con exposiciones, cine y eventos." },
  { tipo: "centro-cultural", name: "Alianza Francesa de Asunción", zone: "centro", desc: "Instituto cultural francés con cursos y eventos.", direccion: "Mcal. Estigarribia 1039" },
  { tipo: "centro-cultural", name: "Casa Bicentenario de las Artes Visuales", zone: "centro", desc: "Espacio dedicado a las artes visuales.", direccion: "Azara 845" },
  { tipo: "centro-cultural", name: "Espacio Cultural Itaú", zone: "centro", desc: "Centro cultural del Banco Itaú en el Puerto de Asunción." },
  { tipo: "centro-cultural", name: "Punto Divertido", zone: "loma-taruma", desc: "Centro de entretenimiento y cultura en Loma Tarumá." },
  { tipo: "centro-cultural", name: "Centro Cultural de la Facultad de Medicina", zone: "otras", desc: "Centro cultural universitario.", direccion: "Avda. Dr Montero y Dr. Mazzei" },
  { tipo: "centro-cultural", name: "Centro Cultural Paraguayo Americano (CCPA)", zone: "centro", desc: "Instituto cultural con teatro, biblioteca y cursos de inglés.", direccion: "José Berges 297" },
  { tipo: "centro-cultural", name: "ICPA — Goethe Zentrum", zone: "otras", desc: "Instituto cultural paraguayo-alemán." },
  { tipo: "centro-cultural", name: "Instituto Guimaraes Rosa", zone: "otras", desc: "Instituto cultural brasileño." },

  // 📚 LIBRERÍAS (2)
  { tipo: "libreria", name: "Librería Nicolás Guillén", zone: "centro", desc: "Librería con enfoque cultural y latinoamericano.", direccion: "Calle Oliva esq. O'Leary, Centro" },
  { tipo: "libreria", name: "Centro Cultural del Lago", zone: "aregua", desc: "Espacio cultural y librería en Areguá." },

  // 🏘️ BARRIOS / ZONAS (12)
  { tipo: "barrio-zona", name: "Villa Morra", zone: "villa-morra", desc: "Zona corporativa, comercial y residencial. Shopping del Sol, Paseo La Galería." },
  { tipo: "barrio-zona", name: "Carmelitas", zone: "carmelitas", desc: "Zona de bares, restaurantes y vida nocturna. Paseo Carmelitas." },
  { tipo: "barrio-zona", name: "Barrio Chacarita", zone: "barrio-chacarita", desc: "Barrio histórico junto a la Costanera. Calles coloridas y cultura." },
  { tipo: "barrio-zona", name: "Loma San Jerónimo", zone: "loma-san-jeronimo", desc: "Calles coloridas, arte callejero, bares con mirador." },
  { tipo: "barrio-zona", name: "Barrio Obrero", zone: "barrio-obrero", desc: "Barrio del Estadio Cerro Porteño (La Nueva Olla)." },
  { tipo: "barrio-zona", name: "Loma Tarumá", zone: "loma-taruma", desc: "Zona del Punto Divertido y espacios culturales." },
  { tipo: "barrio-zona", name: "Ykua Sati", zone: "ykua-sati", desc: "Zona del Museo del Barro." },
  { tipo: "barrio-zona", name: "Mariano Roque Alonso", zone: "mariano-roque-alonso", desc: "Ciudad cercana a Asunción. Centro de Convenciones." },
  { tipo: "barrio-zona", name: "Areguá", zone: "aregua", desc: "Ciudad cercana. Artesanía en cerámica, Centro Cultural del Lago." },
  { tipo: "barrio-zona", name: "Luque", zone: "luque", desc: "Ciudad cercana. Museo CONMEBOL, SND Arena, Pinedo Shopping." },
  { tipo: "barrio-zona", name: "San Bernardino", zone: "san-bernardino", desc: "Ciudad veraniega a orillas del lago. Anfiteatro." },
  { tipo: "barrio-zona", name: "Centro", zone: "centro", desc: "Centro histórico. Catedral, Palacio de López, Calle Palma, museos." },
];

// ─── Nuevos shoppings que no están en la DB ─────────────────────
const NEW_SHOPPINGS: SeedInput[] = [
  { tipo: "shopping", name: "Villa Morra Shopping", zone: "villa-morra", desc: "Centro comercial en pleno corazón de Villa Morra.", direccion: "Avda. Mcal. López y Senador Long", horario: "10:00 - 21:00", tipo_lugar: "Shopping" },
  { tipo: "shopping", name: "Paseo Carmelitas", zone: "carmelitas", desc: "Paseo comercial con bares, restaurantes y tiendas.", horario: "10:00 - 22:00", tipo_lugar: "Shopping" },
  { tipo: "shopping", name: "Nissei Asunción", zone: "centro", desc: "Tienda departamental japonesa en el centro.", horario: "09:00 - 20:00", tipo_lugar: "Shopping" },
  { tipo: "shopping", name: "Die Ecke", zone: "otras", desc: "Espacio comercial y cultural.", tipo_lugar: "Shopping" },
  { tipo: "shopping", name: "Felipa Home", zone: "otras", desc: "Tienda de decoración y hogar.", tipo_lugar: "Shopping" },
  { tipo: "shopping", name: "Mercado 4", zone: "centro", desc: "Mercado municipal tradicional. Compras económicas.", badge: "Típico", tipo_lugar: "Mercado" },
];

// ═══════════════════════════════════════════════════════════════

async function seed() {
  console.log("\n🌱 Agregando nuevos tipos a la Guía de Asunción...\n");

  // 1. Cargar nombres existentes por tipo para evitar duplicados
  const { data: existing } = await supabase
    .from("directorios")
    .select("tipo, name");

  const existingNames = new Set(
    (existing ?? []).map((d) => `${d.tipo}::${d.name.toLowerCase().trim()}`)
  );

  // 2. Filtrar solo los que no existen
  const allNew = [...NEW_DATA, ...NEW_SHOPPINGS];
  const toInsert = allNew.filter(
    (item) => !existingNames.has(`${item.tipo}::${item.name.toLowerCase().trim()}`)
  );

  const skipped = allNew.length - toInsert.length;
  console.log(`  📦 Total en data: ${allNew.length}`);
  console.log(`  ✅ Nuevos a insertar: ${toInsert.length}`);
  console.log(`  ⏭️  Ya existen (saltados): ${skipped}`);

  if (toInsert.length === 0) {
    console.log("\n  ✨ No hay nada nuevo que insertar.");
    return;
  }

  // 3. Insertar en batches
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);
    const { error } = await supabase.from("directorios").insert(
      batch.map((item) => ({
        tipo: item.tipo,
        name: item.name,
        descripcion: item.desc,
        zone: item.zone,
        image: item.image ?? "",
        url: item.url ?? `https://www.google.com/maps?q=${encodeURIComponent(item.name)}`,
        tipo_lugar: item.tipo_lugar ?? null,
        horario: item.horario ?? null,
        badge: item.badge ?? null,
        stars: item.stars ?? null,
        direccion: item.direccion ?? null,
        active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error(`  ❌ Error en batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors++;
    } else {
      inserted += batch.length;
      process.stdout.write(`  ✅ ${inserted}/${toInsert.length}\r`);
    }
  }

  // 4. Verificar
  const { data: final } = await supabase
    .from("directorios")
    .select("tipo");

  if (final) {
    const counts: Record<string, number> = {};
    final.forEach((d) => {
      counts[d.tipo] = (counts[d.tipo] || 0) + 1;
    });
    console.log("\n\n📊 Total en base:", final.length);
    console.log("\n📋 Por tipo:");
    for (const [tipo, count] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
      const isNew = tipo === "museo" || tipo === "parque" || tipo === "edificio" ||
                    tipo === "estadio" || tipo === "venue" || tipo === "centro-cultural" ||
                    tipo === "libreria" || tipo === "barrio-zona";
      console.log(`   ${isNew ? "🆕" : "  "} ${tipo}: ${count}`);
    }
    console.log(`\n   Insertados: ${inserted}`);
    console.log(`   Errores: ${errors}`);
  }
}

seed().catch(console.error);
