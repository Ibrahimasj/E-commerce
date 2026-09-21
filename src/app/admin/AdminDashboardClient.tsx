'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  Store,
  Layers,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Order, Product } from '@/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { CATEGORIES } from '@/data/constants';
import { useAuth } from '@/context/AuthContext';

interface AdminDashboardClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
}

export default function AdminDashboardClient({
  initialOrders,
  initialProducts,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Check and enforce Admin Access
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/admin/login');
      }
    }
  }, [user, isLoading, router]);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Elektronik',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '15',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    description: '',
    badge: 'Baru',
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai'
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newPaymentStatus: 'pending' | 'paid'
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, payment: { ...o.payment, status: newPaymentStatus } }
              : o
          )
        );
      }
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui status bayar');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.pricing.total, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const json = await res.json();
      if (json.success) {
        setProducts((prev) => [json.data, ...prev]);
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          category: 'Elektronik',
          price: '',
          originalPrice: '',
          discount: '',
          stock: '15',
          image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
          description: '',
          badge: 'Baru',
        });
      } else {
        alert(json.message || 'Gagal menambahkan produk');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menambahkan produk.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="py-28 text-center text-slate-400">
        Memverifikasi hak akses administrator...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            Panel Manajemen Toko
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
              Admin: {user.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Pengelola Toko NusaMart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau pesanan masuk secara real-time dan kelola stok katalog produk Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProductModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>

          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Omset Transaksi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Dari seluruh pesanan masuk
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Pesanan Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalOrdersCount} Pesanan
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            Semua transaksi tercatat
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Katalog Produk Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalProductsCount} Produk
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Tersedia untuk pembeli
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Pesanan ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Katalog Produk ({products.length})
        </button>
      </div>

      {/* Tab Content: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Belum Ada Pesanan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Pesanan yang dibuat oleh pelanggan melalui checkout akan otomatis muncul di tabel ini.
              </p>
              <Link
                href="/#katalog"
                className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Coba Belanja Produk
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-4">Invoice / Tanggal</th>
                    <th className="p-4">Pelanggan</th>
                    <th className="p-4">Barang Dipesan</th>
                    <th className="p-4">Kurir & Alamat</th>
                    <th className="p-4">Total & Bayar</th>
                    <th className="p-4">Status Pengiriman</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDateIndo(order.createdAt)}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{order.customer.fullName}</div>
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{order.customer.phone}</span>
                        </a>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="line-clamp-1 text-slate-800">
                              <span className="font-bold">{item.quantity}x</span> {item.product.name}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-bold text-slate-800">{order.shipping.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {order.customer.city} - {order.customer.address}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-sm">
                          {formatRupiah(order.pricing.total)}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mt-1 ${
                            order.payment.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.payment.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'} ({order.payment.method.type.toUpperCase()})
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-xl border cursor-pointer outline-none transition-all ${
                            order.orderStatus === 'selesai'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.orderStatus === 'dikirim'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.orderStatus === 'diproses'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="menunggu_pembayaran">Menunggu Bayar</option>
                          <option value="diproses">Sedang Diproses</option>
                          <option value="dikirim">Sedang Dikirim</option>
                          <option value="selesai">Selesai / Terkirim</option>
                        </select>
                        <div className="mt-1">
                          <button
                            onClick={() =>
                              handleUpdatePaymentStatus(
                                order.id,
                                order.payment.status === 'paid' ? 'pending' : 'paid'
                              )
                            }
                            className="text-[10px] text-emerald-600 hover:underline font-semibold block"
                          >
                            {order.payment.status === 'paid'
                              ? '↺ Tandai Belum Lunas'
                              : '✓ Tandai Lunas'}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap space-y-1">
                        <Link
                          href={`/orders?invoice=${order.invoiceNumber}`}
                          className="block text-center px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                        >
                          Lacak
                        </Link>
                        <Link
                          href={`/order-success/${order.id}`}
                          className="inline-flex items-center justify-center gap-1 w-full px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                        >
                          <span>Invoice</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga Normal</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full text-[10px] uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {p.stock} unit
                    </td>
                    <td className="p-4">
                      ⭐ {p.rating} ({p.reviewsCount})
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Link
                        href={`/products/${p.id}`}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-xs inline-flex items-center gap-1"
                      >
                        <span>Lihat di Toko</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Tambah Produk Baru */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setShowAddProductModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Tambah Produk Baru ke Katalog
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Produk akan langsung tersimpan di database lokal dan muncul pada katalog toko.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Earphone Wireless Bluetooth 5.4"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Coret Asli (Opsional)</label>
                  <input
                    type="number"
                    placeholder="350000"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar Produk (Unsplash / Web)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi keunggulan dan fitur produk..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {isSubmittingProduct ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
