import "server-only";
import {
  MEAL_SLOTS_META,
  resolveItemForMeal,
  getCatalogueByGroup,
  type CatalogueItem,
} from "./catalogue";

export interface GeneratedDayMeal {
  time: string;
  itemIds: string[];
}

export interface GeneratedDayPlan {
  dayIndex: number;
  dailyTips: string;
  meals: GeneratedDayMeal[];
}

export interface PlanGeneratorOptions {
  category: "PREGNANCY" | "BREASTFEEDING" | "CHILD";
  allowedItemIds: string[];
  dailyBudgetIDR: number;
  excludeWords?: string[];
  seed?: number;
}

const CATEGORY_TIPS: Record<string, string[]> = {
  PREGNANCY: [
    "Konsumsi cukup protein hewani dan asam folat untuk mendukung perkembangan organ janin.",
    "Pastikan minum minimal 2-2,5 liter air putih setiap hari untuk mendukung volume cairan ketuban.",
    "Padukan sayuran hijau dengan sumber vitamin C (seperti jeruk atau pepaya) agar penyerapan zat besi optimal.",
    "Makan dalam porsi kecil namun sering untuk membantu mengurangi rasa begah atau mual.",
    "Pilihlah camilan sehat seperti buah potong atau kacang rebus di antara waktu makan utama.",
    "Kurangi konsumsi makanan tinggi gula sederhana atau garam berlebih selama kehamilan.",
    "Cukupi kebutuhan kalsium harian untuk menjaga kepadatan tulang ibu dan pembentukan tulang janin.",
  ],
  BREASTFEEDING: [
    "Kebutuhan cairan ibu menyusui meningkat; minum segelas air putih sebelum dan sesudah menyusui.",
    "Asupan protein yang cukup sangat penting untuk menjaga kualitas dan kuantitas produksi ASI.",
    "Daun kelor dan bayam merupakan sayuran lokal yang kaya mikronutrien untuk ibu menyusui.",
    "Istirahat cukup saat bayi tidur untuk membantu regulasi hormon prolaktin dan oksitosin.",
    "Variasikan sumber karbohidrat dan lauk nabati harian agar asupan nutrisi tetap seimbang.",
    "Camilan kaya serat seperti pisang atau jagung rebus membantu menjaga stamina Bunda.",
    "Pastikan konsumsi lemak sehat untuk mendukung perkembangan otak dan saraf bayi melalui ASI.",
  ],
  CHILD: [
    "Tekstur makanan harus disesuaikan bertahap dengan usia dan kemampuan mengunyah anak.",
    "Prioritaskan protein hewani (seperti telur, ayam, atau ikan) setiap kali makan utama untuk cegah stunting.",
    "Hindari penambahan gula dan garam berlebih pada menu MPASI anak di bawah 1 tahun.",
    "Berikan porsi kecil namun kaya zat gizi, jangan paksa anak jika sudah menunjukkan tanda kenyang.",
    "Sajikan buah potong lembut sebagai selingan sehat yang kaya vitamin dan serat alami.",
    "Variasikan bahan makanan lokal agar anak mengenal berbagai rasa dan tekstur sejak dini.",
    "Pastikan kebersihan peralatan makan dan tangan anak selalu terjaga sebelum makan.",
  ],
};

