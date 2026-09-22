import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserWithProfile, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: 'Sesi login tidak ditemukan.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, user: null, message: 'Token sesi tidak valid atau telah kedaluwarsa.' },
        { status: 401 }
      );
    }

    const safeUser = await getUserWithProfile(payload.id);
    if (!safeUser) {
      return NextResponse.json(
        { success: false, user: null, message: 'Pengguna tidak ditemukan di database.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { success: false, user: null, message: 'Gagal memverifikasi sesi login.' },
      { status: 500 }
    );
  }
}
