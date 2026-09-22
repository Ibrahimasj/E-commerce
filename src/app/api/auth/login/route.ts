import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByIdentifierWithProfile,
  verifyPassword,
  generateToken,
  COOKIE_NAME,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, requiredRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await getUserByIdentifierWithProfile(email);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Akun belum terdaftar. Periksa kembali email Anda atau silakan daftar akun baru.',
        },
        { status: 401 }
      );
    }

    const { user, safeUser } = result;

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password yang Anda masukkan tidak sesuai. Silakan coba lagi.',
        },
        { status: 401 }
      );
    }

    // Validasi role jika login melalui portal khusus (Admin vs Pelanggan)
    if (requiredRole && safeUser.role !== requiredRole.toLowerCase()) {
      if (requiredRole.toLowerCase() === 'admin') {
        return NextResponse.json(
          {
            success: false,
            message: `Akses ditolak. Akun "${user.name}" terdaftar sebagai Pelanggan, bukan Pengelola Toko. Silakan masuk melalui Halaman Login Pelanggan.`,
            isCustomerRedirect: true,
          },
          { status: 403 }
        );
      }
    }

    const token = generateToken({
      id: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Berhasil masuk',
      user: safeUser,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi gangguan sistem saat login.' },
      { status: 500 }
    );
  }
}
