import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { hashPassword, createServerSession } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body || {};

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return errorResponse("Nama lengkap wajib diisi minimal 2 karakter.", 400, "VALIDATION_ERROR");
    }

    if (!email || typeof email !== "string") {
      return errorResponse("Format email tidak valid.", 400, "VALIDATION_ERROR");
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return errorResponse("Format email tidak valid.", 400, "VALIDATION_ERROR");
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return errorResponse("Kata sandi minimal 8 karakter.", 400, "VALIDATION_ERROR");
    }

    if (password.length > 128) {
      return errorResponse("Kata sandi maksimal 128 karakter.", 400, "VALIDATION_ERROR");
    }

    // 2. Check for duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing) {
      return errorResponse("Email sudah terdaftar. Silakan gunakan email lain atau masuk.", 409, "EMAIL_EXISTS");
    }

    // 3. Hash password and persist user + optional profile atomically
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: "USER", // Protected: never accept role from input
          status: "ACTIVE",
        },
      });

      if (phone && typeof phone === "string" && phone.trim().length > 0) {
        await tx.userProfile.create({
          data: {
            userId: user.id,
            phoneNumber: phone.trim(),
          },
        });
      }

      return user;
    });

    // 4. Create server session
    await createServerSession(newUser.id);

    return successResponse(
      "Pendaftaran berhasil",
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
      },
      201
    );
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      const target = (err as { meta?: { target?: string[] | string } }).meta?.target;
      const isEmailTarget =
        Array.isArray(target) ? target.includes("email") : target === "email" || typeof target === "string" && target.includes("email");

      if (isEmailTarget || !target) {
        return errorResponse(
          "Email sudah terdaftar. Silakan gunakan email lain atau masuk.",
          409,
          "EMAIL_EXISTS"
        );
      }
    }

    console.error("Register API error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat pendaftaran.", 500, "INTERNAL_SERVER_ERROR");
  }
}
