import React from 'react';
import { getOrders, getProducts } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const revalidate = 0;

export default async function AdminPage() {
  const orders = await getOrders();
  const products = await getProducts();

  return <AdminDashboardClient initialOrders={orders} initialProducts={products} />;
}
