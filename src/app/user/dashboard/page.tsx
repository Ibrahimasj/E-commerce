'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Truck,
  Receipt,
  Clock,
  CheckCircle2,
  LogOut,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user?.email || user?.id || user?.name) {
      fetchUserOrders(user.email || '', user.id || '', user.phone || '', user.name || '');
    }
  }, [user, isLoading, router]);

  const fetchUserOrders = async (
    email: string,
    userId: string,
    phone: string,
    name: string
  ) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `/api/user/orders?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="py-20 text-center text-slate-400">
        Memuat data akun Anda...
      </div>
    );
  }

  // If accidentally an admin visits customer dashboard, give notice
  if (user.role === 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Anda Masuk Sebagai Admin</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Halaman ini khusus untuk dashboard pelanggan umum. Silakan buka Dashboard Pengelola Toko Anda.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Buka Dashboard Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-600/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Pelanggan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pesanan Saya ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Data Profil & Alamat</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-slate-400">
              Memuat riwayat pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                Belum Ada Riwayat Belanja
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                Pesanan yang Anda buat akan otomatis tersimpan dan dapat dilacak kapan saja di halaman ini.
              </p>
              <Link
                href="/#katalog"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                <span>Mulai Belanja Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {order.invoiceNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      {formatDateIndo(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.orderStatus === 'selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'dikirim'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'diproses'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ').toUpperCase()}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.payment.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.payment.status === 'paid' ? 'LUNAS' : 'MENUNGGU BAYAR'}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-slate-100">
                  {order.items.map(({ product, quantity }) => (
                    <div key={product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
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

                {/* Actions & Total */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Tagihan:</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      {formatRupiah(order.pricing.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders?invoice=${order.invoiceNumber}`}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Lacak Pesanan</span>
                    </Link>

                    <Link
                      href={`/order-success/${order.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Lihat Invoice</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Profile & Address */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Informasi Akun Pribadi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nama Lengkap
              </span>
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email
              </span>
              <span className="text-sm font-bold text-slate-800">{user.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nomor WhatsApp / HP
              </span>
              <span className="text-sm font-bold text-slate-800">
                {user.phone || 'Belum diisi'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kota & Kode Pos
              </span>
              <span className="text-sm font-bold text-slate-800">
                {user.city || 'Jakarta'} {user.postalCode ? `(${user.postalCode})` : ''}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Alamat Pengiriman Utama
            </span>
            <p className="text-sm text-slate-800">
              {user.address || 'Belum ada alamat pengiriman tersimpan.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
