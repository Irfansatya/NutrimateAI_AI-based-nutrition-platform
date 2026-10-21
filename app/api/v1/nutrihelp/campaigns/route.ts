import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";
import { CampaignCategory, Prisma } from "@prisma/client";

export async function GET() {
  try {
    const user = await requireUser();

    const campaigns = await prisma.helpCampaign.findMany({
      where: { creatorUserId: user.id },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 1 },
        donations: {
          where: { status: "CONFIRMED" },
          select: { id: true, amount: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Attach server-computed aggregates (only CONFIRMED donations)
    const result = campaigns.map((c) => {
      const confirmedAmount = c.donations.reduce(
        (sum, d) => sum + Number(d.amount),
        0
      );
      return {
        ...c,
        _confirmedAmount: confirmedAmount,
        _donorCount: c.donations.length,
      };
    });

    return successResponse("Daftar kampanye pengguna berhasil diambil", { campaigns: result });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutrihelp/campaigns error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const {
      category,
      applicantName,
      recipientName,
      whatsappNumber,
      relationship,
      province,
      city,
      title,
      story,
      healthConditionDesc,
      economicConditionDesc,
      durationDays,
      items,
      thumbnailUrl,
      documents,
      formSnapshot,
    } = body || {};

    // 1. Validations
    if (!category || !["PREGNANCY", "BREASTFEEDING", "CHILD"].includes(category)) {
      return errorResponse("Kategori kampanye tidak valid.", 400, "VALIDATION_ERROR");
    }
    if (!applicantName || typeof applicantName !== "string" || applicantName.trim().length < 2) {
      return errorResponse("Nama pemohon wajib diisi minimal 2 karakter.", 400, "VALIDATION_ERROR");
    }
    if (!recipientName || typeof recipientName !== "string" || recipientName.trim().length < 2) {
      return errorResponse("Nama penerima bantuan wajib diisi minimal 2 karakter.", 400, "VALIDATION_ERROR");
    }
    if (!whatsappNumber || typeof whatsappNumber !== "string" || whatsappNumber.trim().length < 10) {
      return errorResponse("Nomor WhatsApp minimal 10 digit.", 400, "VALIDATION_ERROR");
    }
    if (!relationship || typeof relationship !== "string" || relationship.trim().length === 0) {
      return errorResponse("Hubungan dengan penerima wajib dipilih.", 400, "VALIDATION_ERROR");
    }
    if (!province || !city) {
      return errorResponse("Provinsi dan Kabupaten/Kota wajib dipilih.", 400, "VALIDATION_ERROR");
    }
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return errorResponse("Judul pengajuan minimal 5 karakter.", 400, "VALIDATION_ERROR");
    }
    if (!story || typeof story !== "string" || story.trim().length < 20) {
      return errorResponse("Cerita pengajuan minimal 20 karakter.", 400, "VALIDATION_ERROR");
    }
    if (!durationDays || ![14, 30, 45, 60].includes(Number(durationDays))) {
      return errorResponse("Durasi kampanye harus 14, 30, 45, atau 60 hari.", 400, "VALIDATION_ERROR");
    }
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse("Daftar kebutuhan bahan pangan wajib diisi minimal 1 item.", 400, "VALIDATION_ERROR");
    }

    // Calculate target amount from items
    let targetAmount = 0;
    const validatedItems: Array<{ name: string; quantity: string; estimatedCost: number; sortOrder: number }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name || !item.quantity || Number(item.estimatedCost) <= 0) {
        return errorResponse(`Item ke-${i + 1} belum lengkap atau biaya tidak valid.`, 400, "VALIDATION_ERROR");
      }
      const cost = Math.round(Number(item.estimatedCost));
      targetAmount += cost;
      validatedItems.push({
        name: String(item.name).trim(),
        quantity: String(item.quantity).trim(),
        estimatedCost: cost,
        sortOrder: i,
      });
    }

    if (targetAmount <= 0) {
      return errorResponse("Total target donasi harus lebih dari 0.", 400, "VALIDATION_ERROR");
    }

    // Document metadata & form snapshot combined in documents JSON column
    const docMeta = {
      manifest: documents || {},
      formSnapshot: formSnapshot || null,
    };

    // 2. Transaction: Create HelpCampaign with items
    const newCampaign = await prisma.$transaction(async (tx) => {
      const campaign = await tx.helpCampaign.create({
        data: {
          creatorUserId: user.id, // Strictly derived from server session
          category: category as CampaignCategory,
          applicantName: applicantName.trim(),
          recipientName: recipientName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          relationship: relationship.trim().slice(0, 64),
          province: province.trim(),
          city: city.trim(),
          title: title.trim(),
          story: story.trim(),
          healthConditionDesc: healthConditionDesc ? String(healthConditionDesc).trim() : "",
          economicConditionDesc: economicConditionDesc ? String(economicConditionDesc).trim() : "",
          targetAmount,
          durationDays: Number(durationDays),
          thumbnailUrl: thumbnailUrl || null,
          documents: docMeta as Prisma.InputJsonValue,
          status: "REVIEW",
          items: {
            create: validatedItems.map((it) => ({
              name: it.name,
              quantity: it.quantity,
              estimatedCost: it.estimatedCost,
              sortOrder: it.sortOrder,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return campaign;
    });

    return successResponse("Pengajuan kampanye berhasil dikirim", { campaign: newCampaign }, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("POST /nutrihelp/campaigns error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat mengirim pengajuan.", 500, "INTERNAL_SERVER_ERROR");
  }
}
