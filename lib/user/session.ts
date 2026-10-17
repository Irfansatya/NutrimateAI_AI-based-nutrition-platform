/* User authentication prototype session and storage management.
 * WARNING: Storing credentials in localStorage/sessionStorage is for frontend prototype only.
 * Production must use secure backend sessions with HTTP-only cookies and hashed passwords.
 */
import { INITIAL_USERS, type UserAccount } from './data/users';

const USERS_STORAGE_KEY = 'nm_users';
const USER_SESSION_KEY = 'nmUser'; // Kept strictly separate from Admin's 'nmAdm'

const isBrowser = (): boolean => typeof window !== 'undefined';

export const getUsers = (): UserAccount[] => {
  if (!isBrowser()) return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return parsed;
  } catch {
    return INITIAL_USERS;
  }
};

export const registerUser = (
  userData: Omit<UserAccount, 'id' | 'role'>
): { success: boolean; error?: string; user?: UserAccount } => {
  if (!isBrowser()) return { success: false, error: 'Lingkungan browser tidak tersedia.' };

  try {
    const users = getUsers();
    const cleanEmail = userData.email.trim().toLowerCase();

    const exists = users.some((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone.trim(),
      password: userData.password,
      role: 'Pengguna NutrimateAI',
      photo: userData.photo || null,
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return { success: true, user: newUser };
  } catch {
    return { success: false, error: 'Gagal menyimpan data pengguna ke penyimpanan lokal.' };
  }
};

export const authenticateUser = (
  email: string,
  password: string
): { success: boolean; error?: string; user?: UserAccount } => {
  if (!isBrowser()) return { success: false, error: 'Lingkungan browser tidak tersedia.' };

  try {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();

    const matched = users.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail && u.password === password
    );

    if (!matched) {
      return { success: false, error: 'Email atau kata sandi tidak cocok.' };
    }

    return { success: true, user: matched };
  } catch {
    return { success: false, error: 'Terjadi kesalahan saat memproses data akun.' };
  }
};

export const saveUserSession = (userId: string): void => {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(USER_SESSION_KEY, userId);
  } catch {}
};

export const getUserSession = (): string | null => {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem(USER_SESSION_KEY);
  } catch {
    return null;
  }
};

export const hasUserSession = (): boolean => {
  return Boolean(getUserSession());
};

export const clearUserSession = (): void => {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(USER_SESSION_KEY);
  } catch {}
};

export const getCurrentUser = (): UserAccount | null => {
  const activeId = getUserSession();
  if (!activeId) return null;
  const users = getUsers();
  return users.find((u) => u.id === activeId) || null;
};
