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
    const { id: withdrawalId } = await context.params;

    if (!withdrawalId) {
      return errorResponse("ID penarikan tidak valid.", 400, "VALIDATION_ERROR");
    }

    // Atomic transaction for financial integrity & ledger idempotency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch withdrawal with wallet
      const withdrawal = await tx.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          wallet: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!withdrawal) {
        throw new Error("NOT_FOUND");
      }

      // Strictly accept completion only when status is currently PENDING
      if (withdrawal.status !== "PENDING") {
        throw new Error("INVALID_STATUS");
      }

      const now = new Date();
      const wdAmount = new Prisma.Decimal(withdrawal.amount);

      // Verify wallet has enough actual balance before debit
      const currentWalletBalance = new Prisma.Decimal(withdrawal.wallet.balance);
      if (currentWalletBalance.lessThan(wdAmount)) {
        throw new Error("INSUFFICIENT_WALLET_BALANCE");
      }

      const newBalance = currentWalletBalance.minus(wdAmount);

      // 2. Update withdrawal status to COMPLETED
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "COMPLETED",
          processedBy: admin.id,
          processedAt: now,
        },
      });

      // 3. Create WalletTransaction ledger entry
      // Strictly protected by @@unique([referenceType, referenceId]) on ("WITHDRAWAL", withdrawal.id)
      await tx.walletTransaction.create({
        data: {
          walletId: withdrawal.walletId,
          transactionType: "DEBIT_WITHDRAWAL",
          amount: wdAmount,
          referenceType: "WITHDRAWAL",
          referenceId: withdrawal.id,
          description: `Pencairan dana ke ${withdrawal.bankName} No. ${withdrawal.accountNumber} a.n. ${withdrawal.accountHolder} (Ref: ${withdrawal.id})`,
          balanceAfter: newBalance,
        },
      });

      // 4. Debit the Wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balance: newBalance,
        },
      });

      return { withdrawal: updatedWithdrawal, wallet: updatedWallet };
    });

    return successResponse(
      `Pencairan dana ${withdrawalId} berhasil diselesaikan. Saldo dompet penerima telah didebit.`,
      result
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "FORBIDDEN") {
        return errorResponse("Akses ditolak. Khusus administrator.", 403, "FORBIDDEN");
      }
      if (err.message === "NOT_FOUND") {
        return errorResponse("Permohonan penarikan dana tidak ditemukan.", 404, "NOT_FOUND");
      }
      if (err.message === "INVALID_STATUS") {
        return errorResponse("Hanya permohonan dengan status PENDING yang dapat diselesaikan.", 400, "INVALID_STATUS_TRANSITION");
      }
      if (err.message === "INSUFFICIENT_WALLET_BALANCE") {
        return errorResponse("Saldo dompet tidak mencukupi untuk menyelesaikan pencairan ini.", 400, "INSUFFICIENT_WALLET_BALANCE");
      }
      if ((err as any).code === "P2002") {
        // Unique constraint violation on [referenceType, referenceId]
        return errorResponse("Pencairan dana ini sudah pernah didebit dari buku besar dompet.", 409, "DUPLICATE_LEDGER_ENTRY");
      }
    }
    console.error("POST /admin/withdrawals/:id/complete error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat menyelesaikan penarikan.", 500, "INTERNAL_SERVER_ERROR");
  }
}
