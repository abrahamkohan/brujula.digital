// ============================================================
// Brújula Digital — Limpieza de hoteles duplicados y fuera
// de la Gran Asunción
// ============================================================
// Corrección: elimina duplicados, desactiva no-hoteles y
// hoteles fuera del radio, asigna zonas correctas.
//
// Uso: npx tsx src/scripts/cleanup-hoteles.ts
// ============================================================

import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hoteles que NO son hoteles o están fuera de Gran Asunción → desactivar
const NO_VALIDOS = [
  "VER VIDEO", "mv2", "Walkin App", "Americana Edu", "Ghmlatam",
  "All Accor", "Ihg",
  "Dazzlerciudaddeleste", "Hotelcasinoacaray", "Hotelfloridachaco",
  "Carmeloperaltahotelpantanalinn", "Hotel Ybytyruzu Negocio Site",
  "Granjahotel", "Hotelstaufenberg", "Awaresort", "Loslagos",
  "Lasventanas", "Carnavalhotelcasino", "Altagraciahotel", "Vatel",
  "7saltos",
];

// Zonas corregidas para hoteles reales
const ZONAS: Record<string, string> = {
  "Dazzler Asunción": "villa-morra",
  "Esplendor by Wyndham": "villa-morra",
  "Sheraton Asunción": "carmelitas",
  "Holiday Inn Express": "carmelitas",
  "Hotel Terranova": "carmelitas",
  "NH Asunción": "centro",
  "La Misión Hotel Boutique": "centro",
  "Granados Park Hotel": "centro",
  "Hotel Croquignole": "centro",
  "Hotel Aristón": "centro",
  "Hotel Ceasar Palace": "villa-morra",
  "Gran Hotel del Paraguay": "centro",
  "Hotel Palmaroga": "centro",
  "Arthaus Hotel": "las-mercedes",
  "Paseo La Galería Hotel": "villa-morra",
  "Westfalenhaus": "carmelitas",
  "Paramanta Hotel": "otras",
  "Las Lomas Casa Hotel": "villa-morra",
  "Aloft Asunción": "carmelitas",
  "Dannieri Hotel": "otras",
  "Hub Hotel": "carmelitas",
  "Hotel Guaraní": "centro",
  "Hotel Pantanal Inn": "luque",
  "Bourbon CONMEBOL Convention Hotel": "luque",
  "Gran Hotel Armele": "villa-morra",
  "Rochester Hotel Five Paraguay": "villa-morra",
};

// Mapeo de nombres feos → nombres correctos (los que vinieron del dominio)
const RENAME: Record<string, string> = {
  "Dazzlerasuncion": "Dazzler Asunción",
  "Esplendorasuncion": "Esplendor by Wyndham",
  "Lamision": "La Misión Hotel Boutique",
  "Paseolagaleriahotel": "Paseo La Galería Hotel",
  "Aloft Asuncionhotelspage": "Aloft Asunción",
  "Danierihotel": "Dannieri Hotel",
  "Hotelpantanalinn": "Hotel Pantanal Inn",
  "Hotelguarani": "Hotel Guaraní",
  "Hubhotel": "Hub Hotel",
  "Laslomascasahotel": "Las Lomas Casa Hotel",
  "Palmaroga": "Hotel Palmaroga",
  "Paramantahotel": "Paramanta Hotel",
  "Bourbon Br": "Bourbon CONMEBOL Convention Hotel",
  "Granhotelarmele": "Gran Hotel Armele",
  "Granhoteldelparaguay": "Gran Hotel del Paraguay",
  "Rochester Hotel": "Rochester Hotel Five Paraguay",
  "Arthaushotel": "Arthaus Hotel",
  "Westfalenhaus": "Westfalenhaus",
  "Lacandelariahotel": "La Candelaria Hotel",
};

async function main() {
  console.log("\n🏨 Limpieza de hoteles...\n");

  const { data: hoteles } = await admin
    .from("directorios")
    .select("id, name, zone, active, tipo")
    .eq("tipo", "hotel");

  if (!hoteles) return console.log("Error al cargar hoteles");
  console.log(`   Total: ${hoteles.length}\n`);

  // 1. Desactivar no válidos
  let desactivados = 0;
  for (const h of hoteles) {
    if (NO_VALIDOS.includes(h.name)) {
      await admin.from("directorios").update({ active: false }).eq("id", h.id);
      console.log(`   🔴 Desactivado: ${h.name}`);
      desactivados++;
    }
  }

  // 2. Renombrar y corregir zonas
  let corregidos = 0;
  for (const h of hoteles) {
    const nuevoNombre = RENAME[h.name];
    const nuevaZona = ZONAS[nuevoNombre || h.name];

    if (nuevoNombre || nuevaZona) {
      const updates: Record<string, string> = {};
      if (nuevoNombre) updates.name = nuevoNombre;
      if (nuevaZona) updates.zone = nuevaZona;
      await admin.from("directorios").update(updates).eq("id", h.id);
      console.log(`   🟡 Corregido: ${h.name} → ${nuevoNombre || "(sin cambio)"} | zona: ${nuevaZona || "(sin cambio)"}`);
      corregidos++;
    }
  }

  // 3. Eliminar duplicados (mismo nombre después de renombrar)
  const { data: actualizados } = await admin
    .from("directorios")
    .select("id, name, zone, active")
    .eq("tipo", "hotel");

  if (actualizados) {
    const vistos = new Map<string, typeof actualizados[0]>();
    let eliminados = 0;
    for (const h of actualizados) {
      const key = h.name.toLowerCase().trim();
      if (vistos.has(key)) {
        // Conservar el que está activo o tiene más datos
        const existente = vistos.get(key)!;
        if (h.active && !existente.active) {
          // El actual está activo, el existente no → eliminar existente
          await admin.from("directorios").delete().eq("id", existente.id);
          vistos.set(key, h);
          console.log(`   🗑️ Eliminado duplicado: ${existente.name} (${existente.id.slice(0, 8)})`);
        } else {
          await admin.from("directorios").delete().eq("id", h.id);
          console.log(`   🗑️ Eliminado duplicado: ${h.name} (${h.id.slice(0, 8)})`);
        }
        eliminados++;
      } else {
        vistos.set(key, h);
      }
    }
    console.log(`   🗑️ Duplicados eliminados: ${eliminados}`);
  }

  // 4. Verificar final
  const { data: final } = await admin
    .from("directorios")
    .select("id, name, zone, active")
    .eq("tipo", "hotel");

  if (final) {
    const activos = final.filter((h) => h.active);
    console.log(`\n📊 Resultado:`);
    console.log(`   🔴 Desactivados: ${desactivados}`);
    console.log(`   🟡 Corregidos:   ${corregidos}`);
    console.log(`   🟢 Activos:      ${activos.length}`);
    console.log(`   Total:           ${final.length}`);
    console.log("\n   Hoteles activos:");
    for (const h of activos.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`      ${h.name} (${h.zone})`);
    }
  }
}

main().catch(console.error);
