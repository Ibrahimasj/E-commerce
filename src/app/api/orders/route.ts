import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrder } from '@/lib/db';
import { generateInvoiceNumber } from '@/lib/utils';
import { Order } from '@/types';
import { PAYMENT_METHODS, SHIPPING_OPTIONS } from '@/data/constants';

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

    // Validate customer contact
    if (!customer?.fullName?.trim() || !customer?.phone?.trim() || !customer?.address?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Data pelanggan belum lengkap (Nama, No. HP, dan Alamat wajib diisi)' },
        { status: 400 }
      );
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Keranjang belanja Anda masih kosong' },
        { status: 400 }
      );
    }

    // Safely extract or fallback payment method
    let resolvedMethod = payment?.method || payment || PAYMENT_METHODS[0];
    if (!resolvedMethod || typeof resolvedMethod !== 'object' || !resolvedMethod.name) {
      resolvedMethod = PAYMENT_METHODS[0];
    }

    // Safely extract or fallback shipping
    let resolvedShipping = shipping || SHIPPING_OPTIONS[0];
    if (!resolvedShipping || typeof resolvedShipping !== 'object' || !resolvedShipping.name) {
      resolvedShipping = SHIPPING_OPTIONS[0];
    }

    // Safely calculate or fallback pricing
    const subtotal =
      pricing?.subtotal ??
      items.reduce(
        (sum: number, it: any) => sum + (it.product?.price || 0) * (it.quantity || 1),
        0
      );
    const shippingCost = pricing?.shippingCost ?? (resolvedShipping.cost || 0);
    const discountAmount = pricing?.discountAmount ?? 0;
    const grandTotal =
      pricing?.total ?? Math.max(0, subtotal - discountAmount + shippingCost);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || '',
        address: customer.address.trim(),
        city: customer.city?.trim() || 'Jakarta',
        postalCode: customer.postalCode?.trim() || '12340',
        notes: customer.notes?.trim() || '',
      },
      items,
      shipping: resolvedShipping,
      payment: {
        method: resolvedMethod,
        status: payment?.status || 'pending',
        paidAt: payment?.status === 'paid' ? new Date().toISOString() : undefined,
      },
      pricing: {
        subtotal,
        shippingCost,
        discountAmount,
        voucherCode: pricing?.voucherCode || undefined,
        total: grandTotal,
      },
      orderStatus: 'menunggu_pembayaran',
    };

    const saved = await saveOrder(newOrder);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    console.error('CRITICAL: Error in POST /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal membuat pesanan',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
