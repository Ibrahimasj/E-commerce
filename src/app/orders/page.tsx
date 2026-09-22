'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight,
  Receipt,
  User,
  ShoppingBag,
  Loader2,
  CreditCard,
} from 'lucide-react';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';

function OrdersContent() {
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);

  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  // Ambil daftar pesanan dari GET /api/orders saat user login
  const fetchUserOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders?t=' + Date.now());
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUserOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch user orders from /api/orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserOrders();
    }
  }, [user, authLoading]);

  // Handler pembayaran Midtrans Snap
  const handlePayNow = async (orderId: string, invoiceNumber?: string) => {
    setPayingOrderId(orderId);
    try {
      const res = await fetch('/api/payment/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();

      if (
        json.success &&
        json.token &&
        typeof window !== 'undefined' &&
        (window as any).snap
      ) {
        (window as any).snap.pay(json.token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            fetchUserOrders();
            if (invoiceNumber) fetchOrder(invoiceNumber);
            else fetchOrder(orderId);
            setPayingOrderId(null);
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            fetchUserOrders();
            if (invoiceNumber) fetchOrder(invoiceNumber);
            else fetchOrder(orderId);
            setPayingOrderId(null);
          },
          onError: (err: any) => {
            console.error('Payment error:', err);
            setPayingOrderId(null);
          },
          onClose: () => {
            console.log('Payment modal closed');
            setPayingOrderId(null);
          },
        });
      } else {
        alert(json.message || 'Gagal memanggil popup pembayaran Midtrans.');
        setPayingOrderId(null);
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      alert('Terjadi kesalahan saat memproses pembayaran.');
      setPayingOrderId(null);
    }
  };

  // Handle URL query parameter ?invoice=... atau ?id=...
  useEffect(() => {
    const queryParam = searchParams.get('invoice') || searchParams.get('id');
    if (queryParam) {
      setInvoiceQuery(queryParam);
      fetchOrder(queryParam);
    }
  }, [searchParams]);

  const fetchOrder = async (query: string) => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setNotFoundError(false);
    setSearchedOrder(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSearchedOrder(json.data);
      } else {
        setNotFoundError(true);
      }
    } catch (err) {
      console.error(err);
      setNotFoundError(true);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(invoiceQuery);
  };

  // Timeline Step calculation
  const getStepStatus = (order: Order) => {
    const isPaid = order.payment.status === 'paid';
    const status = order.orderStatus;

    // 1: Dibuat, 2: Bayar, 3: Diproses, 4: Dikirim, 5: Selesai
    let currentStep = 1;
    if (isPaid || status === 'diproses' || status === 'dikirim' || status === 'selesai') {
      currentStep = 2;
    }
    if (status === 'diproses') currentStep = 3;
    if (status === 'dikirim') currentStep = 4;
    if (status === 'selesai') currentStep = 5;

    return currentStep;
  };

  const currentStep = searchedOrder ? getStepStatus(searchedOrder) : 1;

  const steps = [
    { number: 1, title: 'Pesanan Dibuat', desc: 'Menunggu proses pembayaran' },
    { number: 2, title: 'Pembayaran Dikonfirmasi', desc: 'Dana berhasil terverifikasi' },
    { number: 3, title: 'Sedang Dikemas', desc: 'Penjual sedang menyiapkan barang' },
    { number: 4, title: 'Sedang Dikirim', desc: 'Paket diserahkan ke kurir' },
    { number: 5, title: 'Pesanan Selesai', desc: 'Barang telah tiba di tujuan' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Midtrans Snap JS Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Lacak Status & Riwayat Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ketahui status konfirmasi pembayaran dan posisi pengiriman pesanan Anda secara real-time.
        </p>

        {/* Invoice Search Input */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Masukkan Nomor Invoice (Contoh: INV-20260922-1386)"
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-2xl shadow-xs focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loadingSearch}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loadingSearch ? 'Mencari...' : 'Lacak'}</span>
          </button>
        </form>
      </div>

      {/* Not Found State */}
      {notFoundError && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center max-w-md mx-auto shadow-xs my-6">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Pesanan Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Pastikan nomor invoice atau ID pesanan yang Anda masukkan sudah benar (Contoh: INV-20260922-1386).
          </p>
        </div>
      )}

      {/* Searched Order Live Tracking Detail Card */}
      {searchedOrder && (
        <div className="mb-12 space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                  Informasi Status Pesanan
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {searchedOrder.invoiceNumber}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dipesan pada: {formatDateIndo(searchedOrder.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/order-success/${searchedOrder.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Lihat Faktur / Invoice</span>
                </Link>
              </div>
            </div>

            {/* Visual Tracking Progress Timeline */}
            <div className="py-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                Progres Pengiriman & Konfirmasi
              </h4>

              <div className="relative">
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-1 bg-emerald-600 transition-all duration-500"
                    style={{
                      width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                  {steps.map((step) => {
                    const isPassed = currentStep >= step.number;
                    const isCurrent = currentStep === step.number;

                    return (
                      <div
                        key={step.number}
                        className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            step.number
                          )}
                        </div>

                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isPassed ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status Highlight Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Status Pengiriman: {searchedOrder.orderStatus.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    Dikirim menggunakan <strong>{searchedOrder.shipping?.name || 'Kurir Reguler'}</strong> ({searchedOrder.shipping?.etd || '1-3 hari'})
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <div className="sm:text-right">
                  <span className="text-[11px] text-emerald-700 block">Status Pembayaran:</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      searchedOrder.payment.status === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {searchedOrder.payment.status === 'paid' ? 'Lunas / Terverifikasi' : 'Belum Dibayar'}
                  </span>
                </div>
                {searchedOrder.payment.status !== 'paid' && (
                  <button
                    onClick={() => handlePayNow(searchedOrder.id, searchedOrder.invoiceNumber)}
                    disabled={payingOrderId === searchedOrder.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    {payingOrderId === searchedOrder.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menghubungkan...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Sekarang</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            {/* Customer & Address (5 cols) */}
            <div className="sm:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-xs space-y-4">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Alamat Pengiriman
                </h4>
                <div className="space-y-0.5 text-slate-600">
                  <p className="font-bold text-sm text-slate-900">
                    {searchedOrder.customer.fullName}
                  </p>
                  <p>{searchedOrder.customer.phone}</p>
                  <p>{searchedOrder.customer.address}</p>
                  <p>
                    {searchedOrder.customer.city}, {searchedOrder.customer.postalCode}
                  </p>
                  {searchedOrder.customer.notes && (
                    <p className="text-slate-400 italic mt-1">
                      Catatan: &quot;{searchedOrder.customer.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Metode Pembayaran
                </h4>
                <p className="font-semibold text-slate-800">
                  {searchedOrder.payment.method?.name || 'Metode Pembayaran'}
                </p>
              </div>
            </div>

            {/* Items Table (7 cols) */}
            <div className="sm:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-xs space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                Barang yang Dipesan ({searchedOrder.items.length} item)
              </h4>

              <div className="divide-y divide-slate-100">
                {searchedOrder.items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <Image src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {quantity} x {formatRupiah(product.price)}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 flex-shrink-0">
                      {formatRupiah(product.price * quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(searchedOrder.pricing.subtotal)}
                  </span>
                </div>
                {searchedOrder.pricing.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Potongan Voucher</span>
                    <span>-{formatRupiah(searchedOrder.pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ongkos Kirim ({searchedOrder.shipping?.courier || 'Kurir'})</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(searchedOrder.pricing.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-700 font-black">
                    {formatRupiah(searchedOrder.pricing.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* Riwayat Pesanan User dari GET /api/orders (Prisma DB)   */}
      {/* ======================================================= */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Riwayat Pesanan Anda (Database Prisma)
            </h2>
          </div>
          {user && (
            <span className="text-xs font-semibold text-slate-500">
              {userOrders.length} Pesanan Terdaftar
            </span>
          )}
        </div>

        {!authLoading && !user ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Masuk ke Akun Anda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Masuk untuk melihat seluruh riwayat pesanan yang pernah Anda buat di NusaMart secara terpusat.
            </p>
            <Link
              href="/login?redirect=/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : loadingOrders ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Memuat data pesanan dari database...</span>
          </div>
        ) : userOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Belum Ada Pesanan
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Anda belum pernah melakukan pemesanan. Yuk, temukan produk terbaik di katalog toko kami!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((ord) => {
              const isPaid = ord.payment.status === 'paid';
              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {ord.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {formatDateIndo(ord.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.orderStatus === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'dikirim'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.orderStatus === 'diproses'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus.replace('_', ' ')}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPaid ? 'LUNAS' : 'MENUNGGU BAYAR'}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="py-4 divide-y divide-slate-100">
                    {ord.items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <Image
                              src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {quantity} barang x {formatRupiah(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {formatRupiah(product.price * quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-500">Total Pembayaran: </span>
                      <span className="font-black text-slate-900 text-sm sm:text-base ml-1">
                        {formatRupiah(ord.pricing.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPaid && (
                        <button
                          onClick={() => handlePayNow(ord.id, ord.invoiceNumber)}
                          disabled={payingOrderId === ord.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                        >
                          {payingOrderId === ord.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Menghubungkan...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar Sekarang</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setInvoiceQuery(ord.invoiceNumber);
                          setSearchedOrder(ord);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
                      >
                        Lacak Pengiriman
                      </button>

                      <Link
                        href={`/order-success/${ord.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>Detail & Faktur</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400">Memuat riwayat pesanan...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
