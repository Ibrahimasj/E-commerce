import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, toSafeUser } from '@/lib/auth';

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

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Akun belum terdaftar. Periksa kembali email, username, atau nomor HP Anda, atau silakan daftar akun baru.',
        },
        { status: 401 }
      );
    }

    // Direct password match for local demo
    if (user.passwordHash !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password yang Anda masukkan tidak sesuai. Silakan coba lagi.',
        },
        { status: 401 }
      );
    }

    // Role check if logging in via specific portal
    if (requiredRole && user.role !== requiredRole) {
      if (requiredRole === 'admin') {
        return NextResponse.json(
          {
            success: false,
            message: `Akses ditolak. Akun "${user.name}" (${user.email}) terdaftar sebagai Pelanggan, bukan Pengelola Toko. Silakan masuk melalui Halaman Login Pelanggan.`,
            isCustomerRedirect: true,
          },
          { status: 403 }
        );
      }
    }

    const safe = toSafeUser(user);
    return NextResponse.json({
      success: true,
      message: 'Berhasil masuk',
      user: safe,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi gangguan sistem saat login.' },
      { status: 500 }
    );
  }
}
