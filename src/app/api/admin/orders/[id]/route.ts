import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getOrderById, saveOrder } from '@/lib/db';

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// =============================================================
// PATCH /api/admin/orders/[id]
// Memperbarui status pesanan di database SQLite Prisma
// =============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus administrator.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { orderStatus, status, paymentStatus } = body;

    // Normalisasi status pesanan: PENDING, PAID, SHIPPED, COMPLETED
    let prismaStatus = 'PENDING';
    let appStatus: 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai' =
      'menunggu_pembayaran';

    const rawStatus = (orderStatus || status || '').toUpperCase();
    if (rawStatus === 'COMPLETED' || rawStatus === 'SELESAI') {
      prismaStatus = 'COMPLETED';
      appStatus = 'selesai';
    } else if (rawStatus === 'SHIPPED' || rawStatus === 'DIKIRIM') {
      prismaStatus = 'SHIPPED';
      appStatus = 'dikirim';
    } else if (rawStatus === 'PAID' || rawStatus === 'DIPROSES') {
      prismaStatus = 'PAID';
      appStatus = 'diproses';
    } else {
      prismaStatus = 'PENDING';
      appStatus = 'menunggu_pembayaran';
    }

    // 1. Update status tabel Order di Prisma SQLite
    await prisma.order.update({
      where: { id },
      data: {
        status: prismaStatus,
      },
    });

    // 2. Sinkronkan snapshot lengkap
    const existingOrder = await getOrderById(id);
    if (existingOrder) {
      existingOrder.orderStatus = appStatus;
      if (paymentStatus) {
        existingOrder.payment.status = paymentStatus;
        if (paymentStatus === 'paid' && !existingOrder.payment.paidAt) {
          existingOrder.payment.paidAt = new Date().toISOString();
        }
      } else if (
        prismaStatus === 'PAID' ||
        prismaStatus === 'SHIPPED' ||
        prismaStatus === 'COMPLETED'
      ) {
        existingOrder.payment.status = 'paid';
        if (!existingOrder.payment.paidAt) {
          existingOrder.payment.paidAt = new Date().toISOString();
        }
      }
      await saveOrder(existingOrder);
    }

    return NextResponse.json({
      success: true,
      message: `Status pesanan berhasil diperbarui ke ${prismaStatus}.`,
      data: existingOrder,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/orders/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal memperbarui status pesanan.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
