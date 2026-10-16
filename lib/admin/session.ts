/* Penyimpanan sesi login admin (sessionStorage). */
const SESSION_KEY = 'nmAdm';

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
  } catch (e) {}
};
