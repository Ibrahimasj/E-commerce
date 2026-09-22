import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getOrders, getProducts } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function AdminPage() {
  // Proteksi server-side: Hanya user role ADMIN yang diizinkan mengakses
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== 'admin') {
    redirect('/admin/login');
  }

  const orders = await getOrders();
  const products = await getProducts();

  return <AdminDashboardClient initialOrders={orders} initialProducts={products} />;
}
