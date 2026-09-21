import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrder } from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils';
import { Order } from '@/types';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pesanan', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, shipping, payment, pricing } = body;

    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return NextResponse.json(
        { success: false, message: 'Data pelanggan belum lengkap' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Keranjang belanja kosong' },
        { status: 400 }
      );
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      customer,
      items,
      shipping,
      payment: {
        method: payment.method,
        status: payment.status || 'pending',
        paidAt: payment.status === 'paid' ? new Date().toISOString() : undefined,
      },
      pricing,
      orderStatus: 'menunggu_pembayaran',
    };

    const saved = await saveOrder(newOrder);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat pesanan', error: String(error) },
      { status: 500 }
    );
  }
}
