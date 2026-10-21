import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { NutritionContextType, Gender, Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { category, periodKey: userPeriodKey, data } = body || {};

    if (!category || !["PREGNANCY", "BREASTFEEDING", "CHILD"].includes(category)) {
      return errorResponse("Kategori tidak valid.", 400, "INVALID_CATEGORY");
    }

    if (!data || typeof data !== "object") {
      return errorResponse("Data asesmen wajib diisi.", 400, "INVALID_DATA");
    }

    const d = data as Record<string, unknown>;

    // 1. Category-specific validation
    if (category === "PREGNANCY") {
      if (!d.usia || !d.uk || !d.ke || !d.bb || !d.tb || !d.bb0 || !d.hpl) {
        return errorResponse("Data kehamilan belum lengkap.", 400, "VALIDATION_ERROR");
      }
    } else if (category === "BREASTFEEDING") {
      if (!d.usia || !d.ub || !d.ke || !d.bb || !d.tb || !d.bb0 || !d.lhr) {
        return errorResponse("Data ibu menyusui belum lengkap.", 400, "VALIDATION_ERROR");
      }
    } else if (category === "CHILD") {
      if (!d.nm || !d.ua || !d.jk || !d.bb || !d.tb || !d.bbl || !d.pbl || !d.prem) {
        return errorResponse("Data dasar anak belum lengkap.", 400, "VALIDATION_ERROR");
      }
      // Conditional validation for premature birth
      if (d.prem === "Ya" && (!d.ukl || Number(d.ukl) <= 0)) {
        return errorResponse("Usia kehamilan saat lahir wajib diisi untuk kelahiran prematur.", 400, "VALIDATION_ERROR");
      }
      // Conditional validation for MPASI
      if (d.mp === "Sudah" && !d.fmx) {
        return errorResponse("Frekuensi makan MPASI wajib diisi.", 400, "VALIDATION_ERROR");
      }
    }

    // Common fields
    if (!d.prov) {
      return errorResponse("Provinsi domisili wajib dipilih.", 400, "VALIDATION_ERROR");
    }

    // 2. Compute periodKey (YYYY-MM)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const periodKey = typeof userPeriodKey === "string" && /^\d{4}-\d{2}$/.test(userPeriodKey)
      ? userPeriodKey
      : `${currentYear}-${currentMonth}`;

    const contextType = category as NutritionContextType;

    // 3. Extract metrics for contextSnapshot & growth records
    const bb = Number(d.bb);
    const tb = Number(d.tb);
    const x = category === "PREGNANCY" ? Number(d.uk) : category === "BREASTFEEDING" ? Number(d.ub) : Number(d.ua);
    const ym = currentYear * 12 + now.getMonth();

    const snapshot = {
      formData: d,
      metrics: {
        ym,
        x,
        bb,
        tb,
        bb0: d.bb0 ? Number(d.bb0) : null,
        jk: d.jk === "Laki-laki" ? "L" : d.jk === "Perempuan" ? "P" : undefined,
      },
    };

    const economicData = {
      dailyBudget: Number(d.bud) || 25000,
    };

    const healthData = {
      history: d.rw || d.kon,
      allergies: d.al,
      supplements: d.ob,
    };

    const environmentData = {
      province: d.prov,
      staples: d.pokok,
      animalProtein: d.ph,
      plantProtein: d.pn,
      vegetables: d.sy,
      fruits: d.bh,
      milk: d.su,
    };

    // 4. Atomic transaction: NutritionContext, Profile, and NutritionAssessment
    const result = await prisma.$transaction(async (tx) => {
      // Find or create NutritionContext
      let context = await tx.nutritionContext.findFirst({
        where: {
          userId: user.id,
          contextType,
          status: "ACTIVE",
        },
      });

      if (!context) {
        context = await tx.nutritionContext.create({
          data: {
            userId: user.id,
            contextType,
            label: category === "CHILD" ? (d.nm as string) : category,
            status: "ACTIVE",
          },
        });
      }

      // Update or create profile
      if (category === "PREGNANCY") {
        await tx.pregnancyProfile.upsert({
          where: { contextId: context.id },
          update: {
            gestationalAgeWeeks: Number(d.uk) || null,
            pregnancyIndex: Number(d.ke) || null,
            prePregnancyWeight: d.bb0 ? Number(d.bb0) : null,
            estimatedDueDate: d.hpl ? new Date(d.hpl as string) : null,
          },
          create: {
            contextId: context.id,
            gestationalAgeWeeks: Number(d.uk) || null,
            pregnancyIndex: Number(d.ke) || null,
            prePregnancyWeight: d.bb0 ? Number(d.bb0) : null,
            estimatedDueDate: d.hpl ? new Date(d.hpl as string) : null,
          },
        });
      } else if (category === "BREASTFEEDING") {
        await tx.breastfeedingProfile.upsert({
          where: { contextId: context.id },
          update: {
            babyAgeMonths: Number(d.ub) || null,
            deliveryDate: d.lhr ? new Date(d.lhr as string) : null,
            childIndex: Number(d.ke) || null,
          },
          create: {
            contextId: context.id,
            babyAgeMonths: Number(d.ub) || null,
            deliveryDate: d.lhr ? new Date(d.lhr as string) : null,
            childIndex: Number(d.ke) || null,
          },
        });
      } else if (category === "CHILD") {
        await tx.childProfile.upsert({
          where: { contextId: context.id },
          update: {
            childName: (d.nm as string) || null,
            gender: d.jk === "Laki-laki" ? Gender.MALE : d.jk === "Perempuan" ? Gender.FEMALE : null,
            currentAgeMonths: Number(d.ua) || null,
            birthWeight: d.bbl ? Number(d.bbl) : null,
            birthLength: d.pbl ? Number(d.pbl) : null,
            isPremature: d.prem === "Ya",
            gestationalAgeAtBirth: d.prem === "Ya" && d.ukl ? Number(d.ukl) : null,
          },
          create: {
            contextId: context.id,
            childName: (d.nm as string) || null,
            gender: d.jk === "Laki-laki" ? Gender.MALE : d.jk === "Perempuan" ? Gender.FEMALE : null,
            currentAgeMonths: Number(d.ua) || null,
            birthWeight: d.bbl ? Number(d.bbl) : null,
            birthLength: d.pbl ? Number(d.pbl) : null,
            isPremature: d.prem === "Ya",
            gestationalAgeAtBirth: d.prem === "Ya" && d.ukl ? Number(d.ukl) : null,
          },
        });
      }

      // Check baseline: first assessment in this context
      const existingCount = await tx.nutritionAssessment.count({
        where: { contextId: context.id },
      });
      const isBaseline = existingCount === 0;

      // Versioning for identical periodKey
      const latestPeriodAssessment = await tx.nutritionAssessment.findFirst({
        where: { contextId: context.id, periodKey },
        orderBy: { version: "desc" },
      });
      const version = latestPeriodAssessment ? latestPeriodAssessment.version + 1 : 1;

      // Append new assessment
      const assessment = await tx.nutritionAssessment.create({
        data: {
          contextId: context.id,
          periodKey,
          version,
          isBaseline,
          status: "COMPLETED",
          economicData: economicData as Prisma.InputJsonValue,
          healthData: healthData as Prisma.InputJsonValue,
          environmentData: environmentData as Prisma.InputJsonValue,
          contextSnapshot: snapshot as Prisma.InputJsonValue,
        },
      });

      return { assessment, context };
    });

    return successResponse("Asesmen berhasil disimpan", result, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("NutriCheck POST error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat menyimpan asesmen.", 500, "INTERNAL_SERVER_ERROR");
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");

    const contexts = await prisma.nutritionContext.findMany({
      where: {
        userId: user.id,
        ...(categoryParam ? { contextType: categoryParam as NutritionContextType } : {}),
      },
      include: {
        assessments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Reconstruct growth records grouped by category
    const growth: Record<string, Array<{ ym: number; x: number; bb: number; tb: number; bb0?: number | null; jk?: "L" | "P" }>> = {
      hamil: [],
      menyusui: [],
      anak: [],
    };

    const assessmentsList: unknown[] = [];

    for (const ctx of contexts) {
      const catKey = ctx.contextType === "PREGNANCY" ? "hamil" : ctx.contextType === "BREASTFEEDING" ? "menyusui" : "anak";
      for (const a of ctx.assessments) {
        assessmentsList.push({
          id: a.id,
          contextId: a.contextId,
          category: ctx.contextType,
          periodKey: a.periodKey,
          version: a.version,
          isBaseline: a.isBaseline,
          status: a.status,
          createdAt: a.createdAt,
        });

        const snap = a.contextSnapshot as { metrics?: { ym: number; x: number; bb: number; tb: number; bb0?: number | null; jk?: "L" | "P" } } | null;
        if (snap?.metrics && snap.metrics.bb && snap.metrics.tb) {
          growth[catKey].push(snap.metrics);
        }
      }
    }

    return successResponse("Riwayat asesmen berhasil diambil", {
      assessments: assessmentsList,
      growth,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("NutriCheck GET error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}
