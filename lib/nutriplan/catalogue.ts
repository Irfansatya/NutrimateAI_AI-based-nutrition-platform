import "server-only";

/**
 * NutriPlan server-side food catalogue.
 *
 * Derived from the client-side FOOD_DB mock in lib/dashboard/mockData.ts.
 * Prices and nutrition values are ESTIMATES — not from a verified source.
 * Each item has a stable string ID used as the exchange unit with Gemini.
 */

export interface CatalogueItem {
  /** Stable ID for Gemini exchange. Format: group_key_slug. */
  id: string;
  /** Food group: pokok | ph | pn | sy | bh | su */
  group: string;
  /** Display name */
  name: string;
  /** Adult portion description */
  portion: string;
  /** Child/toddler portion description */
  portionChild: string;
  /** Estimated cost in IDR (adult portion) */
  costIDR: number;
  /** Estimated cost in IDR (child portion) */
  costChildIDR: number;
  /** Estimated kcal (adult portion) */
  kcal: number;
  /** Estimated protein g (adult portion) */
  proteinG: number;
  /** Estimated carbs g (adult portion) */
  carbsG: number;
  /** Estimated fat g (adult portion) */
  fatG: number;
  /** Micronutrient summary */
  micronutrients: string;
  /** Nutritional benefit note */
  benefit: string;
  /** Allergen tags (empty = no known allergen in catalogue data) */
  allergens: string[];
}

/** Allowed meal slot IDs exactly matching MEAL_SLOTS in mockData.ts */
export const MEAL_SLOT_IDS = ["06:30", "10:00", "12:30", "16:00", "19:00"] as const;
export type MealSlotTime = typeof MEAL_SLOT_IDS[number];

export const MEAL_SLOTS_META: { time: MealSlotTime; label: string; groups: string[] }[] = [
  { time: "06:30", label: "Sarapan",       groups: ["pokok", "ph_or_pn", "bh_or_su"] },
  { time: "10:00", label: "Selingan pagi", groups: ["bh", "su_or_pn"] },
  { time: "12:30", label: "Makan siang",   groups: ["pokok", "ph_or_pn", "sy"] },
  { time: "16:00", label: "Selingan sore", groups: ["pn_or_bh", "bh_or_su"] },
  { time: "19:00", label: "Makan malam",   groups: ["pokok", "ph_or_pn", "sy"] },
];

// ---------------------------------------------------------------------------
// Item definitions — one per catalogue entry, stable IDs
// ---------------------------------------------------------------------------

