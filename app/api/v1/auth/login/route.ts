import { NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyPassword, createServerSession, DUMMY_PASSWORD_HASH } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return errorResponse("Email dan kata sandi wajib diisi.", 400, "VALIDATION_ERROR");
    }

    if (password.length > 128) {
      return errorResponse("Email atau kata sandi tidak valid.", 401, "INVALID_CREDENTIALS");
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // 2. Normalize timing: perform dummy scrypt verification when email is not found
    if (!user) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return errorResponse("Email atau kata sandi tidak valid.", 401, "INVALID_CREDENTIALS");
    }

    // 3. Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Email atau kata sandi tidak valid.", 401, "INVALID_CREDENTIALS");
    }

    // 4. Verify account status and soft delete
    if (user.status !== "ACTIVE" || user.deletedAt !== null) {
      return errorResponse("Akun Anda sedang dinonaktifkan atau ditangguhkan.", 403, "ACCOUNT_SUSPENDED");
    }

    // 5. Create server-side session and set cookie
    await createServerSession(user.id);

    return successResponse("Masuk berhasil", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err: unknown) {
    console.error("Login API error:", err instanceof Error ? err.message : "Unknown");
    return errorResponse("Terjadi kesalahan pada server saat autentikasi.", 500, "INTERNAL_SERVER_ERROR");
  }
}