function simpleRng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateCataloguePlan(opts: PlanGeneratorOptions): { days: GeneratedDayPlan[] } {
  const { category, allowedItemIds, dailyBudgetIDR, excludeWords = [], seed = 42 } = opts;
  const isChild = category === "CHILD";
  const rng = simpleRng(seed * 7919 + 17);

  const allowedSet = new Set(allowedItemIds);
  const normalizedExcludes = excludeWords.map((w) => w.trim().toLowerCase()).filter(Boolean);

  const isItemAllowed = (item: CatalogueItem) => {
    if (!allowedSet.has(item.id)) return false;
    const fullName = `${item.name} ${item.id}`.toLowerCase();
    return !normalizedExcludes.some((w) => fullName.includes(w));
  };

  const pool = (group: string): CatalogueItem[] => {
    return getCatalogueByGroup(group).filter(isItemAllowed);
  };

  const getSlotPool = (spec: string): CatalogueItem[] => {
    if (spec === "ph_or_pn") return [...pool("ph"), ...pool("pn")];
    if (spec === "pn_or_bh") return [...pool("pn"), ...pool("bh")];
    if (spec === "bh_or_su") return [...pool("bh"), ...pool("su")];
    return pool(spec);
  };

  const pickItem = (
    candidates: CatalogueItem[],
    dayUsedIds: Set<string>,
    prevDayIds: Set<string>
  ): CatalogueItem | null => {
    if (candidates.length === 0) return null;

    // 1. Prefer items not used today and not used in the previous day
    let filtered = candidates.filter((i) => !dayUsedIds.has(i.id) && !prevDayIds.has(i.id));
    if (filtered.length === 0) {
      // 2. Fallback: items not used today
      filtered = candidates.filter((i) => !dayUsedIds.has(i.id));
    }
    if (filtered.length === 0) {
      // 3. Fallback: any candidate
      filtered = candidates;
    }

    const picked = filtered[Math.floor(rng() * filtered.length)];
    dayUsedIds.add(picked.id);
    return picked;
  };

  const tipsList = CATEGORY_TIPS[category] || CATEGORY_TIPS.PREGNANCY;
  const days: GeneratedDayPlan[] = [];
  let prevDayIds = new Set<string>();

  for (let d = 1; d <= 30; d++) {
    let bestDayMeals: GeneratedDayMeal[] | null = null;
    let bestCost = Infinity;

    // Attempt up to 6 candidate combinations per day to strictly satisfy budget constraints
    for (let attempt = 0; attempt < 6; attempt++) {
      const dayUsedIds = new Set<string>();
      const candidateMeals: GeneratedDayMeal[] = [];
      let dayCost = 0;

      for (const slotMeta of MEAL_SLOTS_META) {
        const slotItemIds: string[] = [];

        for (const groupSpec of slotMeta.groups) {
          const groupCandidates = getSlotPool(groupSpec);
          const picked = pickItem(groupCandidates, dayUsedIds, prevDayIds);
          if (picked) {
            slotItemIds.push(picked.id);
            const resolved = resolveItemForMeal(picked.id, isChild);
            if (resolved) {
              dayCost += resolved.estimatedCostIDR;
            }
          }
        }

        // Ensure at least 1 item per slot if somehow groups were empty
        if (slotItemIds.length === 0) {
          const fallbackList = Array.from(allowedSet);
          if (fallbackList.length > 0) {
            const fallbackId = fallbackList[Math.floor(rng() * fallbackList.length)];
            slotItemIds.push(fallbackId);
            const resolved = resolveItemForMeal(fallbackId, isChild);
            if (resolved) dayCost += resolved.estimatedCostIDR;
          }
        }

        candidateMeals.push({
          time: slotMeta.time,
          itemIds: slotItemIds,
        });
      }

      if (!bestDayMeals || dayCost < bestCost) {
        bestDayMeals = candidateMeals;
        bestCost = dayCost;
      }

      // If comfortably within daily budget, accept this combination
      if (dayCost <= dailyBudgetIDR) {
        bestDayMeals = candidateMeals;
        bestCost = dayCost;
        break;
      }
    }

    const currentDayItemIds = new Set<string>();
    bestDayMeals!.forEach((m) => m.itemIds.forEach((id) => currentDayItemIds.add(id)));
    prevDayIds = currentDayItemIds;

    const tip = tipsList[(d - 1) % tipsList.length];

    days.push({
      dayIndex: d,
      dailyTips: tip,
      meals: bestDayMeals!,
    });
  }

  return { days };
}
