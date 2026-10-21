import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const admin = await requireRole("ADMIN");
    const { id: donationId } = await context.params;
    const body = await req.json();
    const { decision } = body || {};

    if (!decision || !["CONFIRMED", "REJECTED"].includes(decision)) {
      return errorResponse("Keputusan verifikasi tidak valid (CONFIRMED atau REJECTED).", 400, "INVALID_DECISION");
    }

    if (!donationId) {
      return errorResponse("ID donasi tidak valid.", 400, "VALIDATION_ERROR");
    }

    // Atomic transaction for financial integrity & ledger idempotency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch donation and lock/verify status
      const donation = await tx.donation.findUnique({
        where: { id: donationId },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              recipientName: true,
              creatorUserId: true,
            },
          },
        },
      });

      if (!donation) {
        throw new Error("NOT_FOUND");
      }

      // Strictly accept verification only when donation is currently PENDING_VERIFICATION
      if (donation.status !== "PENDING_VERIFICATION") {
        throw new Error("INVALID_STATUS");
      }

      const now = new Date();

      if (decision === "REJECTED") {
        const updatedDonation = await tx.donation.update({
          where: { id: donationId },
          data: {
            status: "REJECTED",
            verifiedBy: admin.id,
            verifiedAt: now,
          },
        });
        return { donation: updatedDonation, wallet: null };
      }

      // If decision === "CONFIRMED":
      // A. Update donation status to CONFIRMED
      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: {
          status: "CONFIRMED",
          verifiedBy: admin.id,
          verifiedAt: now,
        },
      });

      // B. Identify campaign recipient user
      const recipientUserId = donation.campaign.creatorUserId;

      // C. Upsert recipient's Wallet
      const wallet = await tx.wallet.upsert({
        where: { userId: recipientUserId },
        update: {}, // exists, will update balance next
        create: {
          userId: recipientUserId,
          recipientName: donation.campaign.recipientName,
          balance: new Prisma.Decimal(0),
        },
      });

      // D. Calculate new balance: balance + donation.amount
      const donationAmount = new Prisma.Decimal(donation.amount);
      const newBalance = new Prisma.Decimal(wallet.balance).add(donationAmount);

      // E. Create WalletTransaction ledger entry
      // Strictly protected by @@unique([referenceType, referenceId]) on ("DONATION", donation.id)
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          transactionType: "CREDIT_DONATION",
          amount: donationAmount,
          referenceType: "DONATION",
          referenceId: donation.id,
          description: `Donasi masuk dari ${donation.donorName} untuk kampanye "${donation.campaign.title}" (Ref: ${donation.id})`,
          balanceAfter: newBalance,
        },
      });

      // F. Update Wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
        },
      });

      return { donation: updatedDonation, wallet: updatedWallet };
    });

    const msg =
      decision === "CONFIRMED"
        ? `Pembayaran donasi ${donationId} berhasil dikonfirmasi. Saldo penerima telah dikreditkan.`
        : `Pembayaran donasi ${donationId} telah ditolak.`;

    return successResponse(msg, result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Khusus administrator.", 403, "FORBIDDEN");
      }
      if (err.message === "NOT_FOUND") {
        return errorResponse("Transaksi donasi tidak ditemukan.", 404, "NOT_FOUND");
      }
      if (err.message === "INVALID_STATUS") {
        return errorResponse("Hanya donasi dengan status PENDING_VERIFICATION yang dapat diverifikasi.", 400, "INVALID_STATUS_TRANSITION");
      }
      if ((err as any).code === "P2002") {
        // Unique constraint violation on [referenceType, referenceId]
        return errorResponse("Transaksi donasi ini sudah pernah dikreditkan ke dompet penerima.", 409, "DUPLICATE_LEDGER_ENTRY");
      }
    }
    console.error("POST /admin/donations/:id/verify error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat memverifikasi pembayaran.", 500, "INTERNAL_SERVER_ERROR");
  }
}
