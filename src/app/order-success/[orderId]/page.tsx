import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/db';
import OrderSuccessClient from './OrderSuccessClient';

export const revalidate = 0;

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return <OrderSuccessClient initialOrder={order} />;
}
