import { NextRequest } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";

function generateDonationId(): string {
  // Format: NM-XXXXXX (6 alphanumeric uppercase chars)
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NM-${rand}`;
}

export async function GET() {
  try {
    const user = await requireUser();

    const donations = await prisma.donation.findMany({
      where: {
        donorUserId: user.id,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            recipientName: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse("Daftar donasi berhasil diambil", { donations });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutriassist/donations error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { campaignId, amount, donorName, isAnonymous, message } = body || {};

    // 1. Validations
    if (!campaignId || typeof campaignId !== "string") {
      return errorResponse("ID kampanye tidak valid.", 400, "VALIDATION_ERROR");
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 1000 || numAmount > 100_000_000) {
      return errorResponse("Nominal donasi harus antara Rp 1.000 dan Rp 100.000.000.", 400, "VALIDATION_ERROR");
    }

    // 2. Verify campaign exists and is ACTIVE
    const campaign = await prisma.helpCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        status: true,
        recipientName: true,
        title: true,
        creatorUserId: true,
      },
    });

    if (!campaign) {
      return errorResponse("Kampanye tidak ditemukan.", 404, "NOT_FOUND");
    }

    if (campaign.status !== "ACTIVE") {
      return errorResponse("Kampanye ini tidak sedang aktif menerima donasi.", 400, "CAMPAIGN_NOT_ACTIVE");
    }

    // Cannot donate to own campaign
    if (campaign.creatorUserId === user.id) {
      return errorResponse("Anda tidak dapat berdonasi ke kampanye milik sendiri.", 400, "SELF_DONATION_FORBIDDEN");
    }

    const anonymousBool = Boolean(isAnonymous);
    const resolvedDonorName = anonymousBool
      ? "Anonim"
      : typeof donorName === "string" && donorName.trim().length > 0
      ? donorName.trim().slice(0, 255)
      : user.name || "Anonim";

    const resolvedMessage = message && typeof message === "string" ? message.trim().slice(0, 500) : null;

    // Retry up to 3 times in case of reference ID collision
    let donation = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const donationId = generateDonationId();
        donation = await prisma.donation.create({
          data: {
            id: donationId,
            campaignId: campaign.id,
            donorUserId: user.id,
            amount: numAmount,
            donorName: resolvedDonorName,
            isAnonymous: anonymousBool,
            message: resolvedMessage,
            paymentMethod: "QRIS",
            status: "PENDING_PAYMENT",
          },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                recipientName: true,
                category: true,
              },
            },
          },
        });
        break;
      } catch (e: any) {
        if (e.code === "P2002" && attempt < 2) {
          continue;
        }
        throw e;
      }
    }

    if (!donation) {
      return errorResponse("Gagal membuat kode transaksi donasi.", 500, "GENERATION_FAILED");
    }

    return successResponse("Transaksi donasi berhasil dibuat", { donation }, 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("POST /nutriassist/donations error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat membuat donasi.", 500, "INTERNAL_SERVER_ERROR");
  }
}
