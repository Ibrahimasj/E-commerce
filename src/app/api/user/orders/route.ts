import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase();
    const userId = searchParams.get('userId');

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, message: 'Identitas pengguna (email atau userId) diperlukan.' },
        { status: 400 }
      );
    }

    const allOrders = await getOrders();
    const userOrders = allOrders.filter((o) => {
      const matchEmail = email && o.customer?.email?.toLowerCase() === email;
      const matchUser = userId && o.customer?.userId === userId;
      return matchEmail || matchUser;
    });

    return NextResponse.json({
      success: true,
      count: userOrders.length,
      data: userOrders,
    });
  } catch (error: any) {
    console.error('Fetch user orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil riwayat pesanan pengguna.' },
      { status: 500 }
    );
  }
}
