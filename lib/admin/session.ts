/* Penyimpanan sesi login admin (sessionStorage). */
const SESSION_KEY = 'nmAdm';
const VISITED_PAGES_KEY = 'nmAdmVisited';

export const hasAdminSession = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (e) {
    return false;
  }
};

export const saveAdminSession = (): void => {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch (e) {}
};

export const clearAdminSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
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

