import "server-only";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  getAllowedIds,
  getCatalogueItem,
  resolveItemForMeal,
  MEAL_SLOTS_META,
} from "@/lib/nutriplan/catalogue";
import { callGemini, type GeminiDay } from "@/lib/nutriplan/gemini";
import { NutritionContextType } from "@prisma/client";

const VALID_CATEGORIES = ["PREGNANCY", "BREASTFEEDING", "CHILD"] as const;
type ValidCategory = typeof VALID_CATEGORIES[number];

/** Build human-readable nutrition context sent to Gemini. No PII — no names, emails, IDs. */
function buildNutritionContext(
  category: ValidCategory,
  formData: Record<string, unknown> | null
): string {
  const lines: string[] = [`Kategori: ${category}`];

  if (!formData) {
    lines.push("Data asesmen: tidak tersedia, gunakan kebutuhan gizi umum untuk kategori ini.");
    return lines.join("\n");
  }

  // Extract only nutritionally relevant, non-identifying fields
  if (category === "PREGNANCY") {
    if (formData.usiaKehamilan) lines.push(`Usia kehamilan: ${formData.usiaKehamilan} minggu`);
    if (formData.bb) lines.push(`Berat badan: ${formData.bb} kg`);
    if (formData.tb) lines.push(`Tinggi badan: ${formData.tb} cm`);
    if (formData.kondisi) lines.push(`Kondisi khusus: ${formData.kondisi}`);
    if (formData.alergi) lines.push(`Alergi/pantangan: ${formData.alergi}`);
  } else if (category === "BREASTFEEDING") {
    if (formData.usiaAnak) lines.push(`Usia anak yang disusui: ${formData.usiaAnak} bulan`);
    if (formData.bb) lines.push(`Berat badan ibu: ${formData.bb} kg`);
    if (formData.kondisi) lines.push(`Kondisi khusus: ${formData.kondisi}`);
    if (formData.alergi) lines.push(`Alergi/pantangan: ${formData.alergi}`);
  } else {
    // CHILD
    if (formData.usiaAnak) lines.push(`Usia anak: ${formData.usiaAnak} bulan`);
    if (formData.bbAnak) lines.push(`Berat badan anak: ${formData.bbAnak} kg`);
    if (formData.tbAnak) lines.push(`Tinggi badan anak: ${formData.tbAnak} cm`);
    if (formData.kondisiAnak) lines.push(`Kondisi khusus: ${formData.kondisiAnak}`);
    if (formData.alergiAnak) lines.push(`Alergi anak: ${formData.alergiAnak}`);
  }

  return lines.join("\n");
}

