import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase();
    const userId = searchParams.get('userId');
    const phoneParam = searchParams.get('phone')?.replace(/[^0-9]/g, '');
    const nameParam = searchParams.get('name')?.trim().toLowerCase();

    if (!email && !userId && !phoneParam && !nameParam) {
      return NextResponse.json(
        { success: false, message: 'Identitas pengguna diperlukan.' },
        { status: 400 }
      );
    }

    const allOrders = await getOrders();
    const userOrders = allOrders.filter((o) => {
      const matchEmail = email && o.customer?.email?.toLowerCase() === email;
      const matchUser = userId && o.customer?.userId === userId;
      const orderPhone = o.customer?.phone?.replace(/[^0-9]/g, '');
      const matchPhone =
        phoneParam && phoneParam.length >= 6 && orderPhone && orderPhone === phoneParam;
      const matchName =
        nameParam && nameParam.length >= 3 && o.customer?.fullName?.trim().toLowerCase() === nameParam;
      return matchEmail || matchUser || matchPhone || matchName;
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
