import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, city, postalCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal terdiri dari 6 karakter.' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'CUSTOMER',
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      city: city?.trim() || 'Jakarta Selatan',
      postalCode: postalCode?.trim() || '12340',
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran akun berhasil!',
        user: newUser,
      },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mendaftarkan akun baru.' },
      { status: 400 }
    );
  }
}
