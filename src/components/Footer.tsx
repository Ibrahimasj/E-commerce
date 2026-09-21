import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, Headphones, RotateCcw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 sm:pb-12 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Produk Original</h4>
              <p className="text-xs text-slate-400 mt-1">Jaminan produk asli langsung dari distributor resmi.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pengiriman Cepat</h4>
              <p className="text-xs text-slate-400 mt-1">Mendukung kurir kilat & same-day se-Indonesia.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garansi Retur 30 Hari</h4>
              <p className="text-xs text-slate-400 mt-1">Belanja tanpa ragu dengan jaminan tukar barang baru.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Layanan CS 24/7</h4>
              <p className="text-xs text-slate-400 mt-1">Tim dukungan pelanggan siap membantu Anda kapan saja.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 font-black">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Nusa<span className="text-emerald-400">Mart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Platform e-commerce modern yang menyediakan perlengkapan teknologi, gadget, audio, dan gaya hidup berkualitas tinggi untuk masyarakat Indonesia.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Sistem Aktif & Terverifikasi
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Kategori Produk</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/?category=Elektronik" className="hover:text-emerald-400 transition-colors">Elektronik & Setup</Link></li>
              <li><Link href="/?category=Gadget" className="hover:text-emerald-400 transition-colors">Gadget & Smartwatch</Link></li>
              <li><Link href="/?category=Audio" className="hover:text-emerald-400 transition-colors">Headphone & Audio TWS</Link></li>
              <li><Link href="/?category=Fashion" className="hover:text-emerald-400 transition-colors">Fashion & Ransel</Link></li>
              <li><Link href="/?category=Aksesoris" className="hover:text-emerald-400 transition-colors">Aksesoris & Charger</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Bantuan & Panduan</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/cart" className="hover:text-emerald-400 transition-colors">Keranjang Belanja</Link></li>
              <li><Link href="/checkout" className="hover:text-emerald-400 transition-colors">Formulir Checkout</Link></li>
              <li><Link href="/orders" className="hover:text-emerald-400 transition-colors">Lacak Status Pesanan</Link></li>
              <li><Link href="/user/dashboard" className="hover:text-emerald-400 transition-colors">Akun & Pesanan Saya</Link></li>
              <li><Link href="/admin/login" className="text-slate-500 hover:text-emerald-400 transition-colors text-[11px]">Portal Pengelola Toko</Link></li>
              <li><span className="cursor-pointer hover:text-emerald-400 transition-colors">Syarat & Ketentuan</span></li>
              <li><span className="cursor-pointer hover:text-emerald-400 transition-colors">Kebijakan Privasi</span></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Metode Pembayaran Aman</h4>
            <p className="text-xs text-slate-400 mb-3">
              Menerima pembayaran instan via QRIS Nasional, Bank Virtual Account (BCA, Mandiri, BRI), serta Bayar di Tempat (COD).
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">QRIS</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">BCA VA</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">Mandiri VA</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">BRI VA</span>
              <span className="px-2 py-1 bg-slate-800 rounded-md border border-slate-700">COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Attribution */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} NusaMart E-Commerce. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> menggunakan Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
