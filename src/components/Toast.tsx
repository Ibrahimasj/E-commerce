'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { toast, hideToast, setIsDrawerOpen } = useCart();

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-white text-slate-900 border border-emerald-200 shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
      {toast.productImage ? (
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
          <Image
            src={toast.productImage}
            alt="Produk"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Berhasil Ditambahkan
        </div>
        <p className="text-xs font-medium text-slate-700 line-clamp-1 mt-0.5">
          {toast.message}
        </p>
        <button
          onClick={() => {
            hideToast();
            setIsDrawerOpen(true);
          }}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1 mt-1"
        >
          <ShoppingBag className="w-3 h-3" />
          Lihat Keranjang
        </button>
      </div>

      <button
        onClick={hideToast}
        aria-label="Tutup notifikasi"
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
