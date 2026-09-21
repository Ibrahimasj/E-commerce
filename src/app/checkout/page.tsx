'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  MapPin,
  QrCode,
  Building2,
  Banknote,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SHIPPING_OPTIONS, PAYMENT_METHODS } from '@/data/constants';
import { formatRupiah } from '@/lib/utils';
import { CustomerInfo, ShippingOption, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, voucherCode, clearCart } = useCart();

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Jakarta Selatan',
    postalCode: '12340',
    notes: '',
  });

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    SHIPPING_OPTIONS[0]
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    PAYMENT_METHODS[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If cart is empty, redirect after mount
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const shippingCost = selectedShipping.cost;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validation
    if (!customer.fullName.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setErrorMessage('Mohon lengkapi nama lengkap, nomor WhatsApp/telepon, dan alamat pengiriman.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja Anda kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer,
        items,
        shipping: selectedShipping,
        payment: {
          method: selectedPayment,
          status: 'pending',
        },
        pricing: {
          subtotal,
          shippingCost,
          discountAmount,
          voucherCode: voucherCode || undefined,
          total: grandTotal,
        },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal memproses pesanan.');
      }

      // Order success! Save order to local history, clear cart and redirect
      try {
        const existing = JSON.parse(localStorage.getItem('nusamart_my_orders') || '[]');
        existing.unshift({
          id: json.data.id,
          invoiceNumber: json.data.invoiceNumber,
          createdAt: json.data.createdAt,
          total: json.data.pricing.total,
        });
        localStorage.setItem('nusamart_my_orders', JSON.stringify(existing));
      } catch (e) {
        console.error(e);
      }

      clearCart();
      router.push(`/order-success/${json.data.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi gangguan sistem saat menyimpan pesanan.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/cart" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Keranjang
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">Checkout & Pembayaran</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Formulir Checkout Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi detail pengiriman dan pilih metode pembayaran favorit Anda.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Perhatian:</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer Data */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Informasi Kontak Pemesan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customer.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customer.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="budi@example.com"
                  value={customer.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Alamat Tujuan Pengiriman
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Lengkap & Patokan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Nama jalan, nomor rumah, RT/RW, nomor kamar/lantai, atau patokan terdekat..."
                  value={customer.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customer.city}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={customer.postalCode}
                    onChange={handleInputChange}
                    placeholder="Contoh: 12340"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan untuk Kurir (Opsional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={customer.notes}
                  onChange={handleInputChange}
                  placeholder="Misal: Titipkan ke satpam jika sedang tidak di rumah"
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Courier Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pilih Kurir Pengiriman
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHIPPING_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSelectedShipping(option)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedShipping.id === option.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900">
                      {option.name}
                    </div>
                    <div className="font-black text-emerald-700 text-xs">
                      {formatRupiah(option.cost)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimasi: {option.etd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Payment Method Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                4
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pilih Metode Pembayaran
              </h2>
            </div>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment.id === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            method.type === 'qris'
                              ? 'bg-rose-100 text-rose-600'
                              : method.type === 'va'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {method.type === 'qris' ? (
                            <QrCode className="w-5 h-5" />
                          ) : method.type === 'va' ? (
                            <Building2 className="w-5 h-5" />
                          ) : (
                            <Banknote className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {method.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {method.provider}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/50 text-[11px] text-slate-600 space-y-1">
                        <div className="font-semibold text-emerald-800">Petunjuk Singkat:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {method.instructions.slice(0, 2).map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Pesanan ({items.length} Macam Barang)
            </h3>

            {/* Items list preview */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 space-y-2 pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-2 first:pt-0 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {quantity} x {formatRupiah(product.price)}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {formatRupiah(product.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Barang</span>
                <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Kupon ({voucherCode})</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Biaya Pengiriman ({selectedShipping.courier})</span>
                <span className="font-semibold text-slate-900">{formatRupiah(shippingCost)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-200 items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
                <span className="text-xl font-black text-emerald-700">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Bayar & Konfirmasi Pesanan</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transaksi dienkripsi aman 256-bit SSL</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
