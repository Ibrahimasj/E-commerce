import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, saveOrder } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.orderStatus) {
      order.orderStatus = body.orderStatus;
    }

    if (body.paymentStatus) {
      order.payment.status = body.paymentStatus;
      if (body.paymentStatus === 'paid' && !order.payment.paidAt) {
        order.payment.paidAt = new Date().toISOString();
      }
    }

    const updated = await saveOrder(order);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pesanan', error: String(error) },
      { status: 500 }
    );
  }
}
