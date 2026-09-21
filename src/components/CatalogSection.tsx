'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles, RefreshCw, Tag, Copy, Check } from 'lucide-react';
import { Product } from '@/types';
import { CATEGORIES } from '@/data/constants';
import ProductCard from './ProductCard';
import { useCart } from '@/context/CartContext';

interface CatalogSectionProps {
  initialProducts: Product[];
}

export default function CatalogSection({ initialProducts }: CatalogSectionProps) {
  const searchParams = useSearchParams();
  const { applyVoucher } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sync category or search from URL parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat as any)) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    applyVoucher(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'Semua' ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('Semua');
    setSearchQuery('');
    setSortBy('recommended');
  };

  return (
    <section id="katalog" className="py-12 sm:py-16">
      {/* Vouchers / Promo Strip */}
      <div className="mb-10 p-4 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 rounded-3xl border border-emerald-200/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Klaim Voucher Diskon Spesial Hari Ini!
              </h3>
              <p className="text-xs text-slate-500">
                Klik kode voucher untuk otomatis menyalin dan memasangnya di keranjang.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => handleCopyVoucher('HEMAT10')}
              className="flex-1 sm:flex-initial flex items-center justify-between gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-slate-800 hover:border-emerald-500 hover:shadow-xs transition-all active:scale-95"
            >
              <div className="text-left">
                <span className="block text-[10px] text-emerald-600 font-semibold uppercase">Kupon 10%</span>
                <span className="font-mono text-xs">HEMAT10</span>
              </div>
              {copiedCode === 'HEMAT10' ? (
                <span className="flex items-center gap-1 text-emerald-600 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Dipakai
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => handleCopyVoucher('DISKON50')}
              className="flex-1 sm:flex-initial flex items-center justify-between gap-2.5 px-3.5 py-2 bg-white rounded-xl border border-indigo-300 text-xs font-bold text-slate-800 hover:border-indigo-500 hover:shadow-xs transition-all active:scale-95"
            >
              <div className="text-left">
                <span className="block text-[10px] text-indigo-600 font-semibold uppercase">Potongan 50rb</span>
                <span className="font-mono text-xs">DISKON50</span>
              </div>
              {copiedCode === 'DISKON50' ? (
                <span className="flex items-center gap-1 text-emerald-600 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Dipakai
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Header & Filter Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Pilihan Produk Terbaik
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Katalog Produk Unggulan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Temukan berbagai produk berkualitas dengan harga terbaik dan jaminan kepuasan pelanggan.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search within catalog */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau spesifikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {filteredProducts.length} Produk Ditemukan
            </span>

            {/* Sort Selector */}
            <div className="relative flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer pr-2"
              >
                <option value="recommended">Rekomendasi</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Termahal</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Produk Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Tidak ada produk yang sesuai dengan filter atau kata kunci &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
