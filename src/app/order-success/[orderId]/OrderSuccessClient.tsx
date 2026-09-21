'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  Copy,
  Check,
  QrCode,
  Truck,
  MapPin,
  CreditCard,
  Building2,
  Banknote,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';

export default function OrderSuccessClient({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copiedVA, setCopiedVA] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  useEffect(() => {
    // Fire confetti celebration on arrival
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopyVA = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setOrder((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          status: 'paid',
          paidAt: new Date().toISOString(),
        },
        orderStatus: 'diproses',
      }));
      setIsSimulatingPayment(false);

      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 800);
  };

  const isPaid = order.payment.status === 'paid';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Top Banner Status */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform ${
            isPaid
              ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20 scale-105'
              : 'bg-teal-100 text-teal-700 shadow-teal-500/20'
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          ) : (
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
          )}
        </div>

        <span
          className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-2 ${
            isPaid
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isPaid ? 'Pembayaran Lunas & Terverifikasi' : 'Menunggu Konfirmasi Pembayaran'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isPaid ? 'Pesanan Berhasil Diproses!' : 'Terima Kasih Atas Pesanan Anda!'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Nomor Invoice:{' '}
          <strong className="text-slate-800 font-mono">{order.invoiceNumber}</strong>
        </p>
      </div>

      {/* Payment Action Box */}
      {!isPaid && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-5 sm:p-8 mb-8 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Metode Pembayaran
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {order.payment.method.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total yang Harus Dibayar:</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatRupiah(order.pricing.total)}
              </span>
            </div>
          </div>

          {/* QRIS Display */}
          {order.payment.method.type === 'qris' && (
            <div className="py-6 flex flex-col items-center text-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block mb-4">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-3 relative">
                  {/* Decorative QR Pattern Mockup */}
                  <div className="absolute inset-3 border-4 border-dashed border-emerald-400/40 rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-white" />
                  </div>
                  <div className="absolute bottom-2 bg-white text-slate-900 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    QRIS NUSAMART
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Scan QRIS di atas menggunakan aplikasi mobile banking atau e-wallet (BCA, GoPay, OVO, Dana, ShopeePay, dll).
              </p>

              <button
                onClick={handleSimulatePayment}
                disabled={isSimulatingPayment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {isSimulatingPayment ? 'Memverifikasi...' : '⚡ Simulasi Konfirmasi Bayar (Demo)'}
              </button>
            </div>
          )}

          {/* Virtual Account Display */}
          {order.payment.method.type === 'va' && (
            <div className="py-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">
                    Nomor Virtual Account
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                    {order.payment.method.accountNumber || '8277 0812 8899 1234'}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    A/N: {order.payment.method.accountName || 'NusaMart E-Commerce'}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleCopyVA(order.payment.method.accountNumber || '8277081288991234')
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-800 hover:border-emerald-500 text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
                >
                  {copiedVA ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Salin Nomor VA</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isSimulatingPayment}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSimulatingPayment ? 'Memverifikasi...' : '⚡ Simulasi Konfirmasi Bayar (Demo)'}
                </button>
              </div>
            </div>
          )}

          {/* COD Notice */}
          {order.payment.method.type === 'cod' && (
            <div className="py-6 text-center space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 max-w-md mx-auto">
                <p className="font-bold mb-1">Pembayaran Tunai di Tempat (COD)</p>
                <p>
                  Harap siapkan uang tunai sejumlah{' '}
                  <strong className="text-sm font-bold text-slate-900">
                    {formatRupiah(order.pricing.total)}
                  </strong>{' '}
                  kepada kurir {order.shipping.courier} saat paket tiba di alamat Anda.
                </p>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isSimulatingPayment}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                {isSimulatingPayment ? 'Memverifikasi...' : '⚡ Simulasi Konfirmasi COD Selesai (Demo)'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invoice Breakdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Invoice Header */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Faktur Resmi NusaMart
            </div>
            <div className="text-xl sm:text-2xl font-black">{order.invoiceNumber}</div>
            <div className="text-xs text-slate-400 mt-1">
              Waktu Transaksi: {formatDateIndo(order.createdAt)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Invoice</span>
            </button>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Tujuan Pengiriman
            </h4>
            <div className="space-y-0.5 text-slate-600">
              <p className="font-bold text-slate-800 text-sm">{order.customer.fullName}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.postalCode}</p>
              {order.customer.notes && (
                <p className="text-slate-400 italic mt-1">Catatan: &quot;{order.customer.notes}&quot;</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Informasi Kurir & Ekspedisi
            </h4>
            <div className="space-y-1 text-slate-600">
              <p className="font-bold text-slate-800 text-sm">
                {order.shipping.name} ({order.shipping.service})
              </p>
              <p>Estimasi Tiba: {order.shipping.etd}</p>
              <p>Biaya Kirim: {formatRupiah(order.shipping.cost)}</p>
              <p className="inline-block px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                Status Pesanan: {order.orderStatus.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 sm:p-8">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-4">
            Rincian Barang Dipesan
          </h4>

          <div className="divide-y divide-slate-100">
            {order.items.map(({ product, quantity }) => (
              <div key={product.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {quantity} x {formatRupiah(product.price)}
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-900 flex-shrink-0">
                  {formatRupiah(product.price * quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(order.pricing.subtotal)}
              </span>
            </div>

            {order.pricing.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon Kupon ({order.pricing.voucherCode})</span>
                <span>-{formatRupiah(order.pricing.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Biaya Pengiriman</span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(order.pricing.shippingCost)}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 items-baseline text-sm font-bold text-slate-900">
              <span>Total Tagihan</span>
              <span className="text-base font-black text-emerald-700">
                {formatRupiah(order.pricing.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Belanja Lagi di Katalog</span>
          </Link>

          <Link
            href="/admin"
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Lihat di Dashboard Admin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
