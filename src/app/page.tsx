import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Truck, CreditCard, Sparkles } from 'lucide-react';
import { getProducts } from '@/lib/db';
import CatalogSection from '@/components/CatalogSection';

export const revalidate = 0; // Fresh products on each request

export default async function HomePage() {
  const products = await getProducts();
  const featuredProduct = products.find((p) => p.featured) || products[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 pb-8 sm:pb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-2xl p-6 sm:p-10 lg:p-14">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Koleksi Terkini & Paling Populer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
                Belanja Praktis, Cepat & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">100% Terpercaya</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed">
                Temukan pilihan gadget canggih, audio premium, hingga fashion kasual modern dengan harga bersahabat dan proteksi garansi resmi di NusaMart.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#katalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-102 active:scale-98 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mulai Belanja</span>
                </Link>

                <Link
                  href={featuredProduct ? `/products/${featuredProduct.id}` : '#katalog'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-2xl backdrop-blur-xs hover:scale-102 active:scale-98 transition-all"
                >
                  <span>Lihat Produk Unggulan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Badges Highlights */}
              <div className="pt-4 sm:pt-6 border-t border-slate-700/60 grid grid-cols-3 gap-4 text-slate-300">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">5.000+</div>
                  <div className="text-[11px] text-slate-400">Pelanggan Aktif</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-400">Garansi Original</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">4.9 / 5.0</div>
                  <div className="text-[11px] text-slate-400">Ulasan Positif</div>
                </div>
              </div>
            </div>

            {/* Right Card Showcase */}
            {featuredProduct && (
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-5 shadow-2xl">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 mb-4">
                    <Image
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-rose-500 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                      Promo Spesial
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      {featuredProduct.category}
                    </div>
                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {featuredProduct.name}
                    </h3>
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-2">
                          Rp {featuredProduct.originalPrice?.toLocaleString('id-ID')}
                        </span>
                        <span className="text-lg font-black text-emerald-300">
                          Rp {featuredProduct.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <Link
                        href={`/products/${featuredProduct.id}`}
                        className="p-2 rounded-xl bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors"
                        title="Detail Produk"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Bebas Ongkir</div>
            <div className="text-[11px] text-slate-500">Min. belanja Rp 200rb</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Pengiriman Kilat</div>
            <div className="text-[11px] text-slate-500">GoSend & SiCepat BEST</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Bayar Mudah</div>
            <div className="text-[11px] text-slate-500">QRIS, VA Bank & COD</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Garansi Toko</div>
            <div className="text-[11px] text-slate-500">30 Hari Ganti Baru</div>
          </div>
        </div>
      </div>

      {/* Interactive Catalog Section */}
      <Suspense fallback={<div className="py-16 text-center text-slate-400">Memuat Katalog Produk...</div>}>
        <CatalogSection initialProducts={products} />
      </Suspense>
    </div>
  );
}
