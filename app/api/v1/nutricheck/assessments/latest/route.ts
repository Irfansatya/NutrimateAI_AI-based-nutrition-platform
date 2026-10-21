import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { NutritionContextType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");

    if (!categoryParam || !["PREGNANCY", "BREASTFEEDING", "CHILD"].includes(categoryParam)) {
      return errorResponse("Parameter category wajib diisi (PREGNANCY, BREASTFEEDING, CHILD).", 400, "INVALID_CATEGORY");
    }

    const context = await prisma.nutritionContext.findFirst({
      where: {
        userId: user.id,
        contextType: categoryParam as NutritionContextType,
        status: "ACTIVE",
      },
      include: {
        pregnancyProfile: true,
        breastfeedingProfile: true,
        childProfile: true,
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!context || context.assessments.length === 0) {
      return successResponse("Belum ada asesmen untuk kategori ini", {
        latest: null,
        formData: null,
      });
    }

    const latest = context.assessments[0];
    const snap = latest.contextSnapshot as { formData?: Record<string, unknown> } | null;

    return successResponse("Asesmen terbaru ditemukan", {
      latest: {
        id: latest.id,
        contextId: latest.contextId,
        category: context.contextType,
        periodKey: latest.periodKey,
        version: latest.version,
        isBaseline: latest.isBaseline,
        createdAt: latest.createdAt,
      },
      formData: snap?.formData || null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("NutriCheck latest GET error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
