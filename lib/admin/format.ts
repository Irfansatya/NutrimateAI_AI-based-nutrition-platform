/* Format tampilan dan perhitungan donasi. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatRupiah = (n: any) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatDaysAgo = (d: any) => (d < 1 ? 'Hari ini' : `${d} hari lalu`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTotalCost = (p: any) => p.items.reduce((a: any, x: any) => a + x.c, 0);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProgressPercent = (p: any) => Math.min(100, Math.round((p.col / getTotalCost(p)) * 100));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRecipientLabel = (p: any) => `${p.nm} (${p.ket})`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const esc = (s: any) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)
  );
