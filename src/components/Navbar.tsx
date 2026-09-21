'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Store, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const { totalItems, subtotal, setIsDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Promo Spesial: Diskon s/d 35% & Bebas Ongkir Se-Indonesia! Gunakan kode: <strong>HEMAT10</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Nusa<span className="text-emerald-600">Mart</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                  Official
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Toko Online Terpercaya & Terlengkap
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari smartwatch, headphone, keyboard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 sm:py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 sm:py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Action Links & Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/orders"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Lacak Pesanan</span>
            </Link>

            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Kelola Toko (Admin)</span>
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 transition-all active:scale-95 group"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                  Keranjang
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {subtotal > 0 ? formatRupiah(subtotal) : 'Rp 0'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
