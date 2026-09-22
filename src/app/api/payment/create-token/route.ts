import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrderById } from '@/lib/db';
import { createSnapToken } from '@/lib/midtrans';

export const dynamic = 'force-dynamic';

// =============================================================
// POST /api/payment/create-token
// Membuat Snap Token pembayaran Midtrans untuk suatu pesanan
// =============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'orderId wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Cari data pesanan di database Prisma SQLite
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    // Fallback: jika id yang dikirim adalah invoiceNumber atau mencari snapshot db
    const fullOrderSnapshot = await getOrderById(orderId);

    if (!order && fullOrderSnapshot) {
      order = await prisma.order.findUnique({
        where: { id: fullOrderSnapshot.id },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });
    }

    if (!order && !fullOrderSnapshot) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Periksa apakah sudah dibayar
    if (
      order?.status === 'PAID' ||
      fullOrderSnapshot?.payment?.status === 'paid'
    ) {
      return NextResponse.json(
        { success: false, message: 'Pesanan ini sudah lunas terbayar.' },
        { status: 400 }
      );
    }

    const grossAmount = order?.totalAmount ?? fullOrderSnapshot?.pricing?.total ?? 0;
    if (grossAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Total tagihan pesanan tidak valid.' },
        { status: 400 }
      );
    }

    // 2. Format parameter untuk Midtrans Snap
    const targetOrderId = order?.id || fullOrderSnapshot?.id || orderId;
    // Gunakan suffix timestamp unik agar jika user mencoba ulang bayar, Midtrans tidak menolak order_id duplikat
    const midtransOrderId = `${targetOrderId}-${Date.now().toString().slice(-4)}`;

    const customerName =
      fullOrderSnapshot?.customer?.fullName ||
      order?.user?.name ||
      'Pelanggan NusaMart';
    const customerEmail =
      fullOrderSnapshot?.customer?.email ||
      order?.user?.email ||
      'customer@nusamart.id';
    const customerPhone =
      fullOrderSnapshot?.customer?.phone || '08123456789';

    const items =
      fullOrderSnapshot?.items?.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
      })) ||
      order?.items?.map((it) => ({
        id: it.productId,
        name: it.product?.name || 'Produk',
        price: it.price,
        quantity: it.quantity,
      })) ||
      [];

    // 3. Buat token Snap Midtrans
    const snapResult = await createSnapToken({
      orderId: midtransOrderId,
      grossAmount,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: fullOrderSnapshot?.customer?.address,
        city: fullOrderSnapshot?.customer?.city,
        postalCode: fullOrderSnapshot?.customer?.postalCode,
      },
      items,
    });

    return NextResponse.json({
      success: true,
      token: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
      orderId: targetOrderId,
      midtransOrderId,
      grossAmount,
    });
  } catch (error: any) {
    console.error('Error creating Snap token:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal menghasilkan token pembayaran Midtrans.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
