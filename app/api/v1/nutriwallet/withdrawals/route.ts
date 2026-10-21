import { NextRequest } from "next/server";
import crypto from "crypto";
import { requireUser } from "@/lib/auth/server";
import prisma from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/api/response";
import { calculateUserWalletBalances } from "@/lib/nutriwallet/balances";

function generateWithdrawalId(): string {
  // Format: WD-YYYYMMDD-XXXX (e.g. WD-20261021-9A3F)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `WD-${yyyy}${mm}${dd}-${rand}`;
}

export async function GET() {
  try {
    const user = await requireUser();

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse("Riwayat penarikan berhasil diambil", { withdrawals });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
    }
    console.error("GET /nutriwallet/withdrawals error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server.", 500, "INTERNAL_SERVER_ERROR");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { bankName, accountNumber, accountHolder, amount } = body || {};

    // 1. Validations
    if (!bankName || typeof bankName !== "string" || bankName.trim().length === 0) {
      return errorResponse("Bank tujuan wajib dipilih.", 400, "VALIDATION_ERROR");
    }

    const cleanAccount = String(accountNumber || "").replace(/\D/g, "");
    if (cleanAccount.length < 8 || cleanAccount.length > 16) {
      return errorResponse("Nomor rekening harus 8–16 digit numerik.", 400, "VALIDATION_ERROR");
    }

    if (!accountHolder || typeof accountHolder !== "string" || accountHolder.trim().length < 2) {
      return errorResponse("Nama pemilik rekening harus minimal 2 karakter sesuai buku tabungan.", 400, "VALIDATION_ERROR");
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 50000) {
      return errorResponse("Nominal penarikan minimal Rp 50.000.", 400, "VALIDATION_ERROR");
    }

    // 2. Atomic transaction with row-level locking on Wallet to prevent concurrent over-withdrawals
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Lock the user's wallet row first using SELECT ... FOR UPDATE via Prisma raw query.
      // If wallet does not exist yet, upsert it first so the row exists to lock.
      await tx.wallet.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          recipientName: user.name || "Penerima Bantuan",
          balance: 0,
        },
      });

      // Acquire exclusive row lock on wallets table for this user.
      // Any concurrent withdrawal request for the same user will wait here until this transaction commits.
      await tx.$queryRaw`SELECT id FROM wallets WHERE user_id = ${user.id}::uuid FOR UPDATE`;

      // Calculate current balances inside locked transaction
      const balances = await calculateUserWalletBalances(tx, user.id, user.name);

      if (numAmount > balances.availableBalance) {
        throw new Error("INSUFFICIENT_AVAILABLE_BALANCE");
      }

      // Generate unique withdrawal ID and create record
      let createdWithdrawal = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const wdId = generateWithdrawalId();
          createdWithdrawal = await tx.withdrawal.create({
            data: {
              id: wdId,
              walletId: balances.wallet.id,
              userId: user.id,
              bankName: bankName.trim().slice(0, 128),
              accountNumber: cleanAccount,
              accountHolder: accountHolder.trim().slice(0, 255),
              amount: numAmount,
              status: "PENDING",
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

      if (!createdWithdrawal) {
        throw new Error("FAILED_TO_GENERATE_ID");
      }

      return createdWithdrawal;
    });

    return successResponse("Permohonan penarikan dana berhasil diajukan", { withdrawal }, 201);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return errorResponse("Sesi tidak valid atau telah berakhir.", 401, "UNAUTHORIZED");
      }
      if (err.message === "INSUFFICIENT_AVAILABLE_BALANCE") {
        return errorResponse("Saldo dapat ditarik tidak mencukupi untuk melakukan penarikan ini.", 400, "INSUFFICIENT_BALANCE");
      }
    }
    console.error("POST /nutriwallet/withdrawals error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat mengajukan penarikan.", 500, "INTERNAL_SERVER_ERROR");
  }
}
