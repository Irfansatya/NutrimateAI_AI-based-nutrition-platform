export interface SafeAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string | null;
  photo?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  code?: string;
  data?: T;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register user via backend API
 */
export async function apiRegister(
  payload: RegisterPayload
): Promise<ApiResponse<{ user: SafeAuthUser }>> {
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  return res.json();
}

/**
 * Login user via backend API
 */
export async function apiLogin(
  payload: LoginPayload
): Promise<ApiResponse<{ user: SafeAuthUser }>> {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });

  return res.json();
}

/**
 * Get current authenticated user session
 */
export async function apiGetMe(): Promise<ApiResponse<{ user: SafeAuthUser }>> {
  const res = await fetch("/api/v1/auth/me", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });

  return res.json();
}

/**
 * Logout user and clear session cookie
 */
export async function apiLogout(): Promise<ApiResponse<null>> {
  const res = await fetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });

  return res.json();
}
