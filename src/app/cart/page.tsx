'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/utils';
import { PROMO_CODES } from '@/data/constants';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
    voucherCode,
    discountAmount,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [voucherFeedback, setVoucherFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const result = applyVoucher(inputCode.trim());
    if (result.success) {
      setVoucherFeedback({ type: 'success', message: result.message });
      setInputCode('');
    } else {
      setVoucherFeedback({ type: 'error', message: result.message });
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Keranjang Belanja Kosong
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Belum ada produk yang Anda tambahkan ke dalam keranjang. Yuk, cek berbagai penawaran menarik di katalog kami!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mulai Belanja Sekarang</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Periksa kembali barang belanjaan Anda sebelum melanjutkan ke tahap pembayaran.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="self-start sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Kosongkan Keranjang</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between">
              <span>Produk ({totalItems} item)</span>
              <span>Subtotal</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 sm:p-6 flex gap-4 items-start sm:items-center">
                  {/* Image */}
                  <Link
                    href={`/products/${product.id}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="block text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs font-semibold text-slate-500 mt-1">
                      Harga Satuan: {formatRupiah(product.price)}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                          aria-label="Kurangi kuantitas"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                          aria-label="Tambah kuantitas"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-slate-400 hover:text-rose-500 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtotal Item */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {formatRupiah(product.price * quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tambah Barang Lainnya dari Katalog</span>
          </Link>
        </div>

        {/* Order Summary & Voucher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Voucher Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Kode Promo / Voucher</h3>
            </div>

            {voucherCode ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Voucher Terpasang: {voucherCode}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Hemat {formatRupiah(discountAmount)}
                  </p>
                </div>
                <button
                  onClick={removeVoucher}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyVoucher} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: HEMAT10"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2 text-xs uppercase font-bold tracking-wider bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Terapkan
                  </button>
                </div>

                {voucherFeedback && (
                  <div
                    className={`text-xs flex items-center gap-1.5 p-2 rounded-lg ${
                      voucherFeedback.type === 'success'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-rose-700 bg-rose-50'
                    }`}
                  >
                    {voucherFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span>{voucherFeedback.message}</span>
                  </div>
                )}
              </form>
            )}

            {/* Quick Available Promo Pills */}
            <div className="pt-3 border-t border-slate-100 mt-4 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Voucher Tersedia:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(PROMO_CODES).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setInputCode(code);
                      applyVoucher(code);
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Belanja
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Harga ({totalItems} barang)</span>
                <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Promo ({voucherCode})</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span className="text-slate-500 italic">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="block text-xs font-medium text-slate-500">Total Tagihan</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatRupiah(finalTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-98"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tersedia pilihan kurir JNE, SiCepat, dan GoSend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
