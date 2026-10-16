import { esc } from '@/lib/admin/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const openDocPreview = (name: any) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const isImg = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  const ttl = esc(name.replace(/\.[^.]+$/, '').replace(/_/g, ' '));

  const bodyContent = isImg
    ? `<div class="ph"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#9AA3AE" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 16l-5-5-8 8"/></svg><b>${ttl}</b><span>Gambar ${ext.toUpperCase()}</span></div>`
    : `<div class="pa"><h1>${ttl}</h1><i style="width:70%"></i><i></i><i></i><i style="width:90%"></i><i style="width:55%"></i><br><i></i><i style="width:80%"></i><i></i><i style="width:40%"></i></div>`;

  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(
    name
  )}</title><style>*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:#3B3F44;color:#121517;min-height:100vh}.bar{background:#121517;color:#fff;padding:14px 22px;display:flex;justify-content:space-between;gap:12px;font-size:14px}.bar span{color:#9AA3AE}main{display:grid;place-items:center;padding:28px 16px}.ph{background:#E9ECF1;width:min(760px,100%);aspect-ratio:4/3;border-radius:6px;display:grid;place-content:center;justify-items:center;gap:10px;text-align:center}.ph span{color:#6B7280;font-size:14px}.pa{background:#fff;width:min(700px,100%);min-height:900px;padding:56px 60px;border-radius:4px}.pa h1{font-size:22px;margin:0 0 30px}.pa i{display:block;height:10px;background:#E3E6EC;border-radius:3px;margin:0 0 16px}</style></head><body><div class="bar"><b>${esc(
    name
  )}</b><span>Pratinjau contoh. Berkas asli tampil di sini setelah terhubung ke penyimpanan.</span></div><main>${bodyContent}</main></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 300000);
};
