import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { NutritionContextType } from "@prisma/client";

const VALID_CATEGORIES = ["PREGNANCY", "BREASTFEEDING", "CHILD"] as const;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();

    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category")?.toUpperCase();

    // Build where clause — optionally filter by category
    const categoryFilter =
      categoryParam && VALID_CATEGORIES.includes(categoryParam as typeof VALID_CATEGORIES[number])
        ? { category: categoryParam as NutritionContextType }
        : {};

    // Fetch the most recent READY plan for this user
    const plan = await prisma.nutritionPlan.findFirst({
      where: {
        userId: user.id,
        status: "READY",
        ...categoryFilter,
      },
      orderBy: { createdAt: "desc" },
      include: {
        dailyRecommendations: {
          orderBy: { dayIndex: "asc" },
          select: {
            id: true,
            dayIndex: true,
            recommendationDate: true,
            totalCalories: true,
            estimatedCost: true,
            isOverBudget: true,
            dailyTips: true,
            mealsData: true,
          },
        },
      },
    });

    if (!plan) {
      return successResponse("Belum ada rencana gizi aktif.", { plan: null });
    }

    // Backward-compatibility: if an older plan record had dailyBudget erroneously multiplied by 1,000 (e.g. >= 10,000,000)
    // while catalogue costs are ~15,000-30,000 IDR, normalize to actual IDR.
    const rawDailyBudget = Number(plan.dailyBudget);
    const normalizedDailyBudget =
      rawDailyBudget >= 10_000_000 && rawDailyBudget % 1000 === 0
        ? rawDailyBudget / 1000
        : rawDailyBudget;

    return successResponse("Rencana gizi berhasil diambil.", {
      plan: {
        id: plan.id,
        assessmentId: plan.assessmentId,
        category: plan.category,
        version: plan.version,
        periodStart: plan.periodStart,
        periodEnd: plan.periodEnd,
        dailyBudget: normalizedDailyBudget,
        targetNutrition: plan.targetNutrition,
        status: plan.status,
        modelProvider: plan.modelProvider,
        modelName: plan.modelName,
        isApproved: plan.isApproved,
        readyAt: plan.readyAt,
        createdAt: plan.createdAt,
        days: plan.dailyRecommendations.map((d) => ({
          id: d.id,
          dayIndex: d.dayIndex,
          recommendationDate: d.recommendationDate,
          totalCalories: d.totalCalories !== null ? Number(d.totalCalories) : null,
          estimatedCost: Number(d.estimatedCost),
          isOverBudget: d.isOverBudget,
          dailyTips: d.dailyTips,
          meals: d.mealsData,
        })),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutriplan/current error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
