'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin panel
  React.useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password, 'admin');
    if (res.success) {
      router.refresh();
      router.push('/admin');
    } else {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setEmail('admin@nusamart.com');
    setPassword('admin123');
    setLoading(true);
    setErrorMsg(null);

    const res = await login('admin@nusamart.com', 'admin123', 'admin');
    if (res.success) {
      router.refresh();
      router.push('/admin');
    } else {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-900/5">
      <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Internal Area
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
            Portal Admin Toko
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Khusus pengelola & staf toko NusaMart untuk manajemen omset dan pesanan.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes('Pelanggan') && (
              <Link
                href="/login"
                className="self-start inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] hover:bg-emerald-400 transition-colors"
              >
                <span>Buka Login Pelanggan &rarr;</span>
              </Link>
            )}
          </div>
        )}

        {/* Demo Admin Button */}
        <button
          type="button"
          onClick={handleDemoAdminLogin}
          className="w-full mb-5 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Sparkles className="w-4 h-4" />
          <span>⚡ Masuk Akun Demo Admin (1-Klik)</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
            <span className="bg-slate-900 px-2">Atau masukkan kredensial</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Email Administrator
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@nusamart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-400 outline-none"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Password Administrator
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-400 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{loading ? 'Mengautentikasi...' : 'Masuk Portal Pengelola'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-500">
          Bukan pengelola toko?{' '}
          <Link href="/" className="font-bold text-emerald-400 hover:underline">
            Kembali ke Toko Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
