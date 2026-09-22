import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrderById, saveOrder } from '@/lib/db';
import { verifyWebhookNotification } from '@/lib/midtrans';

export const dynamic = 'force-dynamic';

// =============================================================
// POST /api/payment/notification
// Webhook listener Midtrans untuk menerima notifikasi status pembayaran
// =============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verifikasi payload notifikasi Midtrans
    const statusResponse = await verifyWebhookNotification(body);

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = statusResponse;

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'order_id tidak ditemukan pada payload.' },
        { status: 400 }
      );
    }

    console.log(
      `[Midtrans Webhook] Received notification for order_id: ${order_id}, status: ${transaction_status}, fraud: ${fraud_status}`
    );

    // 1. Temukan ID pesanan asli di SQLite Prisma
    let targetOrderId = order_id;
    let order = await prisma.order.findUnique({
      where: { id: targetOrderId },
    });

    // Jika order_id menggunakan suffix (contoh: ord-1790088083667-1234), potong suffix untuk menemukan ID dasar
    if (!order) {
      const baseId = targetOrderId.replace(/-[0-9]{4,}$/, '');
      order = await prisma.order.findUnique({
        where: { id: baseId },
      });
      if (order) {
        targetOrderId = baseId;
      }
    }

    // Fallback: cari di snapshot orders.json jika belum ditemukan
    let orderSnapshot = await getOrderById(targetOrderId);
    if (!order && !orderSnapshot) {
      const baseId = targetOrderId.replace(/-[0-9]{4,}$/, '');
      orderSnapshot = await getOrderById(baseId);
      if (orderSnapshot) {
        targetOrderId = baseId;
      }
    }

    if (!order && !orderSnapshot) {
      console.warn(`[Midtrans Webhook] Order ${order_id} tidak ditemukan di database.`);
      return NextResponse.json(
        { success: false, message: `Pesanan ${order_id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 2. Evaluasi status transaksi Midtrans
    let isPaid = false;
    let isCancelled = false;
    let prismaStatus = 'PENDING';
    let appOrderStatus: 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai' =
      'menunggu_pembayaran';

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        // Transaksi kartu kredit masih ditinjau
        prismaStatus = 'PENDING';
        appOrderStatus = 'menunggu_pembayaran';
      } else if (fraud_status === 'accept') {
        // Transaksi kartu kredit berhasil
        isPaid = true;
        prismaStatus = 'PAID';
        appOrderStatus = 'diproses';
      }
    } else if (transaction_status === 'settlement') {
      // Pembayaran berhasil lunas (QRIS, GoPay, Bank Transfer / VA, Alfamart/Indomaret)
      isPaid = true;
      prismaStatus = 'PAID';
      appOrderStatus = 'diproses';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      isCancelled = true;
      prismaStatus = 'CANCELLED';
    } else if (transaction_status === 'pending') {
      prismaStatus = 'PENDING';
      appOrderStatus = 'menunggu_pembayaran';
    }

    // 3. Update status pesanan di database Prisma SQLite
    if (order) {
      await prisma.order.update({
        where: { id: targetOrderId },
        data: {
          status: prismaStatus,
        },
      });
    }

    // 4. Update data snapshot orders.json
    if (orderSnapshot) {
      if (isPaid) {
        orderSnapshot.payment.status = 'paid';
        orderSnapshot.payment.paidAt = new Date().toISOString();
        orderSnapshot.orderStatus = 'diproses';
        if (payment_type) {
          orderSnapshot.payment.method = {
            ...orderSnapshot.payment.method,
            type: payment_type,
            name: `Midtrans (${payment_type.toUpperCase()})`,
          };
        }
      } else if (isCancelled) {
        orderSnapshot.payment.status = 'pending';
      }

      await saveOrder(orderSnapshot);
    }

    return NextResponse.json({
      success: true,
      message: `Status pesanan ${targetOrderId} berhasil disinkronkan ke ${prismaStatus}.`,
      data: {
        orderId: targetOrderId,
        status: prismaStatus,
        transactionStatus: transaction_status,
        isPaid,
        transactionId: transaction_id,
      },
    });
  } catch (error: any) {
    console.error('Error handling Midtrans notification:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal memproses notifikasi Midtrans.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