const CATALOGUE: CatalogueItem[] = [
  // ---- POKOK (staple carbs) ----
  {
    id: "pokok_nasi_putih", group: "pokok", name: "Nasi putih",
    portion: "1 centong (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3,
    micronutrients: "Energi bertahap", benefit: "Sumber energi utama untuk aktivitas harian dan tumbuh kembang.",
    allergens: [],
  },
  {
    id: "pokok_jagung_rebus", group: "pokok", name: "Jagung rebus",
    portion: "1 tongkol kecil (100 g)", portionChild: "½ tongkol kecil (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 96, proteinG: 3.4, carbsG: 21, fatG: 1.5,
    micronutrients: "Serat 2,4 g", benefit: "Serat membantu pencernaan dan membuat kenyang lebih lama.",
    allergens: [],
  },
  {
    id: "pokok_singkong_rebus", group: "pokok", name: "Singkong rebus",
    portion: "1 potong sedang (100 g)", portionChild: "1 potong kecil (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 160, proteinG: 1.4, carbsG: 38, fatG: 0.3,
    micronutrients: "Vitamin C", benefit: "Karbohidrat kompleks sebagai sumber energi pengganti nasi.",
    allergens: [],
  },
  {
    id: "pokok_ubi_jalar_rebus", group: "pokok", name: "Ubi jalar rebus",
    portion: "1 buah sedang (100 g)", portionChild: "½ buah kecil (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 86, proteinG: 1.6, carbsG: 20, fatG: 0.1,
    micronutrients: "Vitamin A tinggi", benefit: "Vitamin A mendukung penglihatan dan daya tahan tubuh.",
    allergens: [],
  },
  {
    id: "pokok_kentang_rebus", group: "pokok", name: "Kentang rebus",
    portion: "1 buah sedang (100 g)", portionChild: "½ buah kecil (50 g)",
    costIDR: 2500, costChildIDR: 1500,
    kcal: 87, proteinG: 1.9, carbsG: 20, fatG: 0.1,
    micronutrients: "Kalium 379 mg", benefit: "Kalium membantu menjaga keseimbangan cairan tubuh.",
    allergens: [],
  },

  // ---- PH (animal protein) ----
  {
    id: "ph_telur_ayam", group: "ph", name: "Telur ayam",
    portion: "1 butir rebus (50 g)", portionChild: "½ butir (25 g)",
    costIDR: 2500, costChildIDR: 1500,
    kcal: 77, proteinG: 6.3, carbsG: 0.6, fatG: 5.3,
    micronutrients: "Kolin & vitamin B12", benefit: "Protein lengkap dan kolin mendukung perkembangan otak.",
    allergens: ["Telur"],
  },
  {
    id: "ph_ayam_tanpa_kulit", group: "ph", name: "Ayam tanpa kulit",
    portion: "1 potong sedang (75 g)", portionChild: "1 potong kecil (40 g)",
    costIDR: 4500, costChildIDR: 2700,
    kcal: 124, proteinG: 23, carbsG: 0, fatG: 2.7,
    micronutrients: "Vitamin B6 & niasin", benefit: "Protein berkualitas membantu pertumbuhan dan perbaikan jaringan.",
    allergens: [],
  },
  {
    id: "ph_ikan_kembung", group: "ph", name: "Ikan kembung",
    portion: "1 ekor kecil (80 g)", portionChild: "½ ekor kecil (40 g)",
    costIDR: 4000, costChildIDR: 2400,
    kcal: 83, proteinG: 17.6, carbsG: 0, fatG: 1.4,
    micronutrients: "Omega-3 & kalsium", benefit: "Omega-3 mendukung perkembangan otak dan mata.",
    allergens: ["Seafood"],
  },
  {
    id: "ph_ikan_lele", group: "ph", name: "Ikan lele",
    portion: "1 potong sedang (80 g)", portionChild: "1 potong kecil (40 g)",
    costIDR: 3500, costChildIDR: 2100,
    kcal: 96, proteinG: 14.4, carbsG: 0, fatG: 4,
    micronutrients: "Fosfor & vitamin B12", benefit: "Sumber protein terjangkau dengan lemak sehat.",
    allergens: ["Seafood"],
  },
  {
    id: "ph_daging_sapi", group: "ph", name: "Daging sapi",
    portion: "1 potong kecil (60 g)", portionChild: "1 potong kecil (30 g)",
    costIDR: 9000, costChildIDR: 5400,
    kcal: 120, proteinG: 15.6, carbsG: 0, fatG: 6,
    micronutrients: "Zat besi 1,6 mg & seng", benefit: "Zat besi heme mudah diserap dan membantu pembentukan sel darah merah.",
    allergens: [],
  },
  {
    id: "ph_hati_ayam", group: "ph", name: "Hati ayam",
    portion: "1 potong (40 g)", portionChild: "1 potong kecil (20 g)",
    costIDR: 2500, costChildIDR: 1500,
    kcal: 66, proteinG: 10, carbsG: 0.4, fatG: 2.5,
    micronutrients: "Zat besi 3,3 mg & vitamin A", benefit: "Sumber zat besi dan vitamin A.",
    allergens: [],
  },
  {
    id: "ph_udang", group: "ph", name: "Udang",
    portion: "5 ekor sedang (60 g)", portionChild: "2–3 ekor (30 g)",
    costIDR: 7000, costChildIDR: 4200,
    kcal: 60, proteinG: 12, carbsG: 0.3, fatG: 0.9,
    micronutrients: "Yodium & selenium", benefit: "Protein rendah lemak dengan mineral untuk metabolisme tubuh.",
    allergens: ["Seafood"],
  },

  // ---- PN (plant protein) ----
  {
    id: "pn_tahu_putih", group: "pn", name: "Tahu putih",
    portion: "2 potong sedang (100 g)", portionChild: "1 potong sedang (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8,
    micronutrients: "Kalsium", benefit: "Protein nabati dan kalsium untuk tulang dan gigi.",
    allergens: [],
  },
  {
    id: "pn_tempe_kedelai", group: "pn", name: "Tempe kedelai",
    portion: "2 potong sedang (75 g)", portionChild: "1 potong kecil (35 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 150, proteinG: 14.3, carbsG: 6.8, fatG: 8,
    micronutrients: "Zat besi 2 mg & probiotik", benefit: "Hasil fermentasi yang mudah dicerna dan kaya protein nabati.",
    allergens: [],
  },
  {
    id: "pn_kacang_hijau", group: "pn", name: "Bubur kacang hijau",
    portion: "1 mangkuk kecil (30 g kering)", portionChild: "3 sdm (15 g kering)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 104, proteinG: 7, carbsG: 18, fatG: 0.4,
    micronutrients: "Folat & serat", benefit: "Folat dan serat mendukung pembentukan sel.",
    allergens: ["Kacang"],
  },
  {
    id: "pn_kacang_merah", group: "pn", name: "Kacang merah rebus",
    portion: "3 sdm (50 g)", portionChild: "1,5 sdm (25 g)",
    costIDR: 3000, costChildIDR: 1800,
    kcal: 63, proteinG: 4.3, carbsG: 11, fatG: 0.2,
    micronutrients: "Zat besi & serat", benefit: "Protein nabati dan zat besi pelengkap menu harian.",
    allergens: ["Kacang"],
  },

  // ---- SY (vegetables) ----
  {
    id: "sy_bayam", group: "sy", name: "Bayam",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4,
    micronutrients: "Folat & zat besi", benefit: "Folat dan zat besi penting untuk pembentukan sel darah.",
    allergens: [],
  },
  {
    id: "sy_kangkung", group: "sy", name: "Kangkung",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 19, proteinG: 2.6, carbsG: 3.1, fatG: 0.2,
    micronutrients: "Vitamin A & zat besi", benefit: "Kaya vitamin A dan zat besi nabati.",
    allergens: [],
  },
  {
    id: "sy_wortel", group: "sy", name: "Wortel",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2,
    micronutrients: "Beta-karoten", benefit: "Beta-karoten diubah tubuh menjadi vitamin A untuk mata dan imunitas.",
    allergens: [],
  },
  {
    id: "sy_brokoli", group: "sy", name: "Brokoli",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 4000, costChildIDR: 2400,
    kcal: 34, proteinG: 2.8, carbsG: 6.6, fatG: 0.4,
    micronutrients: "Vitamin C 89 mg", benefit: "Vitamin C membantu penyerapan zat besi dan daya tahan tubuh.",
    allergens: [],
  },
  {
    id: "sy_bayam_merah", group: "sy", name: "Bayam merah",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 26, proteinG: 1.9, carbsG: 4.9, fatG: 0.3,
    micronutrients: "Antosianin & zat besi", benefit: "Kaya zat besi dan antioksidan dari pigmen merah.",
    allergens: [],
  },
  {
    id: "sy_labu_kuning", group: "sy", name: "Labu kuning",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 26, proteinG: 1, carbsG: 6.5, fatG: 0.1,
    micronutrients: "Vitamin A", benefit: "Vitamin A dengan tekstur lembut yang cocok untuk berbagai usia.",
    allergens: [],
  },
  {
    id: "sy_sawi_hijau", group: "sy", name: "Sawi hijau",
    portion: "1 mangkuk sayur matang (100 g)", portionChild: "3–4 sdm (50 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 13, proteinG: 1.5, carbsG: 2.2, fatG: 0.2,
    micronutrients: "Vitamin K & kalsium", benefit: "Vitamin K dan kalsium mendukung kesehatan tulang.",
    allergens: [],
  },
  {
    id: "sy_daun_kelor", group: "sy", name: "Daun kelor",
    portion: "½ mangkuk (50 g)", portionChild: "2 sdm (25 g)",
    costIDR: 1500, costChildIDR: 900,
    kcal: 32, proteinG: 4.7, carbsG: 4.2, fatG: 0.7,
    micronutrients: "Kalsium & zat besi", benefit: "Kaya zat besi dan kalsium untuk ibu maupun tumbuh kembang anak.",
    allergens: [],
  },

  // ---- BH (fruits) ----
  {
    id: "bh_pisang", group: "bh", name: "Pisang",
    portion: "1 buah sedang (100 g)", portionChild: "½ buah (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3,
    micronutrients: "Kalium 358 mg", benefit: "Memberi energi cepat dan kalium untuk otot dan saraf.",
    allergens: [],
  },
  {
    id: "bh_pepaya", group: "bh", name: "Pepaya",
    portion: "1 potong (100 g)", portionChild: "1 potong kecil (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 43, proteinG: 0.5, carbsG: 11, fatG: 0.3,
    micronutrients: "Vitamin C 61 mg", benefit: "Vitamin C membantu penyerapan zat besi.",
    allergens: [],
  },
  {
    id: "bh_jeruk_manis", group: "bh", name: "Jeruk manis",
    portion: "1 buah sedang (100 g)", portionChild: "½ buah (50 g)",
    costIDR: 3000, costChildIDR: 1800,
    kcal: 47, proteinG: 0.9, carbsG: 12, fatG: 0.1,
    micronutrients: "Vitamin C 53 mg", benefit: "Vitamin C mendukung daya tahan tubuh.",
    allergens: [],
  },
  {
    id: "bh_alpukat", group: "bh", name: "Alpukat",
    portion: "½ buah (70 g)", portionChild: "2–3 sdm (30 g)",
    costIDR: 4000, costChildIDR: 2400,
    kcal: 112, proteinG: 1.4, carbsG: 6, fatG: 10.3,
    micronutrients: "Lemak tak jenuh & folat", benefit: "Lemak sehat membantu penyerapan vitamin larut lemak.",
    allergens: [],
  },
  {
    id: "bh_mangga", group: "bh", name: "Mangga",
    portion: "1 buah kecil (100 g)", portionChild: "½ buah kecil (50 g)",
    costIDR: 3000, costChildIDR: 1800,
    kcal: 60, proteinG: 0.8, carbsG: 15, fatG: 0.4,
    micronutrients: "Vitamin A & C", benefit: "Vitamin A dan C mendukung imunitas.",
    allergens: [],
  },
  {
    id: "bh_jambu_biji", group: "bh", name: "Jambu biji",
    portion: "1 buah sedang (100 g)", portionChild: "½ buah (50 g)",
    costIDR: 2000, costChildIDR: 1200,
    kcal: 68, proteinG: 2.6, carbsG: 14, fatG: 1,
    micronutrients: "Vitamin C 228 mg", benefit: "Sangat kaya vitamin C.",
    allergens: [],
  },

  // ---- SU (dairy/milk) ----
  {
    id: "su_susu_sapi", group: "su", name: "Susu sapi",
    portion: "1 gelas (200 ml)", portionChild: "½ gelas (100 ml)",
    costIDR: 3500, costChildIDR: 2100,
    kcal: 122, proteinG: 6.4, carbsG: 9.6, fatG: 6.6,
    micronutrients: "Kalsium 240 mg", benefit: "Kalsium mendukung kesehatan tulang dan gigi.",
    allergens: ["Susu sapi", "Intoleransi laktosa"],
  },
  {
    id: "su_susu_kedelai", group: "su", name: "Susu kedelai",
    portion: "1 gelas (200 ml)", portionChild: "½ gelas (100 ml)",
    costIDR: 3000, costChildIDR: 1800,
    kcal: 80, proteinG: 6.6, carbsG: 4, fatG: 4,
    micronutrients: "Protein nabati", benefit: "Alternatif susu nabati tanpa laktosa.",
    allergens: [],
  },
  {
    id: "su_susu_ibu_hamil", group: "su", name: "Susu ibu hamil",
    portion: "1 gelas (200 ml)", portionChild: "½ gelas (100 ml)",
    costIDR: 5000, costChildIDR: 3000,
    kcal: 140, proteinG: 7, carbsG: 18, fatG: 4,
    micronutrients: "Folat, kalsium & zat besi", benefit: "Diperkaya zat gizi untuk ibu.",
    allergens: ["Susu sapi", "Intoleransi laktosa"],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const BY_ID = new Map<string, CatalogueItem>(CATALOGUE.map((i) => [i.id, i]));
const BY_GROUP = new Map<string, CatalogueItem[]>();
for (const item of CATALOGUE) {
  if (!BY_GROUP.has(item.group)) BY_GROUP.set(item.group, []);
  BY_GROUP.get(item.group)!.push(item);
}

export function getCatalogueItem(id: string): CatalogueItem | undefined {
  return BY_ID.get(id);
}

export function getCatalogueByGroup(group: string): CatalogueItem[] {
  return BY_GROUP.get(group) ?? [];
}

export function getAllCatalogueIds(): string[] {
  return CATALOGUE.map((i) => i.id);
}

/**
 * Returns all item IDs safe for the given category and user allergens.
 * PREGNANCY: all items allowed.
 * BREASTFEEDING: all items allowed.
 * CHILD: su_susu_ibu_hamil excluded.
 */
export function getAllowedIds(
  category: "PREGNANCY" | "BREASTFEEDING" | "CHILD",
  userAllergens: string[]
): string[] {
  const normalized = userAllergens.map((a) => a.toLowerCase());
  return CATALOGUE.filter((item) => {
    if (category === "CHILD" && item.id === "su_susu_ibu_hamil") return false;
    if (item.allergens.some((a) => normalized.includes(a.toLowerCase()))) return false;
    return true;
  }).map((i) => i.id);
}

/**
 * Resolve item for use in mealsData JSON. Uses child portions when isChild.
 */
export function resolveItemForMeal(
  id: string,
  isChild: boolean
): {
  id: string;
  name: string;
  portion: string;
  estimatedCostIDR: number;
  kcal: number;
  nutritionSummary: string;
  benefit: string;
} | null {
  const item = BY_ID.get(id);
  if (!item) return null;
  const kcal = isChild ? Math.round(item.kcal * 0.5) : item.kcal;
  const prot = isChild ? +(item.proteinG * 0.5).toFixed(1) : item.proteinG;
  const carb = isChild ? +(item.carbsG * 0.5).toFixed(1) : item.carbsG;
  const fat  = isChild ? +(item.fatG * 0.5).toFixed(1) : item.fatG;
  return {
    id,
    name: item.name,
    portion: isChild ? item.portionChild : item.portion,
    estimatedCostIDR: isChild ? item.costChildIDR : item.costIDR,
    kcal,
    nutritionSummary: `Energi ${kcal} kkal · Protein ${prot} g · Karbohidrat ${carb} g · Lemak ${fat} g · ${item.micronutrients}`,
    benefit: item.benefit,
  };
}
