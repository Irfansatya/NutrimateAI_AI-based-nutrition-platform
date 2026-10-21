'use client';

import { useState } from 'react';
import { Icon } from '@/component/admin/ui/Icon';
import { apiLogin, apiGetMe, apiLogout } from '@/lib/auth/client';

export const LoginView = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Format email tidak valid.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const loginRes = await apiLogin({
        email: cleanEmail,
        password,
      });

      if (!loginRes.success) {
        setIsLoading(false);
        setError(loginRes.message || 'Email atau kata sandi salah.');
        return;
      }

      // Verify database role is exactly ADMIN
      const meRes = await apiGetMe();
      if (!meRes.success || meRes.data?.user?.role !== 'ADMIN') {
        // Revoke session if user is not ADMIN
        await apiLogout();
        setIsLoading(false);
        setError('Akses ditolak. Akun Anda bukan administrator.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess();
    } catch {
      setIsLoading(false);
      setError('Terjadi gangguan jaringan saat memverifikasi akun admin.');
    }
  };

  return (
    <div className="lg2">
      <div className="lc">
        <div className="mk">
          <svg width="32" height="32" viewBox="0 0 31 32" fill="#05976A">
            <circle cx="10.2" cy="5" r="5" />
            <circle cx="28" cy="14.5" r="3" />
            <path d="M0 27.2c-.3 2.8 1.9 4.9 4.6 4.8.3-6.8 1.6-10.9 2.9-13.1 1-1.7 2.9-2.8 4.8-1.3 2 1.5 3 5.9 4 8.3.6 1.5 2.7 6 7 5.7 3-.2 5.9-1.8 6.9-7.1.4-2-.5-5-4.3-5.2.1 7-2.7 8.7-4.3 6.1-1-1.5-2-5.5-3.2-7.7-2-3.9-4.8-6.5-9.2-5.8C2.6 12.9.4 22.9 0 27.2z" />
          </svg>
        </div>
        <h1>Admin portal</h1>
        <p className="s">Masuk dengan akun admin Anda untuk mulai mengelola platform.</p>

        <form onSubmit={handleSubmit} noValidate>
          <input
            className="in"
            type="email"
            placeholder="Email admin"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="pw">
            <input
              className="in"
              type={showPw ? 'text' : 'password'}
              placeholder="Kata sandi"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              aria-pressed={showPw}
            >
              <Icon name={showPw ? 'eye' : 'eyeoff'} />
            </button>
          </div>

          <div className="em" role="alert">
            {error}
          </div>

          <button className="btn" type="submit" disabled={isLoading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isLoading ? (
              <>
                <span className="adm-spinner" aria-hidden="true" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <small>
          Halaman ini khusus diperuntukkan untuk admin NutrimateAI. Anda wajib memasukkan akun admin yang telah terdaftar.
        </small>
      </div>
    </div>
  );
};
