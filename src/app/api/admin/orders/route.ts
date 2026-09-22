import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function checkAdminAuth(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// =============================================================
// GET /api/admin/orders
// Mengambil seluruh pesanan semua pelanggan dari SQLite Prisma
// =============================================================
export async function GET(request: NextRequest) {
  try {
    const admin = checkAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Khusus administrator.' },
        { status: 403 }
      );
    }

    const orders = await getOrders();

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memuat seluruh data pesanan admin.',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