/** Extract allergen strings from formData */
function extractAllergens(
  category: ValidCategory,
  formData: Record<string, unknown> | null
): string[] {
  if (!formData) return [];
  const raw =
    category === "CHILD"
      ? String(formData.alergiAnak || "")
      : String(formData.alergi || "");
  if (!raw || raw.trim() === "") return [];
  // Split on comma, semicolon, or "dan"
  return raw
    .split(/[,;]|\bdan\b/gi)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Validate and resolve a single Gemini day against the catalogue.
 * Returns null on any structural error; caller should abort generation.
 */
function resolveDay(
  geminiDay: GeminiDay,
  allowedIdSet: Set<string>,
  dailyBudgetIDR: number,
  isChild: boolean,
  periodStart: Date,
): {
  dayIndex: number;
  recommendationDate: Date;
  mealsData: unknown;
  totalCalories: number;
  estimatedCostIDR: number;
  isOverBudget: boolean;
  dailyTips: string;
} | { error: string } {
  const { dayIndex, dailyTips, meals } = geminiDay;

  if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > 30) {
    return { error: `dayIndex out of range: ${dayIndex}` };
  }

  const expectedTimes = new Set(MEAL_SLOTS_META.map((s) => s.time));
  const presentTimes = new Set(meals.map((m) => m.time));

  for (const t of expectedTimes) {
    if (!presentTimes.has(t)) {
      return { error: `Day ${dayIndex}: missing meal slot ${t}` };
    }
  }

  let totalCalories = 0;
  let estimatedCostIDR = 0;

  const mealsData = meals.map((slot) => {
    const slotMeta = MEAL_SLOTS_META.find((s) => s.time === slot.time);
    const resolvedItems: unknown[] = [];

    for (const itemId of slot.itemIds) {
      if (!allowedIdSet.has(itemId)) {
        // Skip disallowed IDs silently (allergen/category guard)
        continue;
      }
      const resolved = resolveItemForMeal(itemId, isChild);
      if (!resolved) continue;

      totalCalories += resolved.kcal;
      estimatedCostIDR += resolved.estimatedCostIDR;

      resolvedItems.push({
        id: resolved.id,
        name: resolved.name,
        portion: resolved.portion,
        estimatedCost: resolved.estimatedCostIDR,
        nutritionSummary: resolved.nutritionSummary,
        benefit: resolved.benefit,
      });
    }

    return {
      time: slot.time,
      label: slotMeta?.label ?? slot.time,
      items: resolvedItems,
    };
  });

  const recommendationDate = new Date(periodStart);
  recommendationDate.setDate(periodStart.getDate() + (dayIndex - 1));

  return {
    dayIndex,
    recommendationDate,
    mealsData,
    totalCalories,
    estimatedCostIDR,
    isOverBudget: estimatedCostIDR > dailyBudgetIDR,
    dailyTips: String(dailyTips ?? "").slice(0, 500),
  };
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => ({}));
    const categoryParam = String(body?.category ?? "").toUpperCase();

    if (!VALID_CATEGORIES.includes(categoryParam as ValidCategory)) {
      return errorResponse(
        "Parameter category wajib diisi (PREGNANCY, BREASTFEEDING, CHILD).",
        400,
        "INVALID_CATEGORY"
      );
    }

    const category = categoryParam as ValidCategory;

    // 1. Fetch latest assessment — verified by userId, not trusted from client
    const context = await prisma.nutritionContext.findFirst({
      where: { userId: user.id, contextType: category as NutritionContextType, status: "ACTIVE" },
      include: {
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!context || context.assessments.length === 0) {
      return errorResponse(
        "Belum ada asesmen untuk kategori ini. Selesaikan NutriCheck terlebih dahulu.",
        400,
        "NO_ASSESSMENT"
      );
    }

    const latestAssessment = context.assessments[0];
    const formData =
      (latestAssessment.contextSnapshot as { formData?: Record<string, unknown> } | null)
        ?.formData ?? null;

    // 2. Determine budget — from formData or default
    const rawBudget = Number(formData?.bud ?? 0);
    const dailyBudgetIDR = rawBudget > 0 ? rawBudget * 1000 : 25000; // formData.bud is in thousands

    // 3. Allergen extraction and allowed ID set
    const userAllergens = extractAllergens(category, formData);
    const allowedIds = getAllowedIds(category, userAllergens);
    const allowedIdSet = new Set(allowedIds);

    if (allowedIds.length < 5) {
      return errorResponse(
        "Terlalu banyak alergen yang membatasi pilihan bahan makanan tersedia.",
        400,
        "INSUFFICIENT_CATALOGUE"
      );
    }

    // 4. Call Gemini OUTSIDE any database transaction
    const nutritionContext = buildNutritionContext(category, formData);
    const geminiOutput = await callGemini({
      category,
      allowedItemIds: allowedIds,
      dailyBudgetIDR,
      mealSlots: MEAL_SLOTS_META.map((s) => ({ time: s.time, label: s.label })),
      nutritionContext,
      totalDays: 30,
    });

    // 5. Validate Gemini output structure
    if (!Array.isArray(geminiOutput.days) || geminiOutput.days.length !== 30) {
      return errorResponse(
        "Pembuatan rekomendasi gagal: respons AI tidak menghasilkan 30 hari.",
        502,
        "GEMINI_INVALID_DAYS_COUNT"
      );
    }

    const isChild = category === "CHILD";
    const periodStart = new Date();
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 29);

    // Resolve all 30 days before entering DB transaction
    const resolvedDays: Awaited<ReturnType<typeof resolveDay>>[] = [];
    for (const geminiDay of geminiOutput.days) {
      const result = resolveDay(geminiDay, allowedIdSet, dailyBudgetIDR, isChild, periodStart);
      resolvedDays.push(result);
      if ("error" in result) {
        return errorResponse(
          `Pembuatan rekomendasi gagal: ${result.error}`,
          502,
          "GEMINI_VALIDATION_FAILED"
        );
      }
    }

    // Ensure all 30 dayIndex 1-30 are present and within hard daily budget
    const dayIndices = resolvedDays.map((d) => ("dayIndex" in d ? d.dayIndex : 0));
    for (let i = 1; i <= 30; i++) {
      if (!dayIndices.includes(i)) {
        return errorResponse(
          `Pembuatan rekomendasi gagal: hari ke-${i} tidak ada dalam respons AI.`,
          502,
          "GEMINI_MISSING_DAY"
        );
      }
    }

    // Hard budget check: reject immediately if any day exceeds dailyBudgetIDR
    for (const d of resolvedDays) {
      if ("estimatedCostIDR" in d && d.estimatedCostIDR > dailyBudgetIDR) {
        return errorResponse(
          `Pembuatan rekomendasi gagal: estimasi biaya hari ke-${d.dayIndex} (Rp ${d.estimatedCostIDR.toLocaleString("id-ID")}) melebihi pagu anggaran harian (Rp ${dailyBudgetIDR.toLocaleString("id-ID")}).`,
          422,
          "BUDGET_CEILING_EXCEEDED"
        );
      }
    }

    // 6. Persist in one atomic transaction — idempotency check inside
    const plan = await prisma.$transaction(async (tx) => {
      // Idempotency: if a plan already exists for this assessment, return it
      const existing = await tx.nutritionPlan.findFirst({
        where: { assessmentId: latestAssessment.id, userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        return existing;
      }

      const newPlan = await tx.nutritionPlan.create({
        data: {
          assessmentId: latestAssessment.id,
          userId: user.id,
          category: category as NutritionContextType,
          version: 1,
          periodStart,
          periodEnd,
          dailyBudget: dailyBudgetIDR,
          targetNutrition: nutritionContext.slice(0, 1000),
          status: "READY",
          modelProvider: "9Router",
          modelName: process.env.NUTRIPLAN_MODEL || "lomba",
          isApproved: false,
          readyAt: new Date(),
        },
      });

      // Insert 30 daily recommendations
      await tx.dailyRecommendation.createMany({
        data: resolvedDays
          .filter((d): d is Exclude<typeof d, { error: string }> => !("error" in d))
          .map((d) => ({
            planId: newPlan.id,
            recommendationDate: d.recommendationDate,
            dayIndex: d.dayIndex,
            totalCalories: d.totalCalories,
            estimatedCost: d.estimatedCostIDR,
            isOverBudget: d.isOverBudget,
            dailyTips: d.dailyTips || null,
            mealsData: d.mealsData as object,
          })),
      });

      return newPlan;
    });

    return successResponse(
      "Rencana gizi 30 hari berhasil dibuat.",
      {
        planId: plan.id,
        category: plan.category,
        periodStart: plan.periodStart,
        periodEnd: plan.periodEnd,
        dailyBudget: Number(plan.dailyBudget),
        version: plan.version,
        status: plan.status,
      },
      201
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message.startsWith("GEMINI_API_ERROR:")) {
        return errorResponse(
          "Layanan AI sedang tidak tersedia. Coba beberapa saat lagi.",
          502,
          "GEMINI_API_ERROR"
        );
      }
      if (err.message === "GEMINI_EMPTY_RESPONSE:SAFETY" || err.message.startsWith("GEMINI_EMPTY_RESPONSE")) {
        return errorResponse(
          "Layanan AI tidak dapat menghasilkan rekomendasi saat ini. Coba beberapa saat lagi.",
          502,
          "GEMINI_EMPTY_RESPONSE"
        );
      }
      if (err.message === "GEMINI_INVALID_JSON" || err.message.startsWith("GEMINI_INVALID_STRUCTURE")) {
        return errorResponse(
          "Pembuatan rekomendasi gagal: respons AI tidak valid.",
          502,
          "GEMINI_INVALID_RESPONSE"
        );
      }
      if (err.message === "GEMINI_API_KEY environment variable is not set.") {
        console.error("NutriPlan generate: GEMINI_API_KEY is missing.");
        return errorResponse(
          "Layanan rekomendasi AI belum dikonfigurasi.",
          503,
          "GEMINI_NOT_CONFIGURED"
        );
      }
      if (err.name === "AbortError") {
        return errorResponse(
          "Permintaan ke layanan AI melebihi batas waktu. Coba beberapa saat lagi.",
          504,
          "GEMINI_TIMEOUT"
        );
      }
    }
    console.error("POST /nutriplan/generate error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
