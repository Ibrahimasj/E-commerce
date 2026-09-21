'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Store, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as customer, redirect to dashboard
  React.useEffect(() => {
    if (user && user.role === 'customer') {
      router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password, 'customer');
    if (res.success) {
      router.push('/user/dashboard');
    } else {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  const handleDemoCustomerLogin = async () => {
    setEmail('budi@gmail.com');
    setPassword('user123');
    setLoading(true);
    setErrorMsg(null);

    const res = await login('budi@gmail.com', 'user123', 'customer');
    if (res.success) {
      router.push('/user/dashboard');
    } else {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Akun Anda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status pesanan dan nikmati kemudahan berbelanja di NusaMart.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoCustomerLogin}
          className="w-full mb-5 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>⚡ Masuk Akun Demo (Budi Santoso)</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
            <span className="bg-white px-2">Atau masuk manual</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email / Nama Akun / Nomor WhatsApp
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: nama@email.com atau nama akun"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
          <div>
            Belum memiliki akun?{' '}
            <Link href="/register" className="font-bold text-emerald-600 hover:underline">
              Daftar Akun Baru
            </Link>
          </div>
          <div className="text-[11px] text-slate-400">
            Pengelola toko?{' '}
            <Link href="/admin/login" className="font-semibold text-slate-600 hover:text-emerald-600 hover:underline">
              Masuk ke Portal Admin Toko &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
