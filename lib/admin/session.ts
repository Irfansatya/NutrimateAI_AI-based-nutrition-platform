/* Penyimpanan bantuan sesi admin (visited pages).
 * Sesi autentikasi admin dikelola via HttpOnly cookie di backend.
 */
const VISITED_PAGES_KEY = 'nmAdmVisited';

export const clearAdminSession = (): void => {
  try {
    sessionStorage.removeItem(VISITED_PAGES_KEY);
  } catch (e) {}
};

export const getVisitedAdminPages = (): string[] => {
  try {
    const raw = sessionStorage.getItem(VISITED_PAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markAdminPageVisited = (pageKey: string): void => {
  try {
    const current = getVisitedAdminPages();
    if (!current.includes(pageKey)) {
      current.push(pageKey);
      sessionStorage.setItem(VISITED_PAGES_KEY, JSON.stringify(current));
    }
  } catch {}
};

