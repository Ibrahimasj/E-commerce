'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Truck, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsDrawerOpen } = useCart();
  const { user } = useAuth();

  const accountHref = user
    ? user.role === 'admin'
      ? '/admin'
      : '/user/dashboard'
    : '/login';

  const isAccountActive =
    pathname === '/user/dashboard' || pathname === '/login' || pathname === '/register';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            pathname === '/' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </Link>

        <Link
          href="/#katalog"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            pathname.startsWith('/products') ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Katalog</span>
        </Link>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 text-slate-500 hover:text-emerald-600 transition-colors"
          aria-label="Buka Keranjang"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Keranjang</span>
        </button>

        <Link
          href="/orders"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            pathname === '/orders' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Lacak</span>
        </Link>

        <Link
          href={accountHref}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isAccountActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{user ? 'Akun Saya' : 'Masuk'}</span>
        </Link>
      </div>
    </nav>
  );
}
